import uuid from 'react-uuid';
import sources from './sources';

/**
 *Represents a chess Knight.
 *
 * @export
 * @class Knight
 */
export default class Knight {
    /**
     *Creates an instance of Knight.
     * @param {boolean} friendly - Whether this piece is on the user's side. 
     * @param {string} color - The color of this piece.
     * @memberof Knight
     */
    constructor(friendly, color) {
        // an id which will be used as a key in list items
        this.id = uuid();

        // whether this piece is on the user's side
        this.friendly = friendly;

        // the color of this piece: white or black
        this.color = color;

        // the type of chess piece that this piece represents
        this.pieceType = 'Knight';

        // the url to the svg of this piece
        this.src = ((color === 'white' && friendly) || (color === 'black' && !friendly)) ?
            sources.whiteKnight : sources.blackKnight;
    }
}
