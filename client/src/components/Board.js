import React from 'react';
import { withRouter } from 'react-router';
import io from 'socket.io-client';
import update from 'immutability-helper';
import Square from './Square';
import StatsBar from './StatsBar';
import Chat from './Chat';
import Loader from './Loader';
import Movement from '../chess-classes/Movement';
import Init from './helpers/Init';
import Help from './helpers/Help';
import Queen from '../chess-classes/pieces/Queen';
import '../stylesheets/Board.scss';
const colorRoute = '/get_color_46e5a98a-37a1-42d8-bb24-18be79ee95b0f99bf926-2b0a-4a82-a-da1833803723';

/**
 *Manages the state of the chess board.
 *
 * @export
 * @class Board
 * @extends {React.Component}
 */
class Board extends React.Component {
    /**
     *Creates an instance of Board.
     * @param {object} props
     * @memberof Board
     */
    constructor(props) {
        super(props);
        this.socket = null;                         // the websocket that this component will use to communicate with the server
        this.state = {
            loading: true,                          // whether this client is waiting for an opponent
            enemyLeft: null,                        // whether the enemy player has left the game
            youWon: null,                           // whether this player won the game
            youLost: null,                          // whether this player lost the game
            draw: null,                             // whether the game was a draw
            name: null,                             // the name of this player
            enemyName: null,                        // the name of the enemy player
            color: null,                            // the color of this player
            board: null,                            // an array representing the chess board
            highlighted: null,                      // the locations of highlighted spots on the board
            enemyHighlighted: null,                 // the locations of the enemy's highlighted spots on the board
            deadFriends: null,                      // the dead friendly pieces
            deadEnemies: null,                      // the dead enemy pieces
            selection: null,                        // the location of the selected piece
            enemySelection: null,                   // the location of the enemy's selected piece
            attackingFriendlyKing: null,            // the locations of the enemy pieces that have the friendly king in check
            attackingEnemyKing: null,               // the locations of the friendly pieces that have the enemy king in check
            moveArr: null,                          // the start and end location of the move that was just made
            promoteArr: null,                       // the start and end location of the pawn that was just promoted
            castleArr: null,                        // the start and end locations of the king and rook after a castle
            kingPos: null,                          // the position of the friendly king
            enemyKingPos: null,                     // the position of the enemy king
            ksRookPos: null,                        // the position of the kingside rook
            qsRookPos: null,                        // the position of the queenside rook
            turn: null,                             // whether it is this player's turn
            movedKing: null,                        // whether this player has moved their king
            movedKsRook: null,                      // whether this player has moved their kingside rook
            movedQsRook: null,                      // whether this player has moved their queenside rook
            justCastled: null,                      // whether this player just castled
            justPromoted: null,                     // whether one of this player's pawns was just promoted
            moves: null,                            // the chess codes of all the moves that have been made
            lastMove: null,                         // the chess code of the move that was just made
            letters: null,                          // the letters labeling the bottom of the board
            nums: null                              // the numbers labeling the side of the board
        }
        this.initSocket = this.initSocket.bind(this);
        this.handleColorSet = this.handleColorSet.bind(this);
        this.handleEnemyConnection = this.handleEnemyConnection.bind(this);
        this.handleEnemyNameReceival = this.handleEnemyNameReceival.bind(this);
        this.sendName = this.sendName.bind(this);
        this.handleIncomingBoardUpdate = this.handleIncomingBoardUpdate.bind(this);
        this.checkForCheckmate = this.checkForCheckmate.bind(this);
        this.handleEnemyLeft = this.handleEnemyLeft.bind(this);
        this.handleVictory = this.handleVictory.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.handleResign = this.handleResign.bind(this);
        this.handleDrawRequest = this.handleDrawRequest.bind(this);
        this.handleIncomingDrawRequest = this.handleIncomingDrawRequest.bind(this);
        this.handleDraw = this.handleDraw.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.attemptSelect = this.attemptSelect.bind(this);
        this.unselect = this.unselect.bind(this);
        this.movePiece = this.movePiece.bind(this);
        this.promote = this.promote.bind(this);
        this.castle = this.castle.bind(this);
        this.hasKingJustMoved = this.hasKingJustMoved.bind(this);
        this.hasKsRookJustMoved = this.hasKsRookJustMoved.bind(this);
        this.hasQsRookJustMoved = this.hasQsRookJustMoved.bind(this);
        this.whichHighlight = this.whichHighlight.bind(this);
        this.updateAttackers = this.updateAttackers.bind(this);
        this.sendUpdate1 = this.sendUpdate1.bind(this);
        this.sendUpdate2 = this.sendUpdate2.bind(this);
    }

    componentDidMount() {
        // try to load the color from local storage
        let color = localStorage.getItem('color') === null ? null : JSON.parse(localStorage.getItem('color'));
        if (color === 'white' || color === 'black') {
            // restore the state from local storage
            this.restoreStateFromLocalStorage();
            // add an event listener that will save the state to local storage before the window unloads
            window.addEventListener('beforeunload', this.saveStateToLocalStorage);
        } else {
            // fetch the color from the server and init the socket connection and board
            fetch(colorRoute)
                .then(res => res.json())
                .then(res => {
                    this.handleColorSet(res.color);
                    this.initSocket();
                    // add an event listener that will save the state to local storage before the window unloads
                    window.addEventListener('beforeunload', this.saveStateToLocalStorage);
                })
                .catch(err => console.log(err));
        }
        // make sure that game state and socket connections are cleaned up when the user navigates away from this page
        window.onpopstate = this.cleanup;
    }

    componentWillUnmount() {
        // if the component gets a chance to unmount, remove the event listener 
        // and save the state to local storage
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
        this.saveStateToLocalStorage();
    }

