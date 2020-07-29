import React from 'react';
import '../stylesheets/Modal.scss';

/**
 *Renders a Modal component
 *
 * @export
 * @param {*} {show, handleClose, children}
 * @returns A Modal Component
 */
export default function Modal(props) {
    let name = props.show ? 'show-modal' : 'hide-modal';
    let otherName = props.show ? 'show-back' : 'hide-back';
    let rapName = props.show ? 'show-mwrap' : 'hide-mwrap';
    return (<div className={rapName}>
        <div className={name}>
            <h3 className="rand-id-gen">{`Your Game ID is ${props.randNum}`}</h3>
            <p className="game-id-message">Share this ID with the person you want to play against.
            You both can now enter it in the input field on the home screen and click 'Play' to
                play each other.</p>
            <button className="close-modal" onClick={props.handleClose}>close</button>
        </div>
        <div className={otherName} />
    </div>);
}