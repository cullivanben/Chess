import Piece from './Piece';
import sources from './sources';

// King
// this class represents a chess king
class King extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackKing : sources.whiteKing), board);
    }
}

export default King;