import uuid from 'react-uuid';
import sources from './sources';
import { canMoveRook, canMoveBishop } from '../helpers/movement-heplers';
import { rookWillAttack, bishopWillAttack } from '../helpers/danger-helpers';

export default class Queen {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Queen';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackQueen : sources.whiteQueen;
    }

    // determines whether the queen can be moved to the specified destination
    canMove(start, destination, board, kingPosition, attackingFriendlyKing) {
        // a queen can make the same moves as both a rook and a bishop
        // therefore, if either a rook or a bishop can make this move then a queen can make this move
        return (canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing) || 
            canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing));
    }

    // determines whether this queen will be able to attack the king after this move has occurred
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return (rookWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo) ||
            bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo));
    }

    // determines whether this piece just put the king in check
    putKingInCheck(startSpot, piece, enemyKingSpot, board, kingPosition) {
        startSpot.piece = piece;
        // this player's king will not be in check because even if it was in check before this move, 
        // the only moves are allowed when a player is in check are moves that bring them out of check
        // therefore, if this player is able to make a move, they will not be in check after this turn
        return (canMoveRook(startSpot, enemyKingSpot, board, kingPosition, new Set()) ||
            canMoveBishop(startSpot, enemyKingSpot, board, kingPosition, new Set()));
    }
}
