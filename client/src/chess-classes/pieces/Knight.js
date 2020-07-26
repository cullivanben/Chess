import uuid from 'react-uuid';
import sources from './sources';

export default class Knight {
    constructor(friendly, color) {
        this.id = uuid();
        this.friendly = friendly;
        this.color = color;
        this.pieceType = 'Knight';
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackKnight : sources.whiteKnight;
    }
}
