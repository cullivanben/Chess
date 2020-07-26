import uuid from 'react-uuid';
import sources from './sources';

export default class Bishop {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Bishop';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackBishop : sources.whiteBishop;
    }
}