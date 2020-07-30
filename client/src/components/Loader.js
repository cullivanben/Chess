import React from 'react';
import '../stylesheets/Loader.scss';

/**
 *Renders a Component that displays a loading message.
 *
 * @export
 * @param {object} props
 * @returns A Loader React Component.
 */
export default function Loader(props) {
    return (<div className="loading-wrapper">
        <div className="surrounder">
            <h1 className="waiting">{props.message}</h1>
            <div className="lds-dual-ring"></div>
        </div>
    </div>);
}