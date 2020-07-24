import React from 'react';
import '../stylesheets/MessageList.scss';

// renders the list of all messages that have been sent
export default function MessageList(props) {
    return (<div className="message-list-wrapper">
        <ul className="message-list">
            {props.messages.map(message => 
                (<li key={message.id}>
                    <h5 className="message-user">{message.user}</h5>
                    <p className="message-content">{message.content}</p>
                </li>))}
        </ul>
    </div>);
}
