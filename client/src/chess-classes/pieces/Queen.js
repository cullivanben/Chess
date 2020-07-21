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
    canMove(start, destination, board, kingPosition) {
        // a queen can make the same moves as both a rook and a bishop
        // therefore, if either a rook or a bishop can make this move then a queen can make this move
        return canMoveRook(start, destination, board, kingPosition) || canMoveBishop(start, destination, board, kingPosition);
    }

    // determines whether this queen will be able to attack the king after this move has occurred
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return (rookWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo) ||
            bishopWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo));
    }
}
