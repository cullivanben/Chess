import uuid from 'react-uuid';
import sources from './sources';

export default class Queen {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Queen';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackQueen : sources.whiteQueen;
    }
}
