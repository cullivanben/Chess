import Piece from './Piece';
import sources from './sources';
import { canMoveBishop } from './movement-heplers';

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
}

export default Bishop;