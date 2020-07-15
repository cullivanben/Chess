import Piece from './Piece';
import sources from './sources';
import { canMoveBishop, canMoveRook } from './movement-heplers';

// Queen
// this class represents a chess queen
class Queen extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackQueen : sources.whiteQueen), board);
    }

    // determines whether the queen can be moved to the specified destination
    canMove(start, destination, board) {
        // a queen can make the same moves as both a rook and a bishop
        // therefore, if either a rook or a bishop can make this move then a queen can make this move
        return canMoveRook(start, destination, board) || canMoveBishop(start, destination, board);
    }
}

export default Queen;