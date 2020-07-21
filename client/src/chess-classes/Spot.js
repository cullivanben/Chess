import uuid from 'react-uuid';

// this class represents a spot on the game board with a row, column, piece, and boolean for whether it is occupied
export default class Spot {
    constructor(position) {
        this.id = uuid();
        this.position = position;
        this.piece = null;
    }
}