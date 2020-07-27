import Spot from '../../chess-classes/Spot';
import King from '../../chess-classes/pieces/King';
import Queen from '../../chess-classes/pieces/Queen';
import Knight from '../../chess-classes/pieces/Knight';
import Bishop from '../../chess-classes/pieces/Bishop';
import Rook from '../../chess-classes/pieces/Rook';
import Pawn from '../../chess-classes/pieces/Pawn';

// this class contains static methods that help initialize the chess game
export default class Init {

    // initializes the chess board with all the pieces in their starting locations 
    static initBoard(color) {
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
        }
        else {
            board[4].piece = new Queen(false, color);
            board[3].piece = new King(false, color);
            board[60].piece = new Queen(true, color);
            board[59].piece = new King(true, color);
        }

        return board;
    }

    // initializes the position of the friendly king
    static initKingPos(color) {
        return color === 'black' ? 60 : 59;
    }

    // initializes the position of the enemy king
    static initEnemyKingPos(color) {
        return color === 'black' ? 4 : 3;
    }

    // determines whether this player goes first
    static initTurn(color) {
        return color === 'black';
    }

    // initializes the order of the letter labels on the bottom of the board
    static initLetters(color) {
        return (color === 'black' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] :
            ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']);
    }

    // initializes the order of the number labels on the side of the board
    static initNumbers(color) {
        return (color === 'black' ? [8, 7, 6, 5, 4, 3, 2, 1] :
            [1, 2, 3, 4, 5, 6, 7, 8]);
    }
}
