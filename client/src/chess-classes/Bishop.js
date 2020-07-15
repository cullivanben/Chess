import Piece from './Piece';
import sources from './sources';

// Bishop
// this class represents a chess bishop
class Bishop extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackBishop : sources.whiteBishop), board);
    }
}

export default Bishop;