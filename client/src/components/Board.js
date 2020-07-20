import React from 'react';
import io from 'socket.io-client';
import update from 'immutability-helper';
import Square from './Square';
import StatsBar from './StatsBar';
import King from '../chess-classes/pieces/King';
import { initBoard, initKingPos, initEnemyKingPos, initTurn } from './helpers/initHelpers';
import '../stylesheets/Board.scss';
const endpoint = 'http://localhost:5000';

// this component will manage the state of the chess board
export default class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: 'no color',
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
            turn: false
        }
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
        this.socket = null;
    }

    componentDidMount() {
        // restore state from local storage if possible
        if (localStorage.getItem('saved') !== null) this.restoreStateFromLocalStorage();
        // connect to the socket
        this.socket = io(endpoint);
        // listen for the color
        this.socket.on('color', color => {
            console.log(color);
            this.setState({
                color: color,
                board: initBoard(color), 
                kingPosition: initKingPos(color),
                enemyKingPosition: initEnemyKingPos(color),
                turn: initTurn(color)
            });
        });
        // listen for incoming board updates and update the state when they are recieved
        this.socket.on('incoming-board-update', data => {
            let stateUpdate = {};
            // update the state fields that were sent from the enemy
            if (data.selection) {
                if (data.selection === -1) stateUpdate.enemySelection = -1;
                else stateUpdate.enemySelection = this.convertPos(data.selection);
            }
            if (data.highlighted) {
                console.log('highlighted', data.highlighted);
                let enemyHigh = new Set();
                data.highlighted.forEach(pos => enemyHigh.add(this.convertPos(pos)));
                stateUpdate.enemyHighlighted = enemyHigh;
            }
            if (data.kingPosition) {
                stateUpdate.enemyKingPosition = data.kingPosition;
            }
            // set the state with the updated state fields
            this.setState(stateUpdate);
            // if a move was made on the board we will make another state update
            if (data.move) {
                // convert the positions
                let a = this.convertPos(data.move[0]);
                let b = this.convertPos(data.move[1]);
                let selectedPiece = this.state.board[a].piece;
                // if this move killed a friendly piece
                if (this.state.board[b].piece !== null) {
                    // update the board and the list of dead friends
                    let dead = this.state.board[b].piece;
                    this.setState(prevState => ({
                        deadFriends: prevState.deadFriends.concat(dead),
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
        });
        // listen for turn updates and update the turn when they are recieved
        this.socket.on('incoming-turn', () => {
            this.setState({ turn: true });
        });
        // add an event listener that will save the state to local storage before the window unloads
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    // if the component gets a chance to unmount, remove the event listener
    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    // converts enemy positions to friendly positions
    convertPos(position) {
        return 63 - position;
    }

    // saves the state of the game to local storage before the window unloads
    saveStateToLocalStorage() {
        // save each item from the state
        localStorage.setItem('saved', 'true');
        localStorage.setItem('color', this.state.color);
        localStorage.setItem('board', JSON.stringify(this.state.board, (key, value) => {
            if (key === 'src') return undefined;
            else return value;
        }));
        localStorage.setItem('highlighted', JSON.stringify([...this.state.highlighted]));
        localStorage.setItem('enemyHighlighted', JSON.stringify([...this.state.enemyHighlighted]));
        localStorage.setItem('deadEnemies', JSON.stringify(this.state.deadEnemies));
        localStorage.setItem('deadFriends', JSON.stringify(this.state.deadFriends));
        localStorage.setItem('selfCheck', (this.state.selfCheck ? 1 : 0));
        localStorage.setItem('enemyCheck', (this.state.enemyCheck ? 1 : 0));
        localStorage.setItem('selection', this.state.selection);
        localStorage.setItem('enemySelection', this.state.enemySelection);
        localStorage.setItem('kingPosition', this.state.kingPosition);
        localStorage.setItem('enemyKingPosition', this.state.enemyKingPosition);
        localStorage.setItem('turn', (this.state.turn ? 1 : 0));
    }

    restoreStateFromLocalStorage() {
        console.log(localStorage.get('selection'));
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
            // if the selection cannot move to this position, do nothing
            if (this.state.board[this.state.selection].piece === null || !this.state.board[this.state.selection].piece
                .canMove(this.state.board[this.state.selection], this.state.board[position], 
                this.state.board, this.state.kingPosition)) return;
            // determine the new king position
            let newKingPosition = (this.state.board[this.state.selection].piece 
                instanceof King ? position : this.state.kingPosition);
            // get the piece that is being moved
            let selectedPiece = this.state.board[this.state.selection].piece;
            // send the update to the enemy
            this.socket.emit('outgoing-board-update', {
                selection: -1,
                kingPosition: newKingPosition,
                highlighted: [],
                move: [this.state.selection, position]
            });
            // if there is an enemy piece at this location, it is now dead
            if (this.state.board[position].piece !== null) {
                // get the piece that is being killed
                let dead = this.state.board[position].piece;
                // update the board accordingly
                this.setState(prevState => ({
                    selection: -1,
                    kingPosition: newKingPosition,
                    deadEnemies: prevState.deadEnemies.concat(dead),
                    highlighted: new Set(),
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
            this.socket.emit('outgoing-turn', {});
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
        // if there is a piece in this square make sure to display the piece
        let src = (this.state.board[position].piece === null ? 'null' : 
            this.state.board[position].piece.src);
        return (<Square 
                    handleMouseDown={() => this.handleMouseDown(position)}
                    highlighted={this.state.highlighted.has(position)}
                    enemyHighlighted={this.state.enemyHighlighted.has(position)}
                    selected={position === this.state.selection}
                    enemySelected={position === this.state.enemySelection}
                    shade={shade}
                    src={src}
                />);
    }

    render() {
        // if a color has not yet been set, render nothing
        if (this.state.color === null) return <div></div>;

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
            board[row] = (<ul className="row">
                            {toAdd.map((square, i) => (<li key={`${row} ${i}`}>{square}</li>))}
                        </ul>);
            position += 8;
        }
        return (<div>
                    <ul className="rows">
                        {board.map((row, i) => (<li key={i}>{row}</li>))}
                    </ul>
                    <StatsBar 
                        deadEnemies={this.state.deadEnemies}
                        deadFriends={this.state.deadFriends}
                    />
                </div>);
    }
}
