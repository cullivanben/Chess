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

// this component will manage the state of the chess board
class Board extends React.Component {
    constructor(props) {
        super(props);
        this.socket = null;
        this.state = {
            name: '',
            enemyName: 'Phil Hanlon',
            color: '',
            board: [],
            highlighted: new Set(),
            enemyHighlighted: new Set(),
            deadFriends: [],
            deadEnemies: [],
            selection: -1,
            enemySelection: -1,
            attackingFriendlyKing: new Set(),
            attackingEnemyKing: new Set(),
            moveArr: [],
            kingPosition: 0,
            enemyKingPosition: 0,
            turn: false,
            moves: [],
            lastMove: '',
            letters: [],
            nums: []
        }
        this.handleColorSet = this.handleColorSet.bind(this);
        this.handleIncomingBoardUpdate = this.handleIncomingBoardUpdate.bind(this);
        this.handleEnemyLeft = this.handleEnemyLeft.bind(this);
        this.handleResign = this.handleResign.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
        this.cleanup = this.cleanup.bind(this);
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

        // listen for incoming board updates and update the state when they are recieved
        this.socket.on('incoming-board-update', this.handleIncomingBoardUpdate);

        // listen for the other player leaving
        this.socket.on('enemy-left', this.handleEnemyLeft);

        // add an event listener that will save the state to local storage before the window unloads
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);

