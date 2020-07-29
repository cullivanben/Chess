import React from 'react';
import io from 'socket.io-client';
import ChatTitle from './ChatTitle';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import uuid from 'react-uuid';
import '../stylesheets/Chat.scss';
const endpoint = 'http://localhost:5000';

/**
 *Manages the state of the chat.
 *
 * @export
 * @class Chat
 * @extends {React.Component}
 */
export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.socket = null;
        this.state = {
            messages: []
        };
        this.cleanup = this.cleanup.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.handleIncoming = this.handleIncoming.bind(this);
        this.saveStateToLocalStorage = this.saveStateToLocalStorage.bind(this);
    }

    componentDidMount() {
        // restore the state of the chat from local storage if possible
        if (localStorage.getItem('messages') !== null) {
            this.setState({ messages: JSON.parse(localStorage.getItem('messages')) });
        }

        // connect to the server via a socket
        this.socket = io(endpoint);

        // listen for incoming messages
        this.socket.on('incoming-message', this.handleIncoming);

        // listen for the enemy leaving
        this.socket.on('enemy-left', this.cleanup);

        // add an event listener that will save the state to local storage before the window unloads
        window.addEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveStateToLocalStorage);
    }

    /**
     *Saves the state of the chat to local storage before the window unloads.
     *
     * @memberof Chat
     */
    saveStateToLocalStorage() {
        localStorage.setItem('messages', JSON.stringify(this.state.messages));
    }

    /**
     *Closes the socket.
     *
     * @memberof Chat
     */
    cleanup() {
        if (this.socket !== null) this.socket.emit('disconnect-message');
    }

    /**
     *Handles when this user presses the send button to send a message.
     *
     * @param {string} message - The message to be sent.
     * @memberof Chat
     */
    handleSend(message) {
        if (!this.socket || this.props.gameOver) return;

        // make sure the message is not empty
        let parsed = message.trim();
        if (parsed.length === 0) return;

        // create an object containing the message as well as the sender
        let payload = {
            id: uuid(),
            user: this.props.name,
            content: parsed
        }

        // send the message to the other player
        this.socket.emit('outgoing-message', payload);

        // update the state with the new message
        this.setState(prevState => ({
            messages: prevState.messages.concat(payload)
        }));
    }

    /**
     *Handles when this user receives a message.
     *
     * @param {string} message - The message that was received.
     * @memberof Chat
     */
    handleIncoming(message) {
        this.setState(prevState => ({
            messages: prevState.messages.concat(message)
        }));
    }

    render() {
        return (<div className="chat">
            <ChatTitle />
            <MessageList messages={this.state.messages} />
            <MessageForm handleSend={this.handleSend} />
        </div>);
    }
}
