import sources from "./sources";
import { canMoveRook } from "../helpers/movement-heplers";
import { rookWillAttack } from "../helpers/danger-helpers";

export default class Rook {
    constructor(friendly, color) {
        this.friendly = friendly;
        this.color = color;
        this.src = ((color === "black" && friendly) || (color === "white" && !friendly)) ? 
            sources.blackRook : sources.whiteRook;
    }

    // determines whether this rook can move to the specified location
    canMove(start, destination, board, kingPosition) {
        return canMoveRook(start, destination, board, kingPosition);
    }

    // determines whether this rook will be able to attack the king after this move 
    willAttackKing(position, kingPosition, board, ignoreOne, ignoreTwo) {
        return rookWillAttack(position, kingPosition, board, ignoreOne, ignoreTwo);
    }
}
