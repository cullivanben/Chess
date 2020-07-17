import Piece from './Piece';
import sources from './sources';
import { canMoveKing } from './movement-heplers';
import { kingCanAttack } from './king-attack-helpers';

// King
// this class represents a chess king
class King extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackKing : sources.whiteKing), board);
    }

    // determines whether the king can be moved to the specified location
    canMove(start, destination, board) {
        return canMoveKing(start, destination, board);
    }

    // determines whether the king will be able to attack the enemy king after this move has occurred
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) { 
        return kingCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default King;