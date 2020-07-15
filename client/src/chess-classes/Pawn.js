import Piece from './Piece';
import sources from './sources';

// Pawn 
// This is the class to represent a pawn
class Pawn extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackPawn : sources.whitePawn), board);
    }

    // determines whether the piece can be moved 
    canMove(start, destination) {
        // if this piece is currently protecting the king then it cannot be moved
        if (this.protectingKing) return false;
        // if this piece is on the home row, moving two spots ahead is legal
        if (start.row == 6 && destination.row == 4 && start.column == destination.column) return true;
        // if the destination is occupied, diagonal moves are legal
        if (destination.isOccupied) {
            // this piece can move to one of the three spots in front of it in the next row
            return (start.row - 1 == destination.row && destination.column >= start.column - 1 
                && destination.column <= start.column - 1);
        } 
        // if the destination is not occupied, diagonal moves are not legal
        else {  
            // this piece can only move to the spot directly in front of it
            return start.row - 1 == destination.row && start.column == destination.column;
        }
    }
}

export default Pawn;