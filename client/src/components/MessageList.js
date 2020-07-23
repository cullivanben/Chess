import React from 'react';

// renders the list of all messages that have been sent
export default function MessageList(props) {
    return (<div className="message-list-wrapper">
        <ul className="message-list">
            {props.messages.map(message => 
                (<li key={message.id}>{message.text}</li>))}
        </ul>
    </div>);
}
