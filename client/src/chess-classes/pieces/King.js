import uuid from 'react-uuid';
import sources from './sources';

/**
 *Represents a chess King.
 *
 * @export
 * @class King
 */
export default class King {
    /**
     *Creates an instance of King.
     * @param {boolean} friendly - Whether this piece is on the user's side.
     * @param {boolean} color - The color of this piece.
     * @memberof King
     */
    constructor(friendly, color) {
        // an id which will be used as a key in list items
        this.id = uuid();

        // whether this piece is on the user's side
        this.friendly = friendly;

        // the color of this piece: white or black
        this.color = color;

        // the type of chess piece that this piece represents
        this.pieceType = 'King';

        // the url to the svg of this piece
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackKing : sources.whiteKing;
    }
}
