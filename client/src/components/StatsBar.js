import React from 'react';
import DeadSquare from './DeadSquare';
import '../stylesheets/StatsBar.scss';


// renders a square corresponding to one of the dead pieces or an empty square 
// if there is no piece at this position
function renderSquare(arr, i) {
    // get the image source of the piece at this position or null if there isn't one
    let src = (i < arr.length ? arr[i].src : "null");
    return <DeadSquare src={src} />;
}

// renders a row of squares 
function setUpRow(arr, start) {
    let out = [];
    for (let i = start; i < start + 8; i++) {
        out.push(renderSquare(arr, i));
    }
    return out;
}

export default function StatsBar(props) {   
    // create an array of the dead enemies
    let firstRowEnemy = setUpRow(props.deadEnemies, 0);
    let secondRowEnemy = setUpRow(props.deadEnemies, 8);
    // create an array of the dead friends
    let firstRowFriends = setUpRow(props.deadFriends, 0);
    let secondRowFriends = setUpRow(props.deadFriends, 8);

    return (<div>
                <ul className="dead-enemy">
                    <li key="0">
                        <ul className="dead-row">
                            {firstRowEnemy.map((square, i) => (<li key={`0 ${i}`}>{square}</li>))}
                        </ul>
                    </li>
                    <li key="1">
                        <ul className="dead-row">
                            {secondRowEnemy.map((square, i) => (<li key={`1 ${i}`}>{square}</li>))}
                        </ul>
                    </li>
                </ul>
                <div>
                    { /* TODO: replace with a list of all the moves that have been made */}
                </div>
                <ul className="dead-friends">
                    <li key="2">    
                        <ul className="dead-row">
                            {firstRowFriends.map((square, i) => (<li key={`2 ${i}`}>{square}</li>))}
                        </ul>
                    </li>
                    <li key="3">
                        <ul className="dead-row">
                            {secondRowFriends.map((square, i) => (<li key={`3 ${i}`}>{square}</li>))}
                        </ul>
                    </li>
                </ul>
            </div>);
}
