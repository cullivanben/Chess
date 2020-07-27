import uuid from 'react-uuid';
import sources from './sources';

/**
 *Represents a chess Rook.
 *
 * @export
 * @class Rook
 */
export default class Rook {
    /**
     *Creates an instance of Rook.
     * @param {boolean} friendly - Whether this piece is on the user's side.
     * @param {boolean} color - The color of this piece. 
     * @memberof Rook
     */
    constructor(friendly, color) {
        // an id which will be used as a key in list items
        this.id = uuid();

        // whether this piece is on the user's side
        this.friendly = friendly;

        // the color of this piece: white or black
        this.color = color;

        // the type of chess piece that this piece represents
        this.pieceType = 'Rook';

        // the url to the svg of this piece
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackRook : sources.whiteRook;
    }
}
