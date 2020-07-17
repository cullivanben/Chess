import Piece from './Piece';
import sources from './sources';
import { canMoveRook } from './movement-heplers';
import { rookCanAttack } from './king-attack-helpers';

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

    // determines whether this rook will be able to attack the king after this move 
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return rookCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default Rook