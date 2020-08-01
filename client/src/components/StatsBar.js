import React from 'react';
import DeadSquare from './DeadSquare';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/StatsBar.scss';

/**
 *Gets the source url of the svg of a chess piece.
 *
 * @param {*} piece - The chess piece.
 * @returns {string} The url of the svg.
 */
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

/**
 *Counts the number of dead pieces of each type and returns an array of them sorted
 by number of casualties.
 *
 * @param {Array<string>} arr - The array of dead piece types.
 * @returns {Array<Array>} A 2d array of the piece types and their counts in sorted order.
 */
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
    for (let [k, v] of counts) {
        out.push([k, v]);
        let i = out.length - 1;
        while (i > 0 && out[i - 1][1] <= out[i][1]) {
            if (out[i - 1][1] === out[i][1] && out[i - 1][0] < out[i][0]) break;
            let temp = out[i];
            out[i] = out[i - 1];
            out[i-- - 1] = temp;
        }
    }
    return out;
}

/**
 *Renders a square with a piece svg and the number of this piece that have been killed. 
 *
 * @param {Array<Array>} arr - A 2d array of the dead piece types and their corresponding numbers of dead pieces.
 * @param {number} i - The current index into arr.
 * @returns {li} A list item containing a DeadSquare React Component.
 */
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

/**
 *Sets up a row of dead enemies or dead friends.
 *
 * @param {Array<Array>} arr - A 2d array of the dead piece types and their corresponding numbers of dead pieces.
 * @returns {Array<li>} An array of list items containing DeadSquare React Components.
 */
function setUpRow(arr) {
    let row = [];
    row.length = 5;
    for (let i = 0; i < 5; i++) row[i] = renderDeadSquare(arr, i);
    return row;
}

/**
 *A component that contains all the current gameplay stats.
 *
 * @export
 * @param {object} props
 * @returns A StatsBar React Component.
 */
export default function StatsBar(props) {
    // create the rows of enemies and friends
    let rowEnemies = setUpRow(arrangeDead(props.deadEnemies));
    let rowFriends = setUpRow(arrangeDead(props.deadFriends));

    return (<div className="stats-wrapper">
        <div className="enemy-name-wrapper"><h3 className="enemy-name">{props.enemyName}</h3></div>
        <ul className="dead-enemy">{rowEnemies}</ul>
        <div className="moves-played">
            <ul className="moves-ul">
                {props.moves.map((move, i) => (<li key={props.moves[props.moves.length - i - 1] + (props.moves.length - i)}>
                    {(props.moves.length - i) +
                    (props.moves[props.moves.length - i - 1].substring(0, 1) === 'b' ? '. Black: ' : '. White: ') +
                    props.moves[props.moves.length - i - 1].substring(1)}</li>))}
            </ul>
        </div>
        <ul className="dead-friends">{rowFriends}</ul>
        <div className="your-name-wrapper"><h3 className="your-name">{props.name}</h3></div>
        <div className="rd-wrapper">
            <button className="resign" onClick={props.handleResign}>{props.gameOver ? 'Exit' : 'Resign'}</button>
            <button className="request-draw" onClick={props.handleDrawRequest}>Request Draw</button>
        </div>
    </div>);
}
