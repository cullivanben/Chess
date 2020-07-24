import React from 'react';
import '../stylesheets/MessageForm.scss';

// handles message input and sends the message when the user submits the form
export default class MessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.handleSend = this.handleSend.bind(this); 
    }

    // handles when the send button is pressed
    handleSend() {
        this.props.handleSend(this.inputRef.current.value);
        this.inputRef.current.value = '';
    }

    render() {
        return (<div
            className="send-message-wrapper">
            <textarea
                className="send-message-input"
                placeholder="Send a message to your opponent"
                type="text"
                maxLength="140"
                ref={this.inputRef}
            />
            <button className="send-message" onClick={this.handleSend}>
                Send
                </button>
        </div>);
    }
}