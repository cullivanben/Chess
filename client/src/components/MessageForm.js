import React from 'react';
import '../stylesheets/MessageForm.scss';

/**
 *Handles message input and sends user messages.
 *
 * @export
 * @class MessageForm
 * @extends {React.Component}
 */
export default class MessageForm extends React.Component {
    /**
     *Creates an instance of MessageForm.
     * @param {object} props
     * @memberof MessageForm
     */
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.handleSend = this.handleSend.bind(this);
    }

    /**
     *Handles when the send button is pressed.
     *
     * @memberof MessageForm
     */
    handleSend() {
        this.props.handleSend(this.inputRef.current.value);
        this.inputRef.current.value = '';
    }

    render() {
        return (<div className="send-message-wrapper">
            <textarea
                className="send-message-input"
                placeholder="Write a message to your opponent"
                type="text"
                maxLength="140"
                ref={this.inputRef}
            />
            <button className="send-message" onClick={this.handleSend}>Send</button>
        </div>);
    }
}