    /**
     *Sets up the socket connection with the server.
     *
     * @memberof Board
     */
    initSocket() {
        // create the socket
        this.socket = io();

        // listen for an enemy connection
        this.socket.on('enemy-connected', this.handleEnemyConnection);

        // listen for the enemy name
        this.socket.on('incoming-enemy-name', this.handleEnemyNameReceival);

        // listen for incoming board updates and update the state when they are received
        this.socket.on('incoming-board-update', this.handleIncomingBoardUpdate);

        // listen for the other player leaving
        this.socket.on('enemy-left', this.handleEnemyLeft);

        // listening for a draw request
        this.socket.on('incoming-draw-request', this.handleIncomingDrawRequest);

        // listen for the refusal of a draw request
        this.socket.on('incoming-draw-refusal', () => window.alert('Your opponent did not accept your draw request.'));

        // listen for the match being a draw
        this.socket.on('match-was-draw', this.handleDraw);

        // listen for winning
        this.socket.on('you-won', this.handleVictory);
    }

    /**
     *Saves the state of the game to local storage before the window unloads.
     *
     * @memberof Board
     */
    saveStateToLocalStorage() {
        localStorage.setItem('loading', JSON.stringify(this.state.loading));
        if (this.state.enemyLeft !== null) {
            localStorage.setItem('enemyLeft', JSON.stringify(this.state.enemyLeft));
        }
        if (this.state.youWon !== null) {
            localStorage.setItem('youWon', JSON.stringify(this.state.youWon));
        }
        if (this.state.youLost !== null) {
            localStorage.setItem('youLost', JSON.stringify(this.state.youLost));
        }
        if (this.state.draw !== null) {
            localStorage.setItem('draw', JSON.stringify(this.state.draw));
        }
        if (this.state.name !== null) {
            localStorage.setItem('name', JSON.stringify(this.state.name));
        }
        if (this.state.enemyName !== null) {
            localStorage.setItem('enemyName', JSON.stringify(this.state.enemyName));
        }
        if (this.state.color !== null) {
            localStorage.setItem('color', JSON.stringify(this.state.color));
        }
        if (this.state.board !== null) {
            localStorage.setItem('board', JSON.stringify(this.state.board, (key, value) => {
                if (key === 'src' || key === 'id') return undefined;
                else return value;
            }));
        }
        if (this.state.highlighted !== null) {
            localStorage.setItem('highlighted', JSON.stringify([...this.state.highlighted]));
        }
        if (this.state.enemyHighlighted !== null) {
            localStorage.setItem('enemyHighlighted', JSON.stringify([...this.state.enemyHighlighted]));
        }
        if (this.state.deadFriends !== null) {
            localStorage.setItem('deadFriends', JSON.stringify(this.state.deadFriends));
        }
        if (this.state.deadEnemies !== null) {
            localStorage.setItem('deadEnemies', JSON.stringify(this.state.deadEnemies));
        }
        if (this.state.selection !== null) {
            localStorage.setItem('selection', JSON.stringify(this.state.selection));
        }
        if (this.state.enemySelection !== null) {
            localStorage.setItem('enemySelection', JSON.stringify(this.state.enemySelection));
        }
        if (this.state.attackingFriendlyKing !== null) {
            localStorage.setItem('attackingFriendlyKing', JSON.stringify([...this.state.attackingFriendlyKing]));
        }
        if (this.state.attackingEnemyKing !== null) {
            localStorage.setItem('attackingEnemyKing', JSON.stringify([...this.state.attackingEnemyKing]));
        }
        if (this.state.moveArr !== null) {
            localStorage.setItem('moveArr', JSON.stringify(this.state.moveArr));
        }
        if (this.state.castleArr !== null) {
            localStorage.setItem('castleArr', JSON.stringify(this.state.castleArr));
        }
        if (this.state.kingPos !== null) {
            localStorage.setItem('kingPos', JSON.stringify(this.state.kingPos));
        }
        if (this.state.enemyKingPos !== null) {
            localStorage.setItem('enemyKingPos', JSON.stringify(this.state.enemyKingPos));
        }
        if (this.state.ksRookPos !== null) {
            localStorage.setItem('ksRookPos', JSON.stringify(this.state.ksRookPos));
        }
        if (this.state.qsRookPos !== null) {
            localStorage.setItem('qsRookPos', JSON.stringify(this.state.qsRookPos));
        }
        if (this.state.turn !== null) {
            localStorage.setItem('turn', JSON.stringify(this.state.turn));
        }
        if (this.state.movedKing !== null) {
            localStorage.setItem('movedKing', JSON.stringify(this.state.movedKing));
        }
        if (this.state.movedKsRook !== null) {
            localStorage.setItem('movedKsRook', JSON.stringify(this.state.movedKsRook));
        }
        if (this.state.movedQsRook !== null) {
            localStorage.setItem('movedQsRook', JSON.stringify(this.state.movedQsRook));
        }
        if (this.state.moves !== null) {
            localStorage.setItem('moves', JSON.stringify(this.state.moves));
        }
        if (this.state.lastMove !== null) {
            localStorage.setItem('lastMove', JSON.stringify(this.state.lastMove));
        }
        if (this.state.letters !== null) {
            localStorage.setItem('letters', JSON.stringify(this.state.letters));
        }
        if (this.state.nums !== null) {
            localStorage.setItem('nums', JSON.stringify(this.state.nums));
        }
    }

