// this class represents a spot on the game board with a 
// row, column, piece, and whether it is occupied


class Spot {
    constructor(position) {
        this.position = position;
        this.piece = null;
    }
}

export default Spot;