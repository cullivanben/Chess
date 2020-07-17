import Piece from './Piece';
import sources from '../sources';
import { canMoveKing } from '../helpers/movement-heplers';

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
}

export default King;