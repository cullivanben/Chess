import React from 'react';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/DeadSquare.scss';

export default function DeadSquare(props) {
    // set the source and classnames
    let src = props.src === 'null' ? sources.blackKnight : props.src;
    let name = props.src === 'null' ? 'dead-transparent' : 'dead-opaque';
    let countName = (props.src === 'null' || props.count <= 1 ? 
        'count-transparent' : 'count-opaque');
    // override countName if there is only one 
    return (<div className="dead-square-wrapper">
        <button className="dead-square">
            <img 
                className={name}
                src={src}
                alt="Chess Piece"
                draggable="false"
            />
            <div className={countName}>{props.count}</div>
        </button>
    </div>);
}
