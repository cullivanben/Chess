import uuid from 'react-uuid';
import sources from './sources';
import { canMoveRook } from '../helpers/movement-heplers';
import { rookWillAttack } from '../helpers/danger-helpers';

export default class Rook {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Rook';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackRook : sources.whiteRook;
    }

    // determines whether this rook can move to the specified location
    canMove(start, destination, board, kingPosition, attackingFriendlyKing) {
        return canMoveRook(start, destination, board, kingPosition, attackingFriendlyKing);
    }

    // determines whether this rook will be able to attack the king after this move 
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return rookWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }

    // determines whether this piece just put the king in check
    putKingInCheck(startSpot, piece, enemyKingSpot, board, kingPosition) {
        startSpot.piece = piece;
        // this player's king will not be in check because even if it was in check before this move, 
        // the only moves are allowed when a player is in check are moves that bring them out of check
        // therefore, if this player is able to make a move, they will not be in check after this turn
        return canMoveRook(startSpot, enemyKingSpot, board, kingPosition, new Set());
    }
}
