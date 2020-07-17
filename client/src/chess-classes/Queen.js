import Piece from './Piece';
import sources from './sources';
import { canMoveRook, canMoveBishop } from './movement-heplers';
import { rookCanAttack, bishopCanAttack } from './king-attack-helpers';

// Queen
// this class represents a chess queen
class Queen extends Piece {
    constructor(friendly, board) {
        super(friendly, (friendly ? sources.blackQueen : sources.whiteQueen), board);
    }

    // determines whether the queen can be moved to the specified destination
    canMove(start, destination, board) {
        // a queen can make the same moves as both a rook and a bishop
        // therefore, if either a rook or a bishop can make this move then a queen can make this move
        return canMoveRook(start, destination, board) || canMoveBishop(start, destination, board);
    }

    // determines whether this queen will be able to attack the king after this move has occurred
    canAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return (rookCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo) ||
            bishopCanAttack(position, kingPosition, board, ignoreOne, ignoreTwo));
    }
}

export default Queen;