import uuid from 'react-uuid';
import sources from './sources';

/**
 *Represents a chess Pawn.
 *
 * @export
 * @class Pawn
 */
export default class Pawn {

    /**
     *Creates an instance of Pawn.
     * @param {boolean} friendly - Whether this piece is on the user's side.
     * @param {boolean} color - The color of this piece.
     * @memberof Pawn
     */
    constructor(friendly, color) {
        // an id which will be used as a key in list items
        this.id = uuid();

        // whether this piece is on the user's side
        this.friendly = friendly;

        // the color of this piece: white or black
        this.color = color;

        // the type of chess piece that this piece represents
        this.pieceType = 'Pawn';
        
        // the url to the svg of this piece
        this.src = ((color === 'black' && friendly) || (color === 'white' && !friendly)) ?
            sources.blackPawn : sources.whitePawn;
    }
}
