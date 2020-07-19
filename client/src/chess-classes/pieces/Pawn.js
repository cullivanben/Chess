import sources from './sources';
import { canMovePawn } from '../helpers/movement-heplers';

export default class Pawn {
    constructor(friendly, color) {
        this.friendly = friendly;
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ? 
            sources.blackPawn : sources.whitePawn;
    }

    // determines whether the pawn can be moved to the specified location
    canMove(start, destination, board) {
        return canMovePawn(start, destination, board);
    }
}
