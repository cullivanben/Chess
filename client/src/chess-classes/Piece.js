// Piece
// This is the class that will be the super class for all of the chess pieces on the chess board.
class Piece {
    constructor(friendly, iconURL, board) {
        this.friendly = friendly;
        this.board = board;
        this.style = {backgroundImage: "url('"+iconURL+"')"};
    }
}

export default Piece;