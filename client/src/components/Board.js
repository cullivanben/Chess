import React from 'react';
import Square from './Square';

// Board
// this will represent the chess board
// it will be indexed by row and column in the form [row,column]
// starting with [0,0] in the top left
class Board extends React.Component {
    // renders an individual square of the board
    renderSquare(row, column, shade) {
        // set the style so that this square will show a piece if one is in this square
        let style = this.props.board[row][column].piece ? this.props.board[row][column].piece.style : null;
        return (
            <Square 
                onClick={this.props.onClick(row, column)}
                style={style}
                shade={shade}
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
                if ((row & 2 == 0 && column % 2 == 0) || (row % 2 != 0 && column % 2 != 0)) shade = "light";
                else shade = "dark";
                toAdd[column] = renderSquare(row, column, shade);
            }
            board[row] = <div>{toAdd}</div>
        }
        return <div>{board}</div>;
    }
}

export default Board;