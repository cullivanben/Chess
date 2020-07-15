import Piece from './Piece';
import sources from './sources';

// Rook
// this class represents a chess rook
class Rook extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackRook : sources.whiteRook), board);
    }

    // determines whether this rook can move to the specified location
    canMove(start, destination) {
        // this rook cannot move if it is protecting the king
        if (this.protectingKing) return false;
        // if the destination is not in the same row or the same column the rook cannot move there
        if (start.row != destination.row && start.column != destination.column) return false;
        // if there is a piece in front of 
    }
}

export default Rook