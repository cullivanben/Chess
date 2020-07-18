import Spot from '../chess-classes/Spot';
import King from '../chess-classes/pieces/King';
import Queen from '../chess-classes/pieces/Queen';
import Knight from '../chess-classes/pieces/Knight';
import Bishop from '../chess-classes/pieces/Bishop';
import Rook from '../chess-classes/pieces/Rook';
import Pawn from '../chess-classes/pieces/Pawn';


// initializes the chess board with all the pieces in their starting locations 
const initBoard = () => {
    // set up the array that will hold all of the spots on the board
    let board = [];
    board.length = 64;
    for (let i = 0; i < 64; i++) {
        board[i] = new Spot(i);
    }

    // non friendly pieces
    board[0].piece = new Rook(false, board);
    board[1].piece = new Knight(false, board);
    board[2].piece = new Bishop(false, board);
    board[3].piece = new Queen(false, board);
    board[4].piece = new King(false, board);
    board[5].piece = new Bishop(false, board);
    board[6].piece = new Knight(false, board);
    board[7].piece = new Rook(false, board);
    for (let i = 8; i < 16; i++) {
        board[i].piece = new Pawn(false, board);
    }

    // friendly pieces
    for (let i = 48; i < 56; i++) {
        board[i].piece = new Pawn(true, board);
    }
    board[56].piece = new Rook(true, board);
    board[57].piece = new Knight(true, board);
    board[58].piece = new Bishop(true, board);
    board[59].piece = new Queen(true, board);
    board[60].piece = new King(true, board);
    board[61].piece = new Bishop(true, board);
    board[62].piece = new Knight(true, board);
    board[63].piece = new Rook(true, board);

    return board;
}

export default initBoard;