import React from 'react';
import Square from './Square';
import initBoard from './initBoard';
import update from 'immutability-helper';
import '../stylesheets/Board.scss';

// Board
// this will represent the chess board
// it will be indexed by row and column in the form [row,column]
// starting with [0,0] in the top left
class Board extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            board: initBoard(),
            deadEnemy: [],
            deadFriends: [],
            selection: -1,
            turn: "sefl"
        }
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    // handles when a mouse is initially pressed down
    handleMouseDown(position) {
        // if there is no piece currently selected 
        if (this.state.selection === -1) {
            // if they clicked on a spot with no piece or if they clicked on a spot with a non-friendly 
            // piece, do nothing
            if (this.state.board[position].piece === null || !this.state.board[position].piece.friendly) return;
            // figure out which positions need to be highlighted
            let toHighlight = this.whichHighlight(this.state.board, position);
            // set the state with the selected position and the highlighted spots
            this.setState({
                selection: position,
                board: update(this.state.board, {
                    $apply: board => board.map((spot, i) => {
                        if (toHighlight.has(i)) board[i].highlighted = true;
                        else board[i].highlighted = false;
                        return spot;
                    })
                })
            });
        } 
        // if there is a piece currently selected
    }

    // returns a set of the positions of all the spots that can be moved to
    whichHighlight(board, position) {
        let positions = new Set();
        for (let i = 0; i < board.length; i++) {
            if (board[position].piece.canMove(board[position], board[i], board)) {
                positions.add(i);
            } 
        }
        return positions;
    }

    // renders an individual square of the board
    renderSquare(position, shade) {
        // if there is a piece in this square make sure to display the piece
        let src = (this.state.board[position].piece === null ? "null" : this.state.board[position].piece.src);
        return (<Square 
                    handleMouseDown={() => this.handleMouseDown(position)}
                    highlighted={this.state.board[position].highlighted}
                    selected={position === this.state.selection}
                    shade={shade}
                    src={src}
                />);
    }

    render() {
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
        return (<ul className="rows">
                    {board.map((row, i) => (<li key={i}>{row}</li>))}
                </ul>);
    }
}

export default Board;