import uuid from 'react-uuid';
import sources from './sources';

export default class Pawn {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Pawn';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackPawn : sources.whitePawn;
    }
}
