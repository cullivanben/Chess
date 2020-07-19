import sources from './sources';
import { canMoveKing } from '../helpers/movement-heplers';

export default class King {
    constructor(friendly, color) {
        this.friendly = friendly;
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ? 
            sources.blackKing : sources.whiteKing;
    }

    // determines whether the king can be moved to the specified location
    canMove(start, destination, board) {
        return canMoveKing(start, destination, board);
    }
}
