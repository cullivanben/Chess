import Piece from './Piece';
import sources from './sources';

// Knight
// this class represents a chess knight
class Knight extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackKnight : sources.whiteKnight), board);
    }
}

export default Knight;