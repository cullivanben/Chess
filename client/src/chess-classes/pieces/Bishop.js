import uuid from 'react-uuid';
import sources from './sources';
import { canMoveBishop } from '../helpers/movement-heplers';
import { bishopWillAttack } from '../helpers/danger-helpers';

export default class Bishop {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Bishop';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackBishop : sources.whiteBishop;
    }

    // determines whether the bishop can move to the specified location
    canMove(start, destination, board, kingPosition, attackingFriendlyKing) {
        return canMoveBishop(start, destination, board, kingPosition, attackingFriendlyKing);
    }

    // determines whether the bishop will be able to attack the king after this move has occurred
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }

    // determines whether this piece just put the king in check
    putKingInCheck(startSpot, piece, enemyKingSpot, board, kingPosition) {
        startSpot.piece = piece;
        // this player's king will not be in check because even if it was in check before this move, 
        // the only moves are allowed when a player is in check are moves that bring them out of check
        // therefore, if this player is able to make a move, they will not be in check after this turn
        return canMoveBishop(startSpot, enemyKingSpot, board, kingPosition, new Set());
    }
}