    /**
     *Restores the state of the game from local storage.
     *
     * @memberof Board
     */
    restoreStateFromLocalStorage() {
        let restoredState = {};
        if (localStorage.getItem('loading') !== null) {
            restoredState.loading = JSON.parse(localStorage.getItem('loading'));
        }
        if (localStorage.getItem('enemyLeft') !== null) {
            restoredState.enemyLeft = JSON.parse(localStorage.getItem('enemyLeft'));
        }
        if (localStorage.getItem('youWon') !== null) {
            restoredState.youWon = JSON.parse(localStorage.getItem('youWon'));
        }
        if (localStorage.getItem('youLost') !== null) {
            restoredState.youLost = JSON.parse(localStorage.getItem('youLost'));
        }
        if (localStorage.getItem('draw') !== null) {
            restoredState.draw = JSON.parse(localStorage.getItem('draw'));
        }
        if (localStorage.getItem('name') !== null) {
            restoredState.name = JSON.parse(localStorage.getItem('name'));
        }
        if (localStorage.getItem('enemyName') !== null) {
            restoredState.enemyName = JSON.parse(localStorage.getItem('enemyName'));
        }
        if (localStorage.getItem('color') !== null) {
            restoredState.color = JSON.parse(localStorage.getItem('color'));
        }
        if (localStorage.getItem('board') !== null) {
            let board = JSON.parse(localStorage.getItem('board')).map(obj => Help.createSpot(obj));
            if (board.length > 63) restoredState.board = board;
        }
        if (localStorage.getItem('highlighted') !== null) {
            restoredState.highlighted = new Set();
            JSON.parse(localStorage.getItem('highlighted')).forEach(position => {
                restoredState.highlighted.add(position);
            });
        }
        if (localStorage.getItem('enemyHighlighted') !== null) {
            restoredState.enemyHighlighted = new Set();
            JSON.parse(localStorage.getItem('enemyHighlighted')).forEach(position => {
                restoredState.enemyHighlighted.add(position);
            });
        }
        if (localStorage.getItem('deadFriends') !== null) {
            restoredState.deadFriends = JSON.parse(localStorage.getItem('deadFriends'));
        }
        if (localStorage.getItem('deadEnemies') !== null) {
            restoredState.deadEnemies = JSON.parse(localStorage.getItem('deadEnemies'));
        }
        if (localStorage.getItem('selection') !== null) {
            restoredState.selection = JSON.parse(localStorage.getItem('selection'));
        }
        if (localStorage.getItem('enemySelection') !== null) {
            restoredState.enemySelection = JSON.parse(localStorage.getItem('enemySelection'));
        }
        if (localStorage.getItem('attackingFriendlyKing') !== null) {
            restoredState.attackingFriendlyKing = new Set();
            JSON.parse(localStorage.getItem('attackingFriendlyKing')).forEach(position => {
                restoredState.attackingFriendlyKing.add(position)
            });
        }
        if (localStorage.getItem('attackingEnemyKing') !== null) {
            restoredState.attackingEnemyKing = new Set();
            JSON.parse(localStorage.getItem('attackingEnemyKing')).forEach(position => {
                restoredState.attackingEnemyKing.add(position);
            });
        }
        if (localStorage.getItem('moveArr') !== null) {
            restoredState.moveArr = JSON.parse(localStorage.getItem('moveArr'));
        }
        if (localStorage.getItem('castleArr') !== null) {
            restoredState.castleArr = JSON.parse(localStorage.getItem('castleArr'));
        }
        if (localStorage.getItem('kingPos') !== null) {
            restoredState.kingPos = JSON.parse(localStorage.getItem('kingPos'));
        }
        if (localStorage.getItem('enemyKingPos') !== null) {
            restoredState.enemyKingPos = JSON.parse(localStorage.getItem('enemyKingPos'));
        }
        if (localStorage.getItem('ksRookPos') !== null) {
            restoredState.ksRookPos = JSON.parse(localStorage.getItem('ksRookPos'));
        }
        if (localStorage.getItem('qsRookPos') !== null) {
            restoredState.qsRookPos = JSON.parse(localStorage.getItem('qsRookPos'));
        }
        if (localStorage.getItem('turn') !== null) {
            restoredState.turn = JSON.parse(localStorage.getItem('turn'));
        }
        if (localStorage.getItem('movedKing') !== null) {
            restoredState.movedKing = JSON.parse(localStorage.getItem('movedKing'));
        }
        if (localStorage.getItem('movedKsRook') !== null) {
            restoredState.movedKsRook = JSON.parse(localStorage.getItem('movedKsRook'));
        }
        if (localStorage.getItem('movedQsRook') !== null) {
            restoredState.movedQsRook = JSON.parse(localStorage.getItem('movedQsRook'));
        }
        if (localStorage.getItem('moves') !== null) {
            restoredState.moves = JSON.parse(localStorage.getItem('moves'));
        }
        if (localStorage.getItem('lastMove') !== null) {
            restoredState.lastMove = JSON.parse(localStorage.getItem('lastMove'));
        }
        if (localStorage.getItem('letters') !== null) {
            restoredState.letters = JSON.parse(localStorage.getItem('letters'));
        }
        if (localStorage.getItem('nums') !== null) {
            restoredState.nums = JSON.parse(localStorage.getItem('nums'));
        }

        // set the state and then initialize the socket connection
        this.setState(restoredState, this.initSocket);
    }

    /**
     *Callback for when this player first receives their color.
     *
     * @param {string} color - The color of this player.
     * @memberof Board
     */
    handleColorSet(color) {
        // if the color has already been set, do nothing
        if (this.state.color === 'white' || this.state.color === 'black' ||
            localStorage.getItem('color') !== null) return;

        // retireve the name of this user from local storage
        let name = (localStorage.getItem('name') !== null ? JSON.parse(localStorage.getItem('name')) :
            ('Guest ' + (Math.floor(Math.random() * 90000) + 10000)));
        // set the initial state of the game
        this.setState({
            enemyLeft: false,
            youWon: false,
            youLost: false,
            draw: false,
            name: name,
            color: color,
            board: Init.initBoard(color),
            highlighted: new Set(),
            enemyHighlighted: new Set(),
            deadFriends: [],
            deadEnemies: [],
            selection: -1,
            enemySelection: -1,
            attackingFriendlyKing: new Set(),
            attackingEnemyKing: new Set(),
            moveArr: [],
            promoteArr: [],
            castleArr: [],
            kingPos: Init.initKingPos(color),
            enemyKingPos: Init.initEnemyKingPos(color),
            ksRookPos: Init.initKsRookPos(color),
            qsRookPos: Init.initQsRookPos(color),
            turn: Init.initTurn(color),
            movedKing: false,
            movedKsRook: false,
            movedQsRook: false,
            justCastled: false,
            justPromoted: false,
            moves: [],
            lastMove: '',
            letters: Init.initLetters(color),
            nums: Init.initNumbers(color)
        });
    }

    /**
     *Handles when an enemy joins the game. Updates the state so that the board is rendered.
     *
     * @memberof Board
     */
    handleEnemyConnection() {
        this.setState({ loading: false }, this.sendName);
    }

    /**
     *Sends the name of this player to the enemy player.
     *
     * @memberof Board
     */
    sendName() {
        if (this.socket === null) return;
        this.socket.emit('outgoing-name', JSON.parse(localStorage.getItem('name')));
    }

