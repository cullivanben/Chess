import React from 'react';
import Square from './Square';
import '../stylesheets/Board.scss';

// Board
// this will represent the chess board
// it will be indexed by row and column in the form [row,column]
// starting with [0,0] in the top left
class Board extends React.Component {
    // renders an individual square of the board
    renderSquare(row, column, shade) {
        // if there is a piece in this square make sure to display the piece
        let src = (this.props.board[row][column].piece === null ? "null" : this.props.board[row][column].piece.src);
        return (
            <Square 
                onClick={() => this.props.onClick(row, column)}
                shade={shade}
                src={src}
            />
        );
    }
    render() {
        // set up the board of squares to render
        let board = [];
        board.length = 8;
        for (let row = 0; row < 8; row++) {
            let toAdd = [];
            toAdd.length = 8;
            for (let column = 0; column < 8; column++) {
                let shade;
                if ((row % 2 === 0 && column % 2 === 0) || (row % 2 !== 0 && column % 2 !== 0)) shade = "light";
                else shade = "dark";
                toAdd[column] = this.renderSquare(row, column, shade);
            }
            board[row] = (<ul className="row">
                            {toAdd.map((square, i) => (
                                <li key={`${row} ${i}`}>{square}</li>
                            ))}
                        </ul>
                    );
        }
        return (
            <ul className="rows">
                {board.map((row, i) => (
                    <li key={i}>{row}</li>
                ))}
            </ul>
        );
    }
}

export default Board;