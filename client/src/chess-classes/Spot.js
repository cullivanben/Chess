// this class represents a spot on the game board with a 
// row, column, piece, and whether it is occupied

class Spot {
    constructor(row, column) {
        this.row = row;
        this.column = column;
        this.piece = null;
        this.canAttackKing = false;
        this.isProtectingKing = false;
    }
}

export default Spot;