    /**
     *Handles when this player recieves the name of the enemy player.
     *
     * @param {string} name - The name of the enemy player.
     * @memberof Board
     */
    handleEnemyNameReceival(name) {
        // only update the state if this is the first time this player has received the enemy name
        if (localStorage.getItem('enemyName') === null || localStorage.getItem('enemyName') === '')
            this.setState({ enemyName: name });
    }

    /**
     *Callback for when this player receives a board update from the enemy.
     *
     * @param {object} data - The object containing the updated state information.
     * @memberof Board
     */
    handleIncomingBoardUpdate(data) {
        let stateUpdate = {};

        // update the state fields that were sent from the enemy
        if (data.turn) {
            stateUpdate.turn = data.turn;
        }
        if (data.enemySelection) {
            if (data.enemySelection === -1) stateUpdate.enemySelection = -1;
            else stateUpdate.enemySelection = Help.convertPos(data.enemySelection);
        }
        if (data.enemyHighlighted) {
            let enemyHigh = new Set();
            data.enemyHighlighted.forEach(pos => enemyHigh.add(Help.convertPos(pos)));
            stateUpdate.enemyHighlighted = enemyHigh;
        }
        if (data.enemyKingPos) {
            stateUpdate.enemyKingPos = Help.convertPos(data.enemyKingPos);
        }
        if (data.attackingEnemyKing) {
            let attackEnemy = new Set();
            data.attackingEnemyKing.forEach(pos => attackEnemy.add(Help.convertPos(pos)));
            stateUpdate.attackingEnemyKing = attackEnemy;
        }
        if (data.attackingFriendlyKing) {
            let attackFriendly = new Set();
            data.attackingFriendlyKing.forEach(pos => attackFriendly.add(Help.convertPos(pos)));
            stateUpdate.attackingFriendlyKing = attackFriendly;
        }
        if (data.code) {
            stateUpdate.moves = [...this.state.moves].concat(data.code);
        }

        // if a move was made on the board we will update the board as well
        if (data.move) {

            // convert the positions
            let a = Help.convertPos(data.move[0]);
            let b = Help.convertPos(data.move[1]);
            let selectedPiece = this.state.board[a].piece;

            // if this move killed a friendly piece
            if (this.state.board[b].piece !== null) {
                // find the dead piece and update the state
                let dead = this.state.board[b].piece.pieceType;
                this.setState(prevState => ({
                    ...stateUpdate,
                    deadFriends: prevState.deadFriends.concat((prevState.color === 'white' ?
                        'w' + dead : 'b' + dead)),
                    board: update(prevState.board, {
                        $apply: board => board.map((spot, i) => {
                            if (i === b) spot.piece = selectedPiece;
                            else if (i === a) spot.piece = null;
                            return spot;
                        })
                    })
                }), this.checkForCheckmate);
                // check if this move put this player in checkmate
            }

            // if this move did not kill a friendly piece
            else {
                // update the state
                this.setState(prevState => ({
                    ...stateUpdate,
                    board: update(prevState.board, {
                        $apply: board => board.map((spot, i) => {
                            if (i === b) spot.piece = selectedPiece;
                            else if (i === a) spot.piece = null;
                            return spot;
                        })
                    })
                }), this.checkForCheckmate);
                // check if this move put this player in checkmate
            }
        }

        // if an enemy pawn was just promoted
        else if (data.promotion) {

            // convert the positions
            let a = Help.convertPos(data.promotion[0]);
            let b = Help.convertPos(data.promotion[1]);

            // if this move killed a friendly piece
            if (this.state.board[b].piece !== null) {
                // find the dead piece and update the state
                let dead = this.state.board[b].piece.pieceType;
                this.setState(prevState => ({
                    ...stateUpdate,
                    deadFriends: prevState.deadFriends.concat((prevState.color === 'white' ?
                        'w' + dead : 'b' + dead)),
                    board: update(prevState.board, {
                        $apply: board => board.map((spot, i) => {
                            if (i === b) spot.piece = new Queen(false, prevState.color);
                            else if (i === a) spot.piece = null;
                            return spot;
                        })
                    })
                }), this.checkForCheckmate);
            }

            // if this move did not kill an enemy piece
            else {
                // update the state
                this.setState(prevState => ({
                    ...stateUpdate,
                    board: update(prevState.board, {
                        $apply: board => board.map((spot, i) => {
                            if (i === b) spot.piece = new Queen(false, prevState.color);
                            else if (i === a) spot.piece = null;
                            return spot;
                        })
                    })
                }), this.checkForCheckmate);
            }
        }

        // if a castle was made we will update the board as well
        else if (data.castle) {

            // get the start and end positions of the enemy king and rook
            let kingStart = data.castle[0];
            let kingEnd = data.castle[1];
            let rookStart = data.castle[2];
            let rookEnd = data.castle[3];

            // get references to the enemy king and rook
            let king = this.state.board[kingStart].piece;
            let rook = this.state.board[rookStart].piece;

            // update the state
            this.setState(prevState => ({
                ...stateUpdate,
                board: update(prevState.board, {
                    $apply: board => board.map((spot, i) => {
                        if (i === kingStart) spot.piece = null;
                        else if (i === kingEnd) spot.piece = king;
                        else if (i === rookStart) spot.piece = null;
                        else if (i === rookEnd) spot.piece = rook;
                        return spot;
                    })
                })
            }), this.checkForCheckmate);
            // check if this move put this player in checkmate
        }

        // if no move, promotion or castle was made we do not need to update the board,
        // however, we still must update the state
        // in this case we also do not need to check if this player is in checkmate because no move was made
        else this.setState(stateUpdate);
    }

    /**
     *Checks if this player is in checkmate.
     *
     * @memberof Board
     */
    checkForCheckmate() {
        // if this player is not in check, they must not be in checkmate
        if (this.state.attackingFriendlyKing.size === 0) return;

        // if this player is in checkmate, they have lost the game
        if (Movement.inCheckMate(this.state.board, this.state.kingPos, this.state.attackingFriendlyKing)) {

            // tell the enemy that they have won and force disconnect the socket
            if (this.socket !== null) this.socket.emit('i-lost');
            this.socket = null;

            // update the state and let this user know that they have lost
            this.setState({ youLost: true }, () => this.informUser('youLost'));
        }
    }

