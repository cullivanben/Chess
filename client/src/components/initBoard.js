import Spot from '../chess-classes/Spot';
import King from '../chess-classes/King';
import Queen from '../chess-classes/Queen';
import Knight from '../chess-classes/Knight';
import Bishop from '../chess-classes/Bishop';
import Rook from '../chess-classes/Rook';
import Pawn from '../chess-classes/Pawn';
import Spot from '../chess-classes/Spot';

// this file contains a function that initializes the chess board with all the pieces in their starting locations 
const initBoard = () => {
    // set up the 2D array that will hold all of the spots on the board
    let board = [];
    board.length = 8;
    for (let row = 0; row < 8; row++) {
        // populate a row of the board with spots
        let toAdd = [];
        toAdd.length = 8;
        for (let column = 0; column < 8; column++) {
            toAdd[column] = new Spot(row, column);
        }
        // add the row to the board
        board[row] = toAdd;
    }

    // add pieces to the boards in their starting locations
    // pawns
    for (let i = 0; i < 8; i++) {
        board[1][i].piece = new Pawn(false, board);
    }
    for (let i = 0; i < 8; i++) {
        board[6][i].piece = new Pawn(true, board);
    }

    // other non friendly pieces
    board[0][0].piece = new Rook(false, board);
    board[0][1].piece = new Knight(false, board);
    board[0][2].piece = new Bishop(false, board);
    board[0][3].piece = new Queen(false, board);
    board[0][4].piece = new King(false, board);
    board[0][5].piece = new Bishop(false, board);
    board[0][6].piece = new Knight(false, board);
    board[0][7].piece = new Rook(false, board);

    // other friendly pieces
    board[7][0].piece = new Rook(true, board);
    board[7][1].piece = new Knight(true, board);
    board[7][2].piece = new Bishop(true, board);
    board[7][3].piece = new Queen(true, board);
    board[7][4].piece = new King(true, board);
    board[7][5].piece = new Bishop(true, board);
    board[7][6].piece = new Knight(true, board);
    board[7][7].piece = new Rook(true, board);

    return board;
}

export default initBoard;