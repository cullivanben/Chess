import React from 'react';
import Board from './Board';
import initBoard from './initBoard';

// ChessSide
// this component will contain everything on the chess side of the screen
class ChessSide extends React.Component {
    constructor() {
        super();
        this.state = {
            board: initBoard(),
            killedEnemy: [],
            killedFriendly: [],
            selection: null,
            turn: "self"
        }
    }

    handleClick(row, column) {
        // if there has been no piece selected yet
        if (this.state.selection === null) {
            // if they did not select one of their pieces, do nothing
            if (this.state.board[row][column].piece === null || !this.state.board[row][column].piece.friendly) return;
            // they must have selected one of their pieces
            //let newBoard = this.state.board;
            // get the locations of potential moves

            // update the colors of the pieces that would be valid moves


            // update the state with the new board
            //this.setState({board: newBoard});
        }


    }

    render() {
        //console.log("board: ");
        //console.log(this.state.board);
        return (
            <div>
                <Board 
                    board={this.state.board}
                    onClick={(row, column) => this.handleClick(row, column)}
                />
            </div>
        );
    }
}

export default ChessSide;