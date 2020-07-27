import King from '../../chess-classes/pieces/King';
import Queen from '../../chess-classes/pieces/Queen';
import Bishop from '../../chess-classes/pieces/Bishop';
import Knight from '../../chess-classes/pieces/Knight';
import Rook from '../../chess-classes/pieces/Rook';
import Pawn from '../../chess-classes/pieces/Pawn';
import Spot from '../../chess-classes/Spot';


/**
 *Static helper methods.
 *
 * @export
 * @class Help
 */
export default class Help {
    /**
     *Converts an enemy position number to a friendly position number. 
     *
     * @static
     * @param {number} position - The enemy position number.
     * @returns {number} The friendly position number.
     * @memberof Help
     */
    static convertPos(position) {
        // since we are essentially just rotating the board 180 degrees, 
        // subtracting the position of the current piece from the maximum 
        // position gives the position that this piece will have on the 
        // enemy's board
        return 63 - position;
    }

    /**
     *Converts an object to a Spot.
     *
     * @static
     * @param {object} obj - The object to be converted.
     * @returns {Spot} The newly constructed Spot.
     * @memberof Help
     */
    static createSpot(obj) {
        let spot = new Spot(obj.position);
        if (obj.piece !== null) spot.piece = this.createPiece(obj.piece);
        return spot;
    }

    // converts an object to a piece
    /**
     *Converts and object to a Piece.
     *
     * @static
     * @param {object} obj - The object to be converted.
     * @returns The newly constructed piece.
     * @memberof Help
     */
    static createPiece(obj) {
        switch (obj.pieceType) {
            case 'Pawn':
                return new Pawn(obj.friendly, obj.color);
            case 'Bishop':
                return new Bishop(obj.friendly, obj.color);
            case 'Knight':
                return new Knight(obj.friendly, obj.color);
            case 'Rook':
                return new Rook(obj.friendly, obj.color);
            case 'Queen':
                return new Queen(obj.friendly, obj.color);
            default:
                return new King(obj.friendly, obj.color);
        }
    }

    /**
     *Determines the chess code of the move that just took place.
     *
     * @static
     * @param {number} location - The location that this piece moved to.
     * @param {string} pieceType - The type of this piece.
     * @param {string} color - The color of this piece.
     * @returns {string} The chess code of the move.
     * @memberof Help
     */
    static getNumLetterCode(location, pieceType, color) {
        // convert the position if necessary
        if (color === 'black') location = 63 - location;

        // append the first letter of the color of the piece that made this move to 
        // the beginning of the code. This will be used when the dead piece is rendered
        return (color.substring(0, 1) +
            this.getPieceLetter(pieceType) +
            String.fromCharCode(97 + (location % 8)) +
            (8 - Math.floor(location / 8)));
    }

    /**
     *Gets the uppercase letter for a given piece type.
     *
     * @static
     * @param {string} pieceType - The type of this piece.
     * @returns {string} The uppercase letter.
     * @memberof Help
     */
    static getPieceLetter(pieceType) {
        switch (pieceType) {
            case 'Pawn':
                return '';
            case 'Bishop':
                return 'B';
            case 'Knight':
                return 'N';
            case 'Rook':
                return 'R';
            case 'Queen':
                return 'Q';
            default:
                return 'K';
        }
    }
}