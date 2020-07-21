import React from 'react';
import DeadSquare from './DeadSquare';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/StatsBar.scss';

// gets the svg source of a piece
function getSrc(piece, color) {
    switch (piece) {
        case 'Pawn':
            return color === 'black' ? sources.blackPawn : sources.whitePawn;
        case 'Rook':
            return color === 'black' ? sources.blackRook : sources.whiteRook;
        case 'Knight': 
            return color === 'black' ? sources.blackKnight : sources.whiteKnight;
        case 'Bishop':
            return color === 'black' ? sources.blackBishop : sources.whiteBishop;
        case 'Queen':
            return color === 'black' ? sources.blackQueen : sources.whiteQueen;
        default:
            return color === 'black' ? sources.blackKing : sources.whiteKing;
    }
}

// counts the number of dead pieces of each type and returns an array of them sorted by 
// number of casualties
function arrangeDead(arr) {
    let counts = new Map();
    arr.forEach(piece => {
        if (counts.has(piece)) counts.set(piece, counts.get(piece)+1);
        else counts.set(piece, 1);
    });
    let out = [];
    for (let key of counts.keys()) {
        out.push([key, counts.get(key)]);
        let i = out.length - 1;
        while (i > 0 && out[i-1][1] <= out[i][1]) {
            if (out[i-1][1] === out[i][1] && out[i-1][0] < out[i][0]) break;
            let temp = out[i];
            out[i] = out[i-1];
            out[i---1] = temp;
        }
    }
    return out;
}

// constructs a square with a piece svg and the number of this piece that have been killed
function renderDeadSquare(arr, i, color) {
    let src, count, key;
    if (i < arr.length) {
        src = getSrc(arr[i][0], color);
        count = arr[i][1];
        key = `${arr[i][0]} ${arr[i][1]}`;
    }
    else {
        src = 'null';
        count = 0;
        key = i;
    }
    return <DeadSquare key={key} src={src} count={count} />;
}

// sets up a row of dead enemies or dead friends
function setUpRow(arr, color) {
    let row = [];
    row.length = 5;
    for (let i = 0; i < 5; i++) row[i] = renderDeadSquare(arr, i, color);
    return row;
}

export default function StatsBar(props) {
    // get the color of the enemy
    let enemyColor = props.color === 'black' ? 'white' : 'black';
    
    // create the rows of enemies and friends
    let rowEnemies = setUpRow(arrangeDead(props.deadEnemies), enemyColor);
    let rowFriends = setUpRow(arrangeDead(props.deadFriends), props.color);

    return (<div className="stats-wrapper">
        {/* for the rows of dead squares I used divs instead of ul's because this 
        made it much easier to style the dead squares which are made up of a button 
        and h5 in a horizontal row */}
        <div className="dead-enemy">{rowEnemies}</div>
        <div className="moves-played">
            { /* TODO: replace with a list of all the moves that have been made */}
        </div>
        <div className="dead-friends">{rowFriends}</div>
    </div>);
}
