import King from '../../chess-classes/pieces/King';
import Queen from '../../chess-classes/pieces/Queen';
import Bishop from '../../chess-classes/pieces/Bishop';
import Knight from '../../chess-classes/pieces/Knight';
import Rook from '../../chess-classes/pieces/Rook';
import Pawn from '../../chess-classes/pieces/Pawn';
import Spot from '../../chess-classes/Spot';

// converts enemy positions to friendly positions
export function convertPos(position) {
    return 63 - position;
}

// converts an object to a spot
export function createSpot(obj) {
    let spot = new Spot(obj.position);
    if (obj.piece !== null) spot.piece = createPiece(obj.piece);
    return spot;
}

// converts an object to a piece
function createPiece(obj) {
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