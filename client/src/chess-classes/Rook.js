import Piece from './Piece';
import sources from './sources';
import { canMoveRook } from './movement-heplers';

// Rook
// this class represents a chess rook
class Rook extends Piece {
    constructor(friendly) {
        super(friendly, (friendly ? sources.blackRook : sources.whiteRook));
    }

    // determines whether this rook can move to the specified location
    canMove(start, destination, board) {
        return canMoveRook(start, destination, board);
    }
}

export default Rook