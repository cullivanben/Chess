import Piece from './Piece';
import sources from './sources';
import { canMoveKnight } from './movement-heplers';
import { knightCanAttack } from './king-attack-helpers';

// Knight
// this class represents a chess knight
class Knight extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackKnight : sources.whiteKnight), board);
    }

    // determines whether the knight can be moved to the specified location
    canMove(start, destination, board) {
        return canMoveKnight(start, destination, board);
    }

    // determines whether this knight will be able to attack the king after this move has occurred
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return knightCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default Knight;