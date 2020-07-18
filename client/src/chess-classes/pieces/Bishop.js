import Piece from './Piece';
import sources from './sources';
import { canMoveBishop } from '../helpers/movement-heplers';
import { bishopWillAttack } from '../helpers/danger-helpers';


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
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}

export default Bishop;