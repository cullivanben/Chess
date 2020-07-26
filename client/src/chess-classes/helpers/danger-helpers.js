import Pawn from '../pieces/Pawn';
import Knight from '../pieces/Knight';
import King from '../pieces/King';

// whether a given spot on the board is being attacked by the enemy
export function dangerous(location, board, friendly, kingPosition, attackingFriendlyKing) {
    // check every piece on the board and see if it can attack the specified location
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && friendly !== board[i].piece.friendly &&
            board[i].piece.canMove(board[i], location, board, kingPosition, attackingFriendlyKing)) return true;
    }
    return false;
}

// if this function executes we know that the king is not currently in check
// this function returns whether the king would be in check if this move took place
export function cantMove(start, destination, board, kingPosition) {
    // loop over every spot on the board.
    // at any given spot, if there is a piece and it is on the opposite team as the piece that is moving
    // if it is not in the distination spot (i.e. is not about to be killed) and will be able to attack the king 
    // once this move is made, then this move cannot be made, return true
    // it is important to note that if a given piece is a pawn, knight, or king a move by the other team
    // will not enable them to attack the king because kings and pawns must be directly adjacent to a piece in order
    // to attack it, thus if they are able to attack the king they must have alread been able to attack it before this move.
    // In the case of the knight it is not possible to block it by placing a piece between it and the king because knights
    // can jump over other pieces, thus if a knight is not able to attack the king it is not possible for this player to 
    // make a move that will suddenly enable an enemy knight to put their king in check
    // if this piece is a rook, bishop, or queen we must check to see if it will be able to move to the location of the king 
    // after this move takes place. If this is true, then this move is not legal because it would place the friendly king 
    // in check. It is important to note that there are some situations where a piece has the enemy king in check but is simultaneously
    // protecting its own king from check. Even though that piece would not be able to move to attack the enemy king, it is still 
    // considered to have the enemy king in check. For this reason, when we are seeing if an enemy piece will be able to attack the 
    // friendly king after this move takes place we will not take into account whether the enemy piece is protecting its own king
    // all that matters is that it could conceivably attack the friendly king
    for (let i = 0; i < board.length; i++) {
        if (board[i].piece !== null && (start.piece.friendly !== board[i].piece.friendly) && board[i].position !== destination.position
            && !(board[i].piece instanceof Pawn) && !(board[i].piece instanceof Knight) && !(board[i].piece instanceof King)
            && board[i].piece.willAttackKing(board[i], kingPosition, board, start, destination))
            return true;
    }
    return false;
}

// determines if making this move will remove the king from check
export function willRemoveCheck(start, destination, board, kingPosition, attackerPositions) {
    // if there is only one attacker and this piece is about to kill the attacker, 
    // this move will remove the king from check
    if (attackerPositions.size === 1 && attackerPositions.has(destination.position)) return true;
    // if there is more than one attacker and this piece is about to kill one of them,
    // this move will not remove the king from check
    if (attackerPositions.size > 1 && attackerPositions.has(destination.position)) return false;
    // now that we know that none of the attackers are being killed,
    // if the piece is an instanceof knight or pawn then this move will not remove the king from check
    // because it is not killing them 
    // this is because it is not possible to stop a knight or pawn from
    // attacking the king without moving the king or killing them - in this situation we know that 
    // neither of these conditions are true so we must return false
    // if the piece is an instanceof Rook, Bishop, or Queen we check to see if it will be able to attack
    // we will ignore the start location because there will not be a piece there after this move, 
    // we know that the destination will be occupied, so it is blocking any king attack attempts
    // thus, we will ignore the start location and hypothetically fill the destination position
    // if the piece will be able to attack the king after this move, then this move does not remove 
    // the king from check, return false
    let it = attackerPositions.values();
    let num = it.next();
    while (!it.done()) {
        if (board[num.value].piece !== null && (board[num.value].piece instanceof Pawn ||
            board[num.value].piece instanceof Knight || board[num.value].piece.willAttackKing(board[num.value],
                kingPosition, board, start, destination))) return false;
        num = it.next();
    }
    // if execution made it this far, then the attackers can no longer attack the king
    return true;
}

