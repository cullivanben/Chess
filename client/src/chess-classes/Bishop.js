import Piece from './Piece';
import sources from './sources';
import { canMoveBishop } from './movement-heplers';
import { bishopCanAttack } from './king-attack-helpers';

// Bishop
// this class represents a chess bishop
class Bishop extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackBishop : sources.whiteBishop), board);
    }

    // determines whether the bishop can move to the specified location
    canMove(start, destination, board) {
        return canMoveBishop(start, destination, board);
    }

    // determines whether the bishop will be able to attack the king after this move has occurred
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return bishopCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default Bishop;