        // make sure that game state and socket connections are cleaned up when the user navigates away from this page
        window.onpopstate = this.cleanup;
    }

    // if the component gets a chance to unmount, remove the event listener
    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    // saves the state of the game to local storage before the window unloads
    saveStateToLocalStorage() {
        localStorage.setItem('saved', 'true');
        localStorage.setItem('guest-name', this.state.name);
        localStorage.setItem('color', this.state.color);
        localStorage.setItem('board', JSON.stringify(this.state.board, (key, value) => {
            if (key === 'src' || key === 'id') return undefined;
            else return value;
        }));
        localStorage.setItem('highlighted', JSON.stringify([...this.state.highlighted]));
        localStorage.setItem('enemyHighlighted', JSON.stringify([...this.state.enemyHighlighted]));
        localStorage.setItem('deadFriends', JSON.stringify(this.state.deadFriends));
        localStorage.setItem('deadEnemies', JSON.stringify(this.state.deadEnemies));
        localStorage.setItem('selection', this.state.selection);
        localStorage.setItem('enemySelection', this.state.enemySelection);
        localStorage.setItem('attackingFriendlyKing', JSON.stringify([...this.state.attackingFriendlyKing]));
        localStorage.setItem('attackingEnemyKing', JSON.stringify([...this.state.attackingEnemyKing]));
        localStorage.setItem('moveArr', JSON.stringify(this.state.moveArr));
        localStorage.setItem('kingPosition', this.state.kingPosition);
        localStorage.setItem('enemyKingPosition', this.state.enemyKingPosition);
        localStorage.setItem('turn', (this.state.turn ? 1 : 0));
        localStorage.setItem('moves', JSON.stringify(this.state.moves));
        localStorage.setItem('lastMove', this.state.lastMove);
        localStorage.setItem('letters', JSON.stringify(this.state.letters));
        localStorage.setItem('nums', JSON.stringify(this.state.nums));
    }

    // restores the state of the game from local storage
    restoreStateFromLocalStorage() {
        let restoredState = {};
        if (localStorage.getItem('guest-name') !== null) {
            restoredState.name = localStorage.getItem('guest-name');
        }
        if (localStorage.getItem('color') !== null) {
            restoredState.color = localStorage.getItem('color');
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
            restoredState.selection = parseInt(localStorage.getItem('selection'));
        }
        if (localStorage.getItem('enemySelection') !== null) {
            restoredState.enemySelection = parseInt(localStorage.getItem('enemySelection'));
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
        if (localStorage.getItem('kingPosition') !== null) {
            restoredState.kingPosition = parseInt(localStorage.getItem('kingPosition'));
        }
        if (localStorage.getItem('enemyKingPosition') !== null) {
            restoredState.enemyKingPosition = parseInt(localStorage.getItem('enemyKingPosition'));
        }
        if (localStorage.getItem('turn') !== null) {
            restoredState.turn = (localStorage.getItem('turn') === '0' ? false : true);
        }
        if (localStorage.getItem('moves') !== null) {
            restoredState.moves = JSON.parse(localStorage.getItem('moves'));
        }
        if (localStorage.getItem('lastMove') !== null) {
            restoredState.lastMove = localStorage.getItem('lastMove');
        }
        if (localStorage.getItem('letters') !== null) {
            restoredState.letters = JSON.parse(localStorage.getItem('letters'));
        }
        if (localStorage.getItem('nums') !== null) {
            restoredState.nums = JSON.parse(localStorage.getItem('nums'));
        }
        this.setState(restoredState);
    }

    // called when this player first recieves their color 
    handleColorSet(color) {
        // retireve the name of this user from local storage
        let name = (localStorage.getItem('guest-name') !== null ? localStorage.getItem('guest-name') :
            ('Guest ' + (Math.floor(Math.random() * 90000) + 10000)));

        // set the initial state of the game
        this.setState({
            name: name,
            color: color,
            board: Init.initBoard(color),
            kingPosition: Init.initKingPos(color),
            enemyKingPosition: Init.initEnemyKingPos(color),
            turn: Init.initTurn(color),
            letters: Init.initLetters(color),
            nums: Init.initNumbers(color)
        });
    }

    // called when this player recieves a board update from the enemy
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
        if (data.enemyKingPosition) {
            stateUpdate.enemyKingPosition = Help.convertPos(data.enemyKingPosition);
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
                // update the state, then update the danger
                let dead = this.state.board[b].piece.pieceType;
                this.setState(prevState => ({
                    ...stateUpdate,
                    deadFriends: prevState.deadFriends.concat((prevState.color === 'black' ?
                        'b' + dead : 'w' + dead)),
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
                // only update the state, then update the danger
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

        // if no move was made we do not need to update the board,
        // however, we still must update the state
        else this.setState(stateUpdate);
    }

    // handles when the enemy leaves the game
    handleEnemyLeft() {
        // clear local storage and disconnect from the socket
        this.cleanup();
    }

    // handles when this player clicks 'resign'
    handleResign() {
        // make sure the user really wants to resign
        if (!window.confirm('Are you sure you want to resign? If you do you will lose the game.'))
            return;

        // navigate back to the main page
        this.props.history.goBack();

        // upon backward navigation, this.cleanup will be called and will clear local storage 
        // and force-disconnect the socket
    }

    // disconnects the sockets and clears local storage
    cleanup() {
        // when this socket disconnects, the server will do all the necessary socket cleanup 
        // and inform the other player that this player left
        // tell the server to disconnect this socket
        if (this.socket !== null) this.socket.emit('force-disconnect');

        // clear local storage in order to remove all state info of this game
        localStorage.clear();
    }

    // handles when a mouse is initially pressed down
    handleMouseDown(position) {
        // if it is not this player's turn they cannot do anything to the board
        if (!this.state.turn) return;

        // if there is no piece currently selected 
        if (this.state.selection === -1) {

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

        // if there is a piece currently selected
        else {

            // if the person clicked on the piece that is selected, unselect it
            if (this.state.selection === position) {
                // update the state and then send the update to the enemy
                this.setState({
                    selection: -1,
                    highlighted: new Set()
                }, this.sendUpdate2);
                return;
            }

            // if the selection cannot move to this position, do nothing
            if (this.state.board[this.state.selection].piece === null || !Movement.canMove(this.state.board[this.state.selection],
                this.state.board[position], this.state.board, this.state.kingPosition, this.state.attackingFriendlyKing)) return;

            // ***
            // if this piece is able to move, the friendly king must no longer be in check, else 
            // it would be in checkmate. Therefore, the set of pieces attacking the friendly king must be empty
            // *** 

            // determine the new king position
            let newKingPosition = (this.state.board[this.state.selection].piece.pieceType === 'King' ?
                position : this.state.kingPosition);

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
                    moveArr: [prevState.selection, position],
                    attackingFriendlyKing: new Set(),
                    kingPosition: newKingPosition,
                    deadEnemies: prevState.deadEnemies.concat((prevState.color === 'black' ?
                        'w' + dead : 'b' + dead)),
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
                    moveArr: [prevState.selection, position],
                    attackingFriendlyKing: new Set(),
                    kingPosition: newKingPosition,
                    highlighted: new Set(),
                    moves: prevState.moves.concat(code),
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
    }

    // updates whether any of the friendly pieces are attacking the enemy king,
    // this is necessary because occasionally double-checks are possible, this cannot
    // be accounted for unless the board is scanned
    // once the state is updated, the update is send to the enemy
    updateAttackers() {
        let attackers = new Set();
        let threats = new Set();
        // loop over the board, if any friendly piece is able to attack the 
        // enemy king, add it to the set of attackers
        for (let i = 0; i < 64; i++) {
            if (this.state.board[i].piece !== null && this.state.board[i].piece.friendly
                && Movement.canMove(this.state.board[i], this.state.board[this.state.enemyKingPosition],
                    this.state.board, this.state.kingPosition, threats)) {
                attackers.add(i);
            }
        }

        // update the state with the new attackers, 
        // when the state is done being updates, the entire
        // state update that resulted from this move will be sent to the enemy
        this.setState({ attackingEnemyKing: attackers }, this.sendUpdate1);
    }

    // sends the main type of state update to the enemy
    sendUpdate1() {
        if (this.socket === null) return;

        // create an object with the updated state
        let update = {
            turn: true,
            code: this.state.lastMove,
            enemySelection: this.state.selection,
            attackingFriendlyKing: [...this.state.attackingEnemyKing],
            attackingEnemyKing: [],
            enemyKingPosition: this.state.kingPosition,
            enemyHighlighted: [],
            move: this.state.moveArr
        }

        // send the update to the enemy
        this.socket.emit('outgoing-board-update', update);
    }

    // sends the second type of update to the enemy
    sendUpdate2() {
        if (this.socket === null) return;
        this.socket.emit('outgoing-board-update', {
            enemySelection: this.state.selection,
            enemyHighlighted: [...this.state.highlighted]
        });
    }

    // returns a set of the positions of all the spots that can be moved to
    whichHighlight(position) {
        // loop over every spot on the board.
        // if the selected piece can move to a spot then add that
        // spot to the set of spots that should be highlighted
        let positions = new Set();
        for (let i = 0; i < this.state.board.length; i++) {
            if (Movement.canMove(this.state.board[position], this.state.board[i], this.state.board,
                this.state.kingPosition, this.state.attackingFriendlyKing)) positions.add(i);
        }
        return positions;
    }

    // renders an individual square of the board
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
            board[row] = <li key={row}><ul className='row'>{toAdd}</ul></li>;

            // move to the next row
            position += 8;
        }

        return (<div className='board-and-stats'>
            <StatsBar
                className='stats-bar'
                name={this.state.name}
                enemyName={this.state.enemyName}
                moves={this.state.moves}
                deadEnemies={this.state.deadEnemies}
                deadFriends={this.state.deadFriends}
                handleResign={this.handleResign}
            />
            {/* for the num labels it is okay to use each num as the key for its li because they never change */}
            <div className="ml-wrapper">
                <ul className='num-labels'>
                    {this.state.nums.map(num => <li className='num-label' key={num}><p className='num-p'>{num}</p></li>)}
                </ul>
                <div className='middle-column'>
                    <ul className='rows'>{board}</ul>
                    <ul className='letter-labels'>
                        {this.state.letters.map(letter => <li className='letter-label' key={letter}>{letter}</li>)}
                    </ul>
                </div>
            </div>
            <Chat className='board-chat' name={this.state.name} />
        </div>);
    }
}

export default withRouter(Board);
