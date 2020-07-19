import React from 'react';
import io from 'socket.io-client';
import update from 'immutability-helper';
import Square from './Square';
import StatsBar from './StatsBar';
import King from '../chess-classes/pieces/King';
import { initBoard, initKingPos, initEnemyKingPos, initTurn } from './helpers/initHelpers';
import '../stylesheets/Board.scss';
const endpoint = "http://localhost:5000";


// Board
// this will represent the chess board
// it will be indexed by row and column in the form [row,column]
// starting with [0,0] in the top left
export default class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: null,
            board: null,
            highlighted: new Set(),
            deadEnemies: [],
            deadFriends: [],
            enemyCheck: false,
            selfCheck: false,
            selection: -1,
            kingPosition: null,
            enemyKingPosition: null,
            turn: null
        }
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.socket = null;
    }

    componentDidMount() {
        // connect to the socket
        this.socket = io(endpoint);
        // listen for the color
        this.socket.on("color", color => {
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
        this.socket.on("incoming-board-update", data => this.handleBoardUpdate(data));
    }

    // handles when this component recieves data from the socket it is connected to
    handleBoardUpdate(data) {
        console.log(data.message);
    }

    // handles when a mouse is initially pressed down
    handleMouseDown(position) {
        this.socket.emit("outgoing-board-update", {message: "oh yeah"});
        // if there is no piece currently selected 
        if (this.state.selection === -1) {
            // if they clicked on a spot with no piece or if they clicked on a spot with a non-friendly 
            // piece, do nothing
            if (this.state.board[position].piece === null || !this.state.board[position].piece.friendly) return;
            // figure out which positions need to be highlighted
            let toHighlight = this.whichHighlight(this.state.board, position, this.state.kingPosition);
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
                // send the new update to the other player
            }
            // if this move does not kill an enemy
            else {
                // update the board accordingly
                this.setState(prevState => ({
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
        let src = (this.state.board[position].piece === null ? "null" : 
            this.state.board[position].piece.src);
        return (<Square 
                    handleMouseDown={() => this.handleMouseDown(position)}
                    highlighted={this.state.highlighted.has(position)}
                    selected={position === this.state.selection}
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
                let shade;
                if ((row % 2 === 0 && column % 2 === 0) || (row % 2 !== 0 && column % 2 !== 0)) shade = "light";
                else shade = "dark";
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
