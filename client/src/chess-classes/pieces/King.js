import uuid from 'react-uuid';
import sources from './sources';

export default class King {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'King';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackKing : sources.whiteKing;
    }
}
