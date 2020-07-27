import uuid from 'react-uuid';

// this class represents a spot on the game board with a row, column, piece, and boolean for whether it is occupied
export default class Spot {
    constructor(position) {
        // an id that will be used as a key in list items
        this.id = uuid();

        // the position of this spot on the chess board:
        // a number between 0 and 63 (inclusive)
        // once it has been assigned, the position 
        // of this spot will never change
        this.position = position;

        // the piece at this spot on the board, 
        // or null if there is no piece at this spot
        this.piece = null;
    }
}