    /**
     *Callback for when this user wins.
     *
     * @memberof Board
     */
    handleVictory() {
        // disconnect this socket
        if (this.socket !== null) this.socket.emit('secondary-disconnect');
        this.socket = null;

        // update the state and inform the user that they have won
        this.setState({ youWon: true }, () => this.informUser('youWon'));
    }

    /**
     *Callback for when the enemy leaves the game.
     *
     * @memberof Board
     */
    handleEnemyLeft() {
        // disconnect the socket
        if (this.socket !== null) this.socket.emit('secondary-disconnect');
        this.socket = null;

        // set that the enemy has left
        this.setState({ enemyLeft: true }, () => this.informUser('enemyLeft'));
    }

    /**
     *Callback for when the player clicks the resign button.
     *
     * @memberof Board
     */
    handleResign() {
        // if the user called this to exit the window
        if (this.state.enemyLeft || this.state.youWon || this.state.youLost || this.state.draw) {
            // navigate back without a prompt
            this.props.history.goBack();
            return;
        }

        // make sure the user really wants to resign
        if (!window.confirm('Are you sure you want to resign? If you do you will lose the game.'))
            return;

        // navigate back to the main page
        this.props.history.goBack();

        // upon backward navigation, this.cleanup will be called and will clear local storage 
        // and force-disconnect the socket
    }

    /**
     *Handles when this user receives a draw request that the other user sent.
     *
     * @memberof Board
     */
    handleIncomingDrawRequest() {
        if (window.confirm('Your opponent has requested for this match to be a draw. By clicking \'ok\' ' +
            'you are accepting this request and the match will be ruled a draw.')) {
            // let the enemy know that this match is a draw
            if (this.socket !== null) this.socket.emit('its-a-draw');

            // update the state and inform the user that the match was a draw
            this.setState({ draw: true }, () => this.informUser('draw'));
        }
        else if (this.socket !== null) this.socket.emit('outgoing-draw-refusal');
    }

    /**
     *Handles when this user is making a draw request.
     *
     * @memberof Board
     */
    handleDrawRequest() {
        // confirm that the user wants to request a draw
        if (!window.confirm('Are you sure you want to request a draw? By clicking \'ok\' ' +
            'a request will be sent to your opponent.')) return;

        // send the request to the enemy
        if (this.socket !== null) this.socket.emit('outgoing-draw-request');
    }

    /**
     *Handles when this user receives an update stating that the match is officially a draw.
     *
     * @memberof Board
     */
    handleDraw() {
        // update the state and inform this user that the match was a draw
        this.setState({ draw: true }, () => this.informUser('draw'));
        // disconnect the socket
        if (this.socket !== null) this.socket.emit('secondary-disconnect');
        this.socket = null;
    }

    /**
     *Handles when the user wants to leave the game.
     *
     * @memberof Board
     */
    handleExit() {
        // go back to the main page
        this.props.history.goBack();

        // upon backward navigation, this.cleanup will be called and will clear local storage 
        // and force-disconnect the socket
    }

    /**
     *Informs the user that the game is over and why it ended.
     *
     * @param {string} message - The reason the game is over.
     * @memberof Board
     */
    informUser(message) {
        switch (message) {
            case 'enemyLeft':
                window.alert('Your opponent has left the game. You win! ' +
                    'You may view the final game board or click the exit button' +
                    ' to return to the main page.');
                return;
            case 'youWon':
                window.alert('You won the game! You may view the final game' +
                    ' board or click the exit button to return to the main page.');
                return;
            case 'youLost':
                window.alert('You lost the game. You may view the final game' +
                    ' board or click the exit button to return to the main page.');
                return;
            case 'draw':
                window.alert('It\'s a draw! You may view the final game' +
                    ' board or click the exit button to return to the main page.');
                return;
            default:
                return;
        }
    }

    /**
     *Disconnects the socket and clears local storage.
     *
     * @memberof Board
     */
    cleanup() {
        // when this socket disconnects, the server will do all the necessary socket cleanup 
        // and inform the other player that this player left
        // tell the server to disconnect this socket
        if (this.socket !== null) this.socket.emit('force-disconnect');

        // clear local storage in order to remove all state info of this game
        localStorage.clear();
    }

    /**
     *Handles when the player presses a square on the board.
     *
     * @param {number} position - The location of the square where the mouse was pressed.
     * @memberof Board
     */
    handleMouseDown(position) {
        // if it is not this player's turn they cannot do anything to the board
        if (!this.state.turn) return;

        // if there is no piece currently selected 
        if (this.state.selection === -1) this.attemptSelect(position);

        // if there is a piece currently selected
        else {

            // if the person clicked on the piece that is selected, unselect it
            if (this.state.selection === position) {
                this.unselect();
                return;
            }

            // if the selected piece is a king, check if the player is trying to castle
            if (this.state.board[this.state.selection].piece.pieceType === 'King') {

                // if the player selected the kingside castle location and it is possible to kingside castle
                // perform a kingside castle
                if (((this.state.color === 'white' && position === this.state.kingPos + 2) ||
                    (this.state.color === 'black' && position === this.state.kingPos - 2)) &&
                    Movement.canKsCastle(this.state.color, this.state.kingPos, this.state.board,
                        this.state.movedKing, this.state.movedKsRook, this.state.attackingFriendlyKing)) {
                    this.castle('ks');
                    return;
                }

                // if the player selected the queenside castle location and it is possible to queenside castle
                // perform a queenside castle
                if (((this.state.color === 'white' && position === this.state.kingPos - 2) ||
                    (this.state.color === 'black' && position === this.state.kingPos + 2)) &&
                    Movement.canQsCastle(this.state.color, this.state.kingPos, this.state.board,
                        this.state.movedKing, this.state.movedQsRook, this.state.attackingFriendlyKing)) {
                    this.castle('qs');
                    return;
                }
            }

            // if the selection cannot move to this position, do nothing
            if (this.state.board[this.state.selection].piece === null || !Movement.canMove(this.state.board[this.state.selection],
                this.state.board[position], this.state.board, this.state.kingPos, this.state.attackingFriendlyKing)) return;

            // move the piece to the specified location
            if (this.state.board[this.state.selection].piece.pieceType === 'Pawn' && position < 8) this.promote(position);
            else this.movePiece(position);
        }
    }

    /**
     *Attempts to select the position clicked by the user.
     *
     * @param {number} position - The position on the chess board of the square that the user selected.
     * @memberof Board
     */
    attemptSelect(position) {
        // if they clicked on a spot with no piece or if they clicked on a spot with a non-friendly 
        // piece, do nothing
        if (this.state.board[position].piece === null || !this.state.board[position].piece.friendly) return;

        // figure out which positions need to be highlighted
        let toHighlight = this.whichHighlight(position);

        // set the state with the selected position and the highlighted spots
        // and then send the update to the enemy
        this.setState({
            selection: position,
            highlighted: toHighlight
        }, this.sendUpdate2);
    }

    /**
     *Unselects the currently selected position.
     *
     * @memberof Board
     */
    unselect() {
        // update the state and then send the update to the enemy
        this.setState({
            selection: -1,
            highlighted: new Set()
        }, this.sendUpdate2);
    }

    /**
     *Moves the piece that is selected to position.
     *
     * @param {number} position - The position that the piece is being moved to.
     * @memberof Board
     */
    movePiece(position) {
        // determine the new king position
        let newKingPos = (this.state.board[this.state.selection].piece.pieceType === 'King' ?
            position : this.state.kingPos);

        // determine whether the king has been moved
        let kingHasMoved = this.hasKingJustMoved(newKingPos);

        // determine whether the kingside rook has moved
        let ksMoved = this.hasKsRookJustMoved();

        // determine whether the queenside rook has moved
        let qsMoved = this.hasQsRookJustMoved();

        // get the piece that is being moved
        let selectedPiece = this.state.board[this.state.selection].piece;

        // get the chess code of this move
        let code = Help.getNumLetterCode(position, selectedPiece.pieceType, this.state.color);

        // if there is an enemy piece at this location, it is now dead
        if (this.state.board[position].piece !== null) {

            // get the piece that is being killed
            let dead = this.state.board[position].piece.pieceType;

            // update the board accordingly
            this.setState(prevState => ({
                turn: false,
                selection: -1,
                justCastled: false,
                justPromoted: false,
                moveArr: [prevState.selection, position],
                attackingFriendlyKing: new Set(),
                kingPos: newKingPos,
                movedKing: kingHasMoved,
                movedKsRook: ksMoved,
                movedQsRook: qsMoved,
                deadEnemies: prevState.deadEnemies.concat((prevState.color === 'white' ?
                    'b' + dead : 'w' + dead)),
                highlighted: new Set(),
                moves: prevState.moves.concat(code),
                lastMove: code,
                board: update(prevState.board, {
                    $apply: board => board.map((spot, i) => {
                        if (i === position) spot.piece = selectedPiece;
                        else if (i === prevState.selection) spot.piece = null;
                        return spot;
                    })
                })
            }), this.updateAttackers);

            // when the state is done being updated, the set of attackers
            // will be updated
        }

        // if this move does not kill an enemy
        else {

            // update the board accordingly
            this.setState(prevState => ({
                turn: false,
                selection: -1,
                justCastled: false,
                justPromoted: false,
                moveArr: [prevState.selection, position],
                attackingFriendlyKing: new Set(),
                kingPos: newKingPos,
                movedKing: kingHasMoved,
                movedKsRook: ksMoved,
                movedQsRook: qsMoved,
                highlighted: new Set(),
                moves: prevState.moves.concat(code),
                lastMove: code,
                board: update(prevState.board, {
                    $apply: board => board.map((spot, i) => {
                        if (i === position) spot.piece = selectedPiece;
                        else if (i === prevState.selection) spot.piece = null;
                        return spot;
                    })
                })
            }), this.updateAttackers);

            // when the state is done being updated, the set of attackers
            // will be updated
        }
    }

    /**
     *Promotes a pawn that has reached the end of the board to a queen.
     *
     * @param {number} position - The position where the new queen will be.
     * @memberof Board
     */
    promote(position) {
        // get the chess code of this move
        let code = Help.getNumLetterCode(position, this.state.board[this.state.selection].piece.pieceType, this.state.color);

        // if this move is killing an enemy piece
        if (this.state.board[this.state.selection].piece !== null) {

            // get the piece that is being killed
            let dead = this.state.board[position].piece.pieceType;

            // update the board accordingly
            this.setState(prevState => ({
                turn: false,
                selection: -1,
                justCastled: false,
                justPromoted: true,
                promoteArr: [prevState.selection, position],
                attackingFriendlyKing: new Set(),
                deadEnemies: prevState.deadEnemies.concat((prevState.color === 'white' ?
                    'b' + dead : 'w' + dead)),
                highlighted: new Set(),
                moves: prevState.moves.concat(code),
                lastMove: code,
                board: update(prevState.board, {
                    $apply: board => board.map((spot, i) => {
                        if (i === position) spot.piece = new Queen(true, prevState.color);
                        else if (i === prevState.selection) spot.piece = null;
                        return spot;
                    })
                })
            }), this.updateAttackers);

            // when the state is done being updated, the set of attackers
            // will be updated
        }

        // if this move does not kill an enemy
        else {
            // update the board accordingly
            this.setState(prevState => ({
                turn: false,
                selection: -1,
                justCastled: false,
                justPromoted: true,
                promoteArr: [prevState.selection, position],
                attackingFriendlyKing: new Set(),
                highlighted: new Set(),
                moves: prevState.moves.concat(code),
                lastMove: code,
                board: update(prevState.board, {
                    $apply: board => board.map((spot, i) => {
                        if (i === position) spot.piece = new Queen(true, prevState.color);
                        else if (i === prevState.selection) spot.piece = null;
                        return spot;
                    })
                })
            }), this.updateAttackers);

            // when the state is done being updated, the set of attackers
            // will be updated
        }
    }

