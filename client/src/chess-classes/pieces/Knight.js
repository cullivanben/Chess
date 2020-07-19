import sources from './sources';
import { canMoveKnight } from '../helpers/movement-heplers';

export default class Knight {
    constructor(friendly, color) {
        this.friendly = friendly;
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackKnight : sources.whiteKnight;
    }

    // determines whether the knight can be moved to the specified location
    canMove(start, destination, board) {
        return canMoveKnight(start, destination, board);
    }
}
