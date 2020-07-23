import React, { useState } from 'react';

// handles message input and sends the message when the user submits the form
export default function MessageForm(props) {
    const [message, setMessage] = useState("");
    return (<div
        className="send-message-wrapper">
            <input
                className="send-message-input"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeHolder="Send a message to your opponent"
                type="text"
            />
            <button className="send-message" onClick={() => props.handleSend(message)}>
                Send
            </button>
    </div>);
}