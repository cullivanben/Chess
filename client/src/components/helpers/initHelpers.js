import Spot from '../../chess-classes/Spot';
import King from '../../chess-classes/pieces/King';
import Queen from '../../chess-classes/pieces/Queen';
import Knight from '../../chess-classes/pieces/Knight';
import Bishop from '../../chess-classes/pieces/Bishop';
import Rook from '../../chess-classes/pieces/Rook';
import Pawn from '../../chess-classes/pieces/Pawn';


// initializes the chess board with all the pieces in their starting locations 
export function initBoard(color) {
    // set up the array that will hold all of the spots on the board
    let board = [];
    board.length = 64;
    for (let i = 0; i < 64; i++) {
        board[i] = new Spot(i);
    }

    // non friendly pieces
    board[0].piece = new Rook(false, color);
    board[1].piece = new Knight(false, color);
    board[2].piece = new Bishop(false, color);
    board[5].piece = new Bishop(false, color);
    board[6].piece = new Knight(false, color);
    board[7].piece = new Rook(false, color);
    for (let i = 8; i < 16; i++) {
        board[i].piece = new Pawn(false, color);
    }

    // friendly pieces
    for (let i = 48; i < 56; i++) {
        board[i].piece = new Pawn(true, color);
    }
    board[56].piece = new Rook(true, color);
    board[57].piece = new Knight(true, color);
    board[58].piece = new Bishop(true, color);
    board[61].piece = new Bishop(true, color);
    board[62].piece = new Knight(true, color);
    board[63].piece = new Rook(true, color);

    // set up the kings and queens
    if (color === 'black') {
        board[3].piece = new Queen(false, color);
        board[4].piece = new King(false, color);
        board[59].piece = new Queen(true, color);
        board[60].piece = new King(true, color);
    } else {
        board[4].piece = new Queen(false, color);
        board[3].piece = new King(false, color);
        board[60].piece = new Queen(true, color);
        board[59].piece = new King(true, color);
    }

    return board;
}

export function initKingPos(color) {
    return color === 'black' ? 60 : 59;
}

export function initEnemyKingPos(color) {
    return color === 'black' ? 4 : 3;
}

export function initTurn(color) {
    return color === 'black';
}