// returns whether the rook will be able to attack the king after ignoreOne moves to ignoreTwo
export function rookWillAttack(position, kingPosition, board, ignore, blocked) {
    // convert the positions to rows and columns
    // thisRow and thisColumn represent the location of the enemy piece that 
    // may be able to attack the friendly king
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    // kingRow and kingColumn represent the location of the friendly king
    let kingRow = Math.floor(kingPosition / 8);
    let kingColumn = kingPosition % 8;
    // ignoreRow and ignoreColumn represent the location that the friendly
    // piece that is being moved was before the current move took place
    // thus, after the current move there will be no piece at that spot 
    // and it should be ignored as if there is not piece there
    let ignoreRow = Math.floor(ignore.position / 8);
    let ignoreColumn = ignore.position % 8;
    // blockedRow and blockedColumn represent the location where the 
    // friendly piece that is being moved will be after this move takes place
    // this position will be blocked on the following turn and should be 
    // treated as such
    let blockedRow = Math.floor(blocked.position / 8);
    let blockedColumn = blocked.position % 8;
    // if the king is not in either the same row or column, the rook cannot attack
    if (thisRow !== kingRow && thisColumn !== kingColumn) return false;

    // if there is a piece between this rook and the king, then it cannot attack
    // proceed through the various cases:

    // the cases where the friendly king and enemy piece are in the same row
    if (thisRow === kingRow) {
        // the case where the enemy piece is to the left of the king
        if (thisColumn < kingColumn) {
            // loop over every position in this column between the row of the 
            // enemy piece and the row of the king
            for (let i = thisColumn + 1; i < kingColumn; i++) {
                // if this position is not the position that is being ignored
                // and it has a piece in it, or this is the position that 
                // if being blocked: 
                // the enemy piece can not attack the friendly king
                if (((thisRow !== ignoreRow || i !== ignoreColumn) && board[thisRow * 8 + i].piece !== null)
                    || (thisRow === blockedRow && i === blockedColumn)) return false;
            }
        }
        // the case where the enemy piece is to the right of the king
        else if (thisColumn > kingColumn) {
            // loop over every position in this column between the row of the 
            // enemy piece and the row of the king
            for (let i = thisColumn - 1; i > kingColumn; i--) {
                // if this position is not the position that is being ignored
                // and it has a piece in it, or this is the position that 
                // if being blocked: 
                // the enemy piece can not attack the friendly king
                if (((thisRow !== ignoreRow || i !== ignoreColumn) && board[thisRow * 8 + i].piece !== null)
                    || (thisRow === blockedRow && i === blockedColumn)) return false;
            }
        }
        // this will never execute because the enemy piece and friendly king
        // will never be in the same position. Howver, in order to practice 
        // a defensive coding style, return false if this executes
        else return false;
    }
    // the cases where the friendly king and enemy piece are in the same column
    else {
        // the case where the enemy piece is above the king
        if (thisRow < kingRow) {
            // loop over every position in this column between the row of the 
            // enemy piece and the row of the king
            for (let i = thisRow + 1; i < kingRow; i++) {
                // if this position is not the position that is being ignored
                // and it has a piece in it, or this is the position that 
                // if being blocked: 
                // the enemy piece can not attack the friendly king
                if (((i !== ignoreRow || thisColumn !== ignoreColumn) && board[i * 8 + thisColumn].piece !== null)
                    || (i === blockedRow && thisColumn === blockedColumn)) return false;
            }
        }
        // the case where the enemy piece is below the king
        else if (thisRow > kingRow) {
            // loop over every position in this column between the row of the 
            // enemy piece and the row of the king
            for (let i = thisRow - 1; i > kingRow; i--) {
                // if this position is not the position that is being ignored
                // and it has a piece in it, or this is the position that 
                // if being blocked: 
                // the enemy piece can not attack the friendly king
                if (((i !== ignoreRow || thisColumn !== ignoreColumn) && board[i * 8 + thisColumn].piece !== null)
                    || (i === blockedRow && thisColumn === blockedColumn)) return false;
            }
        }
        // this will never execute because the enemy piece and friendly king
        // will never be in the same position. Howver, in order to practice 
        // a defensive coding style, return false if this executes
        else return false;
    }
    // if none of the above conditions were met 
    // this enemy rook will be able to attack the friendly king
    return true;
}

