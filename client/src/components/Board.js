import React from 'react';
import { withRouter } from 'react-router';
import io from 'socket.io-client';
import update from 'immutability-helper';
import Square from './Square';
import StatsBar from './StatsBar';
import Chat from './Chat';
import King from '../chess-classes/pieces/King';
import {
    initBoard,
    initKingPos,
    initEnemyKingPos,
    initTurn,
    initLetters,
    initNumbers
} from './helpers/initHelpers';
import {
    createSpot,
    convertPos,
    getNumLetterCode
} from './helpers/helperFunctions';
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
            selfCheck: false,
            enemyCheck: false,
            selection: -1,
            enemySelection: -1,
            kingPosition: 0,
            enemyKingPosition: 0,
            turn: false,
            moves: [],
            letters: [],
            nums: []
        }
        this.handleColorSet = this.handleColorSet.bind(this);
        this.handleIncomingBoardUpdate = this.handleIncomingBoardUpdate.bind(this);
        this.handleLeaveGame = this.handleLeaveGame.bind(this);
        this.handleEnemyLeft = this.handleEnemyLeft.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleTurn = this.handleTurn.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }

    componentDidMount() {
        // restore state from local storage if possible
        if (localStorage.getItem('saved') !== null) {
            console.log('restoring');
            this.restoreStateFromLocalStorage();
        }
        // connect to the socket
        this.socket = io(endpoint);
        // listen for the color
        this.socket.on('color', this.handleColorSet);
        // listen for incoming board updates and update the state when they are recieved
        this.socket.on('incoming-board-update', this.handleIncomingBoardUpdate);
        // listen for turn updates and update the turn when they are recieved
        this.socket.on('incoming-turn', this.handleTurn);
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
        localStorage.setItem('selfCheck', (this.state.selfCheck ? 1 : 0));
        localStorage.setItem('enemyCheck', (this.state.enemyCheck ? 1 : 0));
        localStorage.setItem('selection', this.state.selection);
        localStorage.setItem('enemySelection', this.state.enemySelection);
        localStorage.setItem('kingPosition', this.state.kingPosition);
        localStorage.setItem('enemyKingPosition', this.state.enemyKingPosition);
        localStorage.setItem('turn', (this.state.turn ? 1 : 0));
        localStorage.setItem('moves', JSON.stringify(this.state.moves));
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
            restoredState.board = JSON.parse(localStorage.getItem('board')).map(obj => createSpot(obj));
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
        if (localStorage.getItem('selfCheck') !== null) {
            restoredState.selfCheck = (localStorage.getItem('selfCheck') === '0' ? false : true);
        }
        if (localStorage.getItem('enemyCheck') !== null) {
            restoredState.enemyCheck = (localStorage.getItem('enemyCheck') === '0' ? false : true);
        }
        if (localStorage.getItem('selection') !== null) {
            restoredState.selection = parseInt(localStorage.getItem('selection'));
        }
        if (localStorage.getItem('enemySelection') !== null) {
            restoredState.enemySelection = parseInt(localStorage.getItem('enemySelection'));
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
        if (localStorage.getItem('letters') !== null) {
            restoredState.letters = JSON.parse(localStorage.getItem('letters'));
        }
        if (localStorage.getItem('nums') !== null) {
            restoredState.nums = JSON.parse(localStorage.getItem('nums'));
        }
        this.setState(restoredState);
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

    // called when this player first recieves their color 
    handleColorSet(color) {
        // retireve the name of this user from local storage
        let name = (localStorage.getItem('guest-name') !== null ? localStorage.getItem('guest-name') :
            ('Guest ' + Math.floor(Math.random() * 90000) + 10000));
        // set the initial state of the game
        this.setState({
            name: name,
            color: color,
            board: initBoard(color),
            kingPosition: initKingPos(color),
            enemyKingPosition: initEnemyKingPos(color),
            turn: initTurn(color),
            letters: initLetters(color),
            nums: initNumbers(color)
        });
    }

    // called when this player recieves a board update from the enemy
    handleIncomingBoardUpdate(data) {
        let stateUpdate = {};
        // update the state fields that were sent from the enemy
        if (data.selection) {
            if (data.selection === -1) stateUpdate.enemySelection = -1;
            else stateUpdate.enemySelection = convertPos(data.selection);
        }
        if (data.highlighted) {
            console.log('highlighted', data.highlighted);
            let enemyHigh = new Set();
            data.highlighted.forEach(pos => enemyHigh.add(convertPos(pos)));
            stateUpdate.enemyHighlighted = enemyHigh;
        }
        if (data.kingPosition) {
            stateUpdate.enemyKingPosition = data.kingPosition;
        }
        if (data.code) {
            stateUpdate.moves = [...this.state.moves].concat(data.code);
        }
        // set the state with the updated state fields
        this.setState(stateUpdate);
        // if a move was made on the board we will make another state update
        if (data.move) {
            // convert the positions
            let a = convertPos(data.move[0]);
            let b = convertPos(data.move[1]);
            let selectedPiece = this.state.board[a].piece;
            // if this move killed a friendly piece
            if (this.state.board[b].piece !== null) {
                // update the board and the list of dead friends
                let dead = this.state.board[b].piece.pieceType;
                this.setState(prevState => ({
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
                // only update the board
                this.setState(prevState => ({
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
    }

    // handles when this player is notified that it is their turn
    handleTurn() {
        this.setState({ turn: true });
    }

    // performs cleanup and navigates back to the home page
    handleLeaveGame() {
        // clear local storage and disconnect the socket
        //this.cleanup();
        // navigate back to the main page
        this.props.history.goBack();
    }

    // handles when the enemy leaves the game
    handleEnemyLeft() {
        // clear local storage and disconnect from the socket
        this.cleanup();
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
            let toHighlight = this.whichHighlight(this.state.board, position, this.state.kingPosition);
            // send the selected position and the highlighted spots to the enemy
            this.socket.emit('outgoing-board-update', {
                selection: position,
                highlighted: [...toHighlight]
            });
            // set the state with the selected position and the highlighted spots
            this.setState({
                selection: position,
                highlighted: toHighlight
            });
        }
        // if there is a piece currently selected
        else {
            // if the person clicked on the piece that is selected, unselect it
            if (this.state.selection === position) {
                // send the update to the enemy
                this.socket.emit('outgoing-board-update', {
                    selection: -1,
                    highlighted: []
                });
                // update the state
                this.setState({
                    selection: -1,
                    highlighted: new Set()
                });
                return;
            }
            // if the selection cannot move to this position, do nothing
            if (this.state.board[this.state.selection].piece === null || !this.state.board[this.state.selection].piece
                .canMove(this.state.board[this.state.selection], this.state.board[position],
                    this.state.board, this.state.kingPosition)) return;
            // determine the new king position
            let newKingPosition = (this.state.board[this.state.selection].piece
                instanceof King ? position : this.state.kingPosition);
            // get the piece that is being moved
            let selectedPiece = this.state.board[this.state.selection].piece;
            // get the chess code of this move
            let code = getNumLetterCode(position, selectedPiece.pieceType, this.state.color);
            // send the update to the enemy
            this.socket.emit('outgoing-board-update', {
                code: code,
                selection: -1,
                kingPosition: newKingPosition,
                highlighted: [],
                move: [this.state.selection, position]
            });
            // if there is an enemy piece at this location, it is now dead
            if (this.state.board[position].piece !== null) {
                // get the piece that is being killed
                let dead = this.state.board[position].piece.pieceType;
                // update the board accordingly
                this.setState(prevState => ({
                    turn: false,
                    selection: -1,
                    kingPosition: newKingPosition,
                    deadEnemies: prevState.deadEnemies.concat((prevState.color === 'black' ?
                        'w' + dead : 'b' + dead)),
                    highlighted: new Set(),
                    moves: prevState.moves.concat(code),
                    board: update(prevState.board, {
                        $apply: board => board.map((spot, i) => {
                            if (i === position) spot.piece = selectedPiece;
                            else if (i === prevState.selection) spot.piece = null;
                            return spot;
                        })
                    })
                }));
            }
            // if this move does not kill an enemy
            else {
                // update the board accordingly
                this.setState(prevState => ({
                    turn: false,
                    selection: -1,
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
                }));
            }
            // inform the enemy that it is their turn
            this.socket.emit('outgoing-turn');
        }
    }

    // returns a set of the positions of all the spots that can be moved to
    whichHighlight(board, position, kingPosition) {
        let positions = new Set();
        for (let i = 0; i < board.length; i++) {
            if (board[position].piece.canMove(board[position], board[i], board, kingPosition)) {
                positions.add(i);
            }
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
            for (let column = 0; column < 8; column++) {
                let shade = ((row % 2 === 0 && column % 2 === 0) || (row % 2 !== 0 && column % 2 !== 0)) ?
                    'light' : 'dark';
                toAdd[column] = this.renderSquare(position + column, shade);
            }
            // in this case it is okay to use the index as a key because the row uls of the chessboard will not change
            board[row] = <li key={row}><ul className='row'>{toAdd}</ul></li>;
            position += 8;
        }
        return (<div className='board-and-stats'>
            <Chat className='board-chat' name={this.state.name} />
            {/* for the num labels it is okay to use each num as the key for its li because they never change */}
            <ul className='num-labels'>
                {this.state.nums.map(num => <li className='num-label' key={num}><p className='num-p'>{num}</p></li>)}
            </ul>
            <div className='middle-column'>
                <ul className='rows'>{board}</ul>
                <ul className='letter-labels'>
                    {this.state.letters.map(letter => <li className='letter-label' key={letter}>{letter}</li>)}
                </ul>
            </div>
            <StatsBar
                className='stats-bar'
                name={this.state.name}
                enemyName={this.state.enemyName}
                moves={this.state.moves}
                deadEnemies={this.state.deadEnemies}
                deadFriends={this.state.deadFriends}
            />
        </div>);
    }
}

export default withRouter(Board);
