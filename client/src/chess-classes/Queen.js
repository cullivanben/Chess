import Piece from './Piece';
import sources from './sources';

// Queen
// this class represents a chess queen
class Queen extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackQueen : sources.whiteQueen), board);
    }
}

export default Queen;