    /**
     *Performs a castle.
     *
     * @param {string} option - 'ks' or 'qs' to specify if this castle is kingside or queenside.
     * @memberof Board
     */
    castle(option) {
        let newKingPos; // the position where the king will end up
        let newRookPos; // the position where the rook will end up
        let castleArr;  // the array (in enemy coordinates) of the castle coordinates
        let code;       // the chess code of this move

        // if this player is white
        if (this.state.color === 'white') {

            // if this is a kingside castle
            if (option === 'ks') {
                newKingPos = 62;
                newRookPos = 61;
                castleArr = [3, 1, 0, 2];
                code = 'w0-0';
            }

            // if this is a queenside castle
            else if (option === 'qs') {
                newKingPos = 58;
                newRookPos = 59;
                castleArr = [3, 5, 7, 4];
                code = 'w0-0-0';
            }

            // if an invalid option was passed in, do nothing
            else return;
        }

        // if this player is black
        else {

            // if this is a kingside castle
            if (option === 'ks') {
                newKingPos = 57;
                newRookPos = 58;
                castleArr = [4, 6, 7, 5];
                code = 'b0-0';
            }

            // if this is a queenside castle
            else if (option === 'qs') {
                newKingPos = 61;
                newRookPos = 60;
                castleArr = [4, 2, 0, 3];
                code = 'b0-0-0';
            }

            // if an invalid option was passed in, do nothing
            else return;
        }

        // get references to the king and rook
        let king = this.state.board[this.state.kingPos].piece;
        let rook = (option === 'ks' ? this.state.board[this.state.ksRookPos].piece :
            this.state.board[this.state.qsRookPos].piece);

        // update whether this player has moved the ksRook and the qsRook
        let movedKs = option === 'ks' ? true : this.state.movedKsRook;
        let movedQs = option === 'qs' ? true : this.state.movedQsRook;

        // update the state
        this.setState(prevState => ({
            turn: false,
            selection: -1,
            castleArr: castleArr,
            justCastled: true,
            justPromoted: false,
            attackingFriendlyKing: new Set(),
            kingPos: newKingPos,
            movedKing: true,
            movedKsRook: movedKs,
            movedQsRook: movedQs,
            highlighted: new Set(),
            moves: prevState.moves.concat(code),
            lastMove: code,
            board: update(prevState.board, {
                $apply: board => board.map((spot, i) => {
                    if (i === newKingPos) spot.piece = king;
                    else if (i === newRookPos) spot.piece = rook;
                    else if (i === prevState.kingPos) spot.piece = null;
                    else if (option === 'ks' && i === prevState.ksRookPos) spot.piece = null;
                    else if (option === 'qs' && i === prevState.qsRookPos) spot.piece = null;
                    return spot;
                })
            })
        }), this.updateAttackers);
    }

    /**
     *Determines whether the king has been moved.
     *
     * @param {number} newKingPos - The position of the king once this move has taken place.
     * @returns {boolean} Whether the king has been moved.
     * @memberof Board
     */
    hasKingJustMoved(newKingPos) {
        if (this.state.movedKing) return true;

        // if the new king position is different from the current one, 
        // then the king has moved
        return this.state.kingPos !== newKingPos;
    }

    /**
     *Determines whether the kingside rook is being moved.
     *
     * @returns {boolean} Whether the kingside rook is being moved.
     * @memberof Board
     */
    hasKsRookJustMoved() {
        if (this.state.movedKsRook) return true;

        // if the position of the piece that has been selected is the same 
        // as the start position of the kingside rook
        // then the kingside rook is being moved and a kingside castle is no longer possible
        return this.state.selection === this.state.ksRookPos;
    }

    /**
     *Determines whether the queenside rook is being moved.
     *
     * @returns {boolean} Whether the queenside rook is being moved.
     * @memberof Board
     */
    hasQsRookJustMoved() {
        if (this.state.movedQsRook) return true;

        // if the position of the piece that has been seleced is the same 
        // as the start position of the queenside roook
        // then the queenside rook is being moved and a queenside castle is no longer possible
        return this.state.selection === this.state.qsRookPos;
    }

    /**
     *Updates whether any of the friendly pieces are attacking the enemy king. 
     This is necessary because occasionally double-checks are possible and this cannot 
     be accounted for unless the board is scanned. Once the state is updated, 
     the update is sent to the enemy.
     *
     * @memberof Board
     */
    updateAttackers() {
        let attackers = new Set();
        let threats = new Set();
        // loop over the board, if any friendly piece is able to attack the 
        // enemy king, add it to the set of attackers
        for (let i = 0; i < 64; i++) {
            if (this.state.board[i].piece !== null && this.state.board[i].piece.friendly
                && Movement.canMove(this.state.board[i], this.state.board[this.state.enemyKingPos],
                    this.state.board, this.state.kingPos, threats)) {
                attackers.add(i);
            }
        }

        // update the state with the new attackers, 
        // when the state is done being updates, the entire
        // state update that resulted from this move will be sent to the enemy
        this.setState({ attackingEnemyKing: attackers }, this.sendUpdate1);
    }

    /**
     *Sends the main type of state update to the enemy.
     *
     * @memberof Board
     */
    sendUpdate1() {
        if (this.socket === null) return;

        // create an object with the updated state
        let update = {
            turn: true,
            code: this.state.lastMove,
            enemySelection: this.state.selection,
            attackingFriendlyKing: [...this.state.attackingEnemyKing],
            attackingEnemyKing: [],
            enemyKingPos: this.state.kingPos,
            enemyHighlighted: [],
        }

        // if the player just castled, add the castle to the update
        // if not, add the regular move to the update
        if (this.state.justCastled) update.castle = this.state.castleArr;
        else if (this.state.justPromoted) update.promotion = this.state.promoteArr;
        else update.move = this.state.moveArr;

        // send the update to the enemy
        this.socket.emit('outgoing-board-update', update);
    }

    /**
     *Sends the second type of state update to the enemy.
     *
     * @memberof Board
     */
    sendUpdate2() {
        if (this.socket === null) return;
        this.socket.emit('outgoing-board-update', {
            enemySelection: this.state.selection,
            enemyHighlighted: [...this.state.highlighted]
        });
    }

