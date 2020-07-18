import Piece from './Piece';
import sources from './sources';
import { canMovePawn } from '../helpers/movement-heplers';


// Pawn 
// This is the class to represent a pawn
class Pawn extends Piece {
    constructor(friendly) {
        super(friendly, (friendly ? sources.blackPawn : sources.whitePawn));
    }

    // determines whether the pawn can be moved to the specified location
    canMove(start, destination, board) {
        return canMovePawn(start, destination, board);
    }
}

export default Pawn;