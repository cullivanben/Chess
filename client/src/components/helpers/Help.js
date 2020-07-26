import King from '../../chess-classes/pieces/King';
import Queen from '../../chess-classes/pieces/Queen';
import Bishop from '../../chess-classes/pieces/Bishop';
import Knight from '../../chess-classes/pieces/Knight';
import Rook from '../../chess-classes/pieces/Rook';
import Pawn from '../../chess-classes/pieces/Pawn';
import Spot from '../../chess-classes/Spot';


export default class Help {
    // converts enemy positions to friendly positions
    static convertPos(position) {
        return 63 - position;
    }

    // converts an object to a spot
    static createSpot(obj) {
        let spot = new Spot(obj.position);
        if (obj.piece !== null) spot.piece = this.createPiece(obj.piece);
        return spot;
    }

    // converts an object to a piece
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

    // returns the chess code for the move with the color appended to the beginning for id purposes
    static getNumLetterCode(location, pieceType, color) {
        if (color === 'white') location = 63 - location;
        return (color.substring(0, 1) +
            this.getPieceLetter(pieceType) +
            String.fromCharCode(97 + (location % 8)) +
            (8 - Math.floor(location / 8)));
    }

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