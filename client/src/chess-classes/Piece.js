// Piece
// This is the class that will be the super class for all of the chess pieces on the chess board.
class Piece {
    constructor(friendly, iconURL) {
        this.friendly = friendly;
        this.src = iconURL;
        this.protectingKing = false;
    }
}

export default Piece;