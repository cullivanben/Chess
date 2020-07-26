import uuid from 'react-uuid';
import sources from './sources';
import { canMovePawn } from '../helpers/movement-heplers';

export default class Pawn {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Pawn';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackPawn : sources.whitePawn;
    }

    // determines whether the pawn can be moved to the specified location
    canMove(start, destination, board, kingPosition, attackingFriendlyKing) {
        return canMovePawn(start, destination, board, kingPosition, attackingFriendlyKing);
    }

    // determines whether this piece just put the king in check
    putKingInCheck(startSpot, piece, enemyKingSpot, board, kingPosition) {
        startSpot.piece = piece;
        // this player's king will not be in check because even if it was in check before this move, 
        // the only moves are allowed when a player is in check are moves that bring them out of check
        // therefore, if this player is able to make a move, they will not be in check after this turn
        return canMovePawn(startSpot, enemyKingSpot, board, kingPosition, new Set());
    }
}
