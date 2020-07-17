import Piece from './Piece';
import sources from './sources';
import { canMovePawn } from './movement-heplers';
import { pawnCanAttack } from './king-attack-helpers';

// Pawn 
// This is the class to represent a pawn
class Pawn extends Piece {
    constructor(friendly) {
        super(friendly, (friendly ? sources.blackPawn : sources.whitePawn));
    }

    // determines whether the pawn can be moved to the specified location
    canMove(start, destination, board) {
        return canMovePawn(start, destination, board);
    }

    // determines whether this pawn will be able to attack the king after this move has occurred
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return pawnCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default Pawn;