import React from 'react';
import sources from '../chess-classes/pieces/sources';
import '../stylesheets/DeadSquare.scss';

/**
 *Renders a dead square.
 *
 * @export
 * @param {object} props
 * @returns
 */
export default function DeadSquare(props) {
    // set the source and classnames
    let src = props.src === 'null' ? sources.whiteKnight : props.src;
    let name = props.src === 'null' ? 'dead-transparent' : 'dead-opaque';

    // override countName if there is only one dead piece of this pieceType
    let countName = (props.src === 'null' || props.count <= 1 ?
        'count-transparent' : 'count-opaque');

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
