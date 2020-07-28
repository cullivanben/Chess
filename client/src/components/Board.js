import React from 'react';
import { withRouter } from 'react-router';
import io from 'socket.io-client';
import update from 'immutability-helper';
import Square from './Square';
import StatsBar from './StatsBar';
import Chat from './Chat';
import Movement from '../chess-classes/Movement';
import Init from './helpers/Init';
import Help from './helpers/Help';
import '../stylesheets/Board.scss';
const endpoint = 'http://localhost:5000';

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
            name: '',                               // the name of this player
            enemyName: 'Phil Hanlon',               // the name of the enemy player
            color: '',                              // the color of this player
            board: [],                              // an array representing the chess board
            highlighted: new Set(),                 // the locations of highlighted spots on the board
            enemyHighlighted: new Set(),            // the locations of the enemy's highlighted spots on the board
            deadFriends: [],                        // the dead friendly pieces
            deadEnemies: [],                        // the dead enemy pieces
            selection: -1,                          // the location of the selected piece
            enemySelection: -1,                     // the location of the enemy's selected piece
            attackingFriendlyKing: new Set(),       // the locations of the enemy pieces that have the friendly king in check
            attackingEnemyKing: new Set(),          // the locations of the friendly pieces that have the enemy king in check
            moveArr: [],                            // the start and end location of the move that was just made
            castleArr: [],                          // the start and end locations of the king and rook after a castle
            kingPos: 0,                             // the position of the friendly king
            enemyKingPos: 0,                        // the position of the enemy king
            ksRookPos: 0,                           // the position of the kingside rook
            qsRookPos: 0,                           // the position of the queenside rook
            turn: false,                            // whether it is this player's turn
            movedKing: false,                       // whether this player has moved their king
            movedKsRook: false,                     // whether this player has moved their kingside rook
            movedQsRook: false,                     // whether this player has moved their queenside rook
            justCastled: false,                     // whether this player just castled
            moves: [],                              // the chess codes of all the moves that have been made
            lastMove: '',                           // the chess code of the move that was just made
            letters: [],                            // the letters labeling the bottom of the board
            nums: []                                // the numbers labeling the side of the board
        }
        this.handleColorSet = this.handleColorSet.bind(this);
        this.handleIncomingBoardUpdate = this.handleIncomingBoardUpdate.bind(this);
        this.handleEnemyLeft = this.handleEnemyLeft.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.handleResign = this.handleResign.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.attemptSelect = this.attemptSelect.bind(this);
        this.unselect = this.unselect.bind(this);
        this.movePiece = this.movePiece.bind(this);
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
        // restore state from local storage if possible
        if (localStorage.getItem('saved') !== null) this.restoreStateFromLocalStorage();

        // connect to the socket
        this.socket = io(endpoint);

        // listen for the color
        this.socket.on('color', this.handleColorSet);

        // listen for incoming board updates and update the state when they are received
        this.socket.on('incoming-board-update', this.handleIncomingBoardUpdate);

        // listen for the other player leaving
        this.socket.on('enemy-left', this.handleEnemyLeft);

        // add an event listener that will save the state to local storage before the window unloads
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);

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
     *Saves the state of the game to local storage before the window unloads.
     *
     * @memberof Board
     */
    saveStateToLocalStorage() {
        localStorage.setItem('saved', JSON.stringify(true));
        localStorage.setItem('guest-name', JSON.stringify(this.state.name));
        localStorage.setItem('color', JSON.stringify(this.state.color));
        localStorage.setItem('board', JSON.stringify(this.state.board, (key, value) => {
            if (key === 'src' || key === 'id') return undefined;
            else return value;
        }));
        localStorage.setItem('highlighted', JSON.stringify([...this.state.highlighted]));
        localStorage.setItem('enemyHighlighted', JSON.stringify([...this.state.enemyHighlighted]));
        localStorage.setItem('deadFriends', JSON.stringify(this.state.deadFriends));
        localStorage.setItem('deadEnemies', JSON.stringify(this.state.deadEnemies));
        localStorage.setItem('selection', JSON.stringify(this.state.selection));
        localStorage.setItem('enemySelection', JSON.stringify(this.state.enemySelection));
        localStorage.setItem('attackingFriendlyKing', JSON.stringify([...this.state.attackingFriendlyKing]));
        localStorage.setItem('attackingEnemyKing', JSON.stringify([...this.state.attackingEnemyKing]));
        localStorage.setItem('moveArr', JSON.stringify(this.state.moveArr));
        localStorage.setItem('castleArr', JSON.stringify(this.state.castleArr));
        localStorage.setItem('kingPos', JSON.stringify(this.state.kingPos));
        localStorage.setItem('enemyKingPos', JSON.stringify(this.state.enemyKingPos));
        localStorage.setItem('ksRookPos', JSON.stringify(this.state.ksRookPos));
        localStorage.setItem('qsRookPos', JSON.stringify(this.state.qsRookPos));
        localStorage.setItem('turn', JSON.stringify(this.state.turn));
        localStorage.setItem('movedKing', JSON.stringify(this.state.movedKing));
        localStorage.setItem('movedKsRook', JSON.stringify(this.state.movedKsRook));
        localStorage.setItem('movedQsRook', JSON.stringify(this.state.movedQsRook));
        localStorage.setItem('moves', JSON.stringify(this.state.moves));
        localStorage.setItem('lastMove', JSON.stringify(this.state.lastMove));
        localStorage.setItem('letters', JSON.stringify(this.state.letters));
        localStorage.setItem('nums', JSON.stringify(this.state.nums));
    }

    /**
     *Restores the state of the game from local storage.
     *
     * @memberof Board
     */
    restoreStateFromLocalStorage() {
        let restoredState = {};
        if (localStorage.getItem('guest-name') !== null) {
            restoredState.name = JSON.parse(localStorage.getItem('guest-name'));
        }
        if (localStorage.getItem('color') !== null) {
            restoredState.color = JSON.parse(localStorage.getItem('color'));
        }
        if (localStorage.getItem('board') !== null) {
            restoredState.board = JSON.parse(localStorage.getItem('board')).map(obj => Help.createSpot(obj));
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
        this.setState(restoredState);
    }

    /**
     *Callback for when this player first receives their color.
     *
     * @param {string} color - The color of this player.
     * @memberof Board
     */
    handleColorSet(color) {

        console.log('color sert', color);
        // retireve the name of this user from local storage
        let name = (localStorage.getItem('guest-name') !== null ? localStorage.getItem('guest-name') :
            ('Guest ' + (Math.floor(Math.random() * 90000) + 10000)));

        // set the initial state of the game
        this.setState({
            name: name,
            color: color,
            board: Init.initBoard(color),
            kingPos: Init.initKingPos(color),
            enemyKingPos: Init.initEnemyKingPos(color),
            ksRookPos: Init.initKsRookPos(color),
            qsRookPos: Init.initQsRookPos(color),
            turn: Init.initTurn(color),
            letters: Init.initLetters(color),
            nums: Init.initNumbers(color)
        });
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
                }));
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
                }));
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
            }))
        }

        // if no move or castle was made we do not need to update the board,
        // however, we still must update the state
        else this.setState(stateUpdate);
    }

    /**
     *Callback for when the enemy leaves the game.
     *
     * @memberof Board
     */
    handleEnemyLeft() {
        // clear local storage and disconnect from the socket
        this.cleanup();
    }

    /**
     *Callback for when the player clicks the resign button.
     *
     * @memberof Board
     */
    handleResign() {
        // make sure the user really wants to resign
        if (!window.confirm('Are you sure you want to resign? If you do you will lose the game.'))
            return;

        // navigate back to the main page
        this.props.history.goBack();

        // upon backward navigation, this.cleanup will be called and will clear local storage 
        // and force-disconnect the socket
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
            this.movePiece(position);
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
        else update.move = this.state.moveArr;

        console.log('move', update.move);
        console.log('castle', update.castle);

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

        // render a list item containing a square with all the desired props
        return (<li key={key}>
            <Square
                handleMouseDown={() => this.handleMouseDown(position)}
                highlighted={this.state.highlighted.has(position)}
                enemyHighlighted={this.state.enemyHighlighted.has(position)}
                selected={position === this.state.selection}
                enemySelected={position === this.state.enemySelection}
                shade={shade}
                src={src}
            />
        </li>);
    }

    render() {
        // if a color has not yet been set, render nothing
        if (this.state.color === '' || this.state.color === undefined) return <div></div>;

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
            <Chat className="board-chat" name={this.state.name} />
        </div>);
    }
}

export default withRouter(Board);
