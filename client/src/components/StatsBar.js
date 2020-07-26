import React from 'react';
import DeadSquare from './DeadSquare';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/StatsBar.scss';

// gets the svg source of a piece
function getSrc(piece) {
    let color = piece.substring(0, 1) === 'b' ? 'black' : 'white';
    let parsed = piece.substring(1);
    switch (parsed) {
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
    // add the number of occurrences of each piece type to a hashmap
    let counts = new Map();
    arr.forEach(piece => {
        if (counts.has(piece)) counts.set(piece, counts.get(piece) + 1);
        else counts.set(piece, 1);
    });
    // loop over the map and sort the pieces based on the number of dead,
    // if the number of dead of two piece types are equal, ties are broken 
    // alphabetically
    let out = [];
    let it = counts.keys();
    let key = it.next();
    while (!it.done()) {
        out.push([key.value, counts.get(key.value)]);
        let i = out.length - 1;
        while (i > 0 && out[i - 1][1] <= out[i][1]) {
            if (out[i - 1][1] === out[i][1] && out[i - 1][0] < out[i][0]) break;
            let temp = out[i];
            out[i] = out[i - 1];
            out[i-- - 1] = temp;
        }
        key = it.next();
    }
    return out;
}

// constructs a square with a piece svg and the number of this piece that have been killed
function renderDeadSquare(arr, i) {
    let src, count, key;
    if (i < arr.length) {
        src = getSrc(arr[i][0]);
        count = arr[i][1];
        key = `${arr[i][0]} ${arr[i][1]}`;
    }
    else {
        src = 'null';
        count = 0;
        key = i;
    }
    return <li key={key}><DeadSquare src={src} count={count} /></li>;
}

// sets up a row of dead enemies or dead friends
function setUpRow(arr) {
    let row = [];
    row.length = 5;
    for (let i = 0; i < 5; i++) row[i] = renderDeadSquare(arr, i);
    return row;
}

export default function StatsBar(props) {
    // create the rows of enemies and friends
    console.log('MOVES', props.moves);
    let rowEnemies = setUpRow(arrangeDead(props.deadEnemies));
    let rowFriends = setUpRow(arrangeDead(props.deadFriends));

    return (<div className="stats-wrapper">
        <div className="enemy-name-wrapper"><h3 className="enemy-name">{props.enemyName}</h3></div>
        <ul className="dead-enemy">{rowEnemies}</ul>
        <div className="moves-played">
            <ul className="moves-ul">
                {props.moves.map((move, i) => (<li key={i + move}>{(i + 1) +
                    (move.substring(0, 1) === 'b' ? '. Black: ' : '. White: ') +
                    move.substring(1)}</li>))}
            </ul>
        </div>
        <ul className="dead-friends">{rowFriends}</ul>
        <div className="your-name-wrapper"><h3 className="your-name">{props.name}</h3></div>
        <button className="resign" onClick={props.handleResign}>Resign</button>
    </div>);
}