    /**
     *Finds all the spots that can be moved to.
     *
     * @param {number} position - The position of the selected piece.
     * @returns {Set<number>} All the positions that can be moved to.
     * @memberof Board
     */
    whichHighlight(position) {
        // loop over every spot on the board.
        // if the selected piece can move to a spot then add that
        // spot to the set of spots that should be highlighted
        let positions = new Set();
        for (let i = 0; i < this.state.board.length; i++) {
            if (Movement.canMove(this.state.board[position], this.state.board[i], this.state.board,
                this.state.kingPos, this.state.attackingFriendlyKing)) positions.add(i);
        }

        // now we must account for the case where the selected piece is a king and it can castle
        if (this.state.board[position].piece.pieceType === 'King') {

            // if it can kingside castle, add the appropriate position
            if (Movement.canKsCastle(this.state.color, this.state.kingPos, this.state.board,
                this.state.movedKing, this.state.movedKsRook, this.state.attackingFriendlyKing)) {
                positions.add(this.state.color === 'white' ? position + 2 : position - 2);
            }

            // if it can queenside castle, add the appropriate position
            if (Movement.canQsCastle(this.state.color, this.state.kingPos, this.state.board,
                this.state.movedKing, this.state.movedQsRook, this.state.attackingFriendlyKing)) {
                positions.add(this.state.color === 'white' ? position - 2 : position + 2);
            }
        }

        // return the set of positions that can be moved to
        return positions;
    }

    /**
     *Renders an individual square of the board.
     *
     * @param {number} position - The position of this square.
     * @param {string} shade - The color shade of this square: dark or light.
     * @returns {li} A list element containing a Square Component.
     * @memberof Board
     */
    renderSquare(position, shade) {
        // set the svg source and the li key
        let src, key;
        if (this.state.board[position].piece === null) {
            src = 'null';
            key = this.state.board[position].id;
        }
        else {
            src = this.state.board[position].piece.src;
            key = this.state.board[position].piece.id;
        }

        let inCheck = (this.state.board[position].piece !== null && this.state.board[position].piece.pieceType === 'King' &&
            ((this.state.board[position].piece.friendly && this.state.attackingFriendlyKing.size > 0) ||
                (!this.state.board[position].piece.friendly && this.state.attackingEnemyKing.size > 0)));

        // if the game is over, do not include a listener with the rendered square
        if (this.state.enemyLeft || this.state.youWon || this.state.youLost || this.state.draw) {
            return (<li key={key}>
                <Square
                    highlighted={false}
                    enemyHighlighted={false}
                    selected={false}
                    enemySelected={false}
                    shade={shade}
                    src={src}
                    inCheck={false}
                />
            </li>);
        }

        // if the game is not over,
        // render a list item containing a square with all the desired props and 
        // a listener for when the user selects it
        return (<li key={key}>
            <Square
                handleMouseDown={() => this.handleMouseDown(position)}
                highlighted={this.state.highlighted.has(position)}
                enemyHighlighted={this.state.enemyHighlighted.has(position)}
                selected={position === this.state.selection}
                enemySelected={position === this.state.enemySelection}
                shade={shade}
                src={src}
                inCheck={inCheck}
            />
        </li>);
    }

    /**
     *Renders the message that is displayed when the game is over.
     *
     * @returns The end of game message.
     * @memberof Board
     */
    renderEogMessage() {
        // if the game is not over, there is not end of game message
        if (!this.state.enemyLeft && !this.state.youWon && !this.state.youLost && !this.state.draw) {
            return <div className="game-not-over"></div>;
        }

        // set the apropriate message
        let eogMessage = '';

        // if the enemy left the game
        if (this.state.enemyLeft) eogMessage = 'Your opponent has left the game. You won!';

        // if this player won the game
        else if (this.state.youWon) eogMessage = 'You won!';

        // if this player lost the game
        else if (this.state.youLost) eogMessage = 'You lost.';

        // if the game resulted in a draw
        else if (this.state.draw) eogMessage = 'It\'s a draw!';

        return (<div className="center-eog-div">
            <h1 className="eog-message">{eogMessage}</h1>
            <button className="exit-button" onClick={this.handleExit}>Exit</button>
        </div>)
    }

    render() {
        // if a color has not yet been set, render nothing
        if (this.state.color === '' || this.state.color === undefined) return <div></div>;

        // if this client is waiting for an opponent, display the loading screen
        if (this.state.loading) return <Loader message="Waiting for an opponent." />

        // set up the board of squares to render
        let board = [];
        board.length = 8;
        let position = 0;
        while (position < 64) {

            // calculate the current row of the board
            let row = Math.floor(position / 8);

            // the array of squares to add to the board
            let toAdd = [];
            toAdd.length = 8;

            // fill the array of squares with list elements that contain square components
            for (let column = 0; column < 8; column++) {
                let shade = ((row % 2 === 0 && column % 2 === 0) || (row % 2 !== 0 && column % 2 !== 0)) ?
                    'light' : 'dark';
                toAdd[column] = this.renderSquare(position + column, shade);
            }

            // in this case it is okay to use the index as a key because the row uls of the chessboard will not change
            board[row] = <li key={row}><ul className="row">{toAdd}</ul></li>;

            // move to the next row
            position += 8;
        }

        return (<div className="board-and-stats">
            <StatsBar
                className="stats-bar"
                name={this.state.name}
                enemyName={this.state.enemyName}
                moves={this.state.moves}
                deadEnemies={this.state.deadEnemies}
                deadFriends={this.state.deadFriends}
                handleResign={this.handleResign}
                handleDrawRequest={this.handleDrawRequest}
                gameOver={this.state.enemyLeft || this.state.youWon || this.state.youLost || this.state.draw}
            />
            {/* for the num labels it is okay to use each num as the key for its li because they never change */}
            <div className="ml-wrapper">
                <ul className="num-labels">
                    {this.state.nums.map(num => <li className="num-label" key={num}><p className="num-p">{num}</p></li>)}
                </ul>
                <div className="middle-column">
                    <ul className="rows">{board}</ul>
                    <ul className="letter-labels">
                        {this.state.letters.map(letter => <li className="letter-label" key={letter}>{letter}</li>)}
                    </ul>
                </div>
            </div>
            <Chat
                className="board-chat"
                name={this.state.name}
                gameOver={this.state.enemyLeft || this.state.youWon || this.state.youLost || this.state.draw}
            />
        </div>);
    }
}

export default withRouter(Board);