// returns whether the bishop will be able to attack the king after ignoreOne moves to ignoreTwo
export function bishopWillAttack(position, kingPosition, board, ignore, blocked) {
    // convert the positions to rows and columns
    // thisRow and thisColumn represent the location of the enemy piece that 
    // may be able to attack the friendly king
    let thisRow = Math.floor(position.position / 8);
    let thisColumn = position.position % 8;
    // kingRow and kingColumn represent the location of the friendly king
    let kingRow = Math.floor(kingPosition / 8);
    let kingColumn = kingPosition % 8;
    // ignoreRow and ignoreColumn represent the location that the friendly
    // piece that is being moved was before the current move took place
    // thus, after the current move there will be no piece at that spot 
    // and it should be ignored as if there is not piece there
    let ignoreRow = Math.floor(ignore.position / 8);
    let ignoreColumn = ignore.position % 8;
    // blockedRow and blockedColumn represent the location where the 
    // friendly piece that is being moved will be after this move takes place
    // this position will be blocked on the following turn and should be 
    // treated as such
    let blockedRow = Math.floor(blocked.position / 8);
    let blockedColumn = blocked.position % 8;
    // if the king is not on a diagonal from this bishop, this bishop cannot attack
    if (Math.abs(kingRow - thisRow) !== Math.abs(kingColumn - thisColumn)) return false;

    // if there is a piece between this bishop and the king, this bishop cannot attack
    // proceed through the various cases:

    // the cases where the enemy piece is to the left of the friendly king
    if (thisColumn < kingColumn) {
        // the case where the enemy piece is to the top-left of the friendly king
        if (thisRow < kingRow) {
            // loop over every position between the enemy piece and the friendly king
            for (let i = thisRow + 1, j = thisColumn + 1; i < kingRow; i++) {
                // if this position is not the position that is being ignored
                // and there is a piece in this position, or 
                // this position is the position that is being blocked:
                // the enemy piece cannot attack the friendly king
                if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                    || (i === blockedRow && j++ === blockedColumn)) return false;
            }
        }
        // the case where the enemy piece is to the bottom left of the 
        else if (thisRow > kingRow) {
            // loop over every position between the enemy piece and the friendly king
            for (let i = thisRow - 1, j = thisColumn + 1; i > kingRow; i--) {
                // if this position is not the position that is being ignored
                // and there is a piece in this position, or 
                // this position is the position that is being blocked:
                // the enemy piece cannot attack the friendly king
                if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                    || (i === blockedRow && j++ === blockedColumn)) return false;
            }
        }
        // this case will never execute because if execution made it this far,
        // the enemy piece cannot be in the same row as the friendly king.
        // However, in order to maintain a defensive coding style, in the event
        // that this case actually executes, return false.
        else return false;
    }
    else {
        if (thisRow < kingRow) {
            // loop over every position between the enemy piece and the friendly king
            for (let i = thisRow + 1, j = thisColumn - 1; i < kingRow; i++) {
                // if this position is not the position that is being ignored
                // and there is a piece in this position, or 
                // this position is the position that is being blocked:
                // the enemy piece cannot attack the friendly king
                if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null)
                    || (i === blockedRow && j-- === blockedColumn)) return false;

            }
        }
        else if (thisRow > kingRow) {
            // loop over every position between the enemy piece and the friendly king
            for (let i = thisRow - 1, j = thisColumn - 1; i > kingRow; i--) {
                // if this position is not the position that is being ignored
                // and there is a piece in this position, or 
                // this position is the position that is being blocked:
                // the enemy piece cannot attack the friendly king
                if (((i !== ignoreRow || j !== ignoreColumn) && board[i * 8 + j].piece !== null) 
                    || (i === blockedRow && j-- === blockedColumn)) return false;
            }
        }
        // this case will never execute because if execution made it this far,
        // the enemy piece cannot be in the same row as the friendly king.
        // However, in order to maintain a defensive coding style, in the event
        // that this case actually executes, return false.
        else return false;
    }
    // if none of the above conditions were met
    // this enemy bishop will be able to attack the friendly king
    return true;
}

