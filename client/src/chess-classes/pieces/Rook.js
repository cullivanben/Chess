import uuid from 'react-uuid';
import sources from './sources';

export default class Rook {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Rook';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackRook : sources.whiteRook;
    }
}
