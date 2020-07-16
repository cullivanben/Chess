import React from 'react';
import Square from './Square';
import initBoard from './initBoard'
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
            selection: null,
            turn: "sefl"
        }
        this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    // handles when a mouse is initially pressed down
    handleMouseDown(position) {
        // if there is no piece currently selected 
        if (this.state.selection === null) {
            // if they clicked on a spot with no piece or if they clicked on a spot with a non-friendly 
            // piece, do nothing
            if (this.state.board[position].piece === null || 
                !this.state.board[position].piece.friendly) return;

            // clone the current board and highlight the elements within it that can be attacked
            let newBoard = this.highlightElements(this.state.board.slice());
        
            



            // // update the state with the piece they selected
            // this.setState(state => {
            //     return {selection: state.board[row][column]};
            // });






        } 
        // if there is a piece currently selected
        else {

        }
        let row = Math.floor(position / 8);
        let column = position % 8;
        console.log("you have pressed the mouse at " + row + " " + column);
    }

    highlightElements(newBoard) {

    }

    // renders an individual square of the board
    renderSquare(position, shade) {
        // if there is a piece in this square make sure to display the piece
        let src = (this.state.board[position].piece === null ? "null" : this.state.board[position].piece.src);
        return (<Square 
                    handleMouseDown={() => this.handleMouseDown(position)}
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