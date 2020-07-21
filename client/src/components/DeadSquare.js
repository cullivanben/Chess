import React from 'react';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/DeadSquare.scss';

export default function DeadSquare(props) {
    // set the source and classnames
    let src, name, countName;
    if (props.src === 'null') {
        src = sources.blackKnight;
        name = 'dead-transparent';
        countName = 'count-transparent';
    }
    else {
        src = props.src;
        name = 'dead-opaque';
        countName = 'count-opaque';
    }
    return (<div>
        <button className="dead-square">
            <img 
                className={name}
                src={src}
                alt="Chess Piece"
            />
        </button>
        <h5 className={countName}>{`x${props.count}`}</h5>
    </div>);
}
