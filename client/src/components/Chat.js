import React from 'react';
import io from 'socket.io-client';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import uuid from 'react-uuid';
const endpoint = 'http://localhost:5000';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this.socket = null;
        this.handleSend = this.handleSend.bind(this);
    }

    componentDidMount() {
        this.socket = io(endpoint);
        this.socket.on('incoming-message', () => console.log('message recieved'));
        console.log('socket msg', this.socket);
    }

    // handles when this user presses the send button to send a message
    handleSend(message) {
        // generate the id of the message
        let payload = {
            id: uuid(),
            user: "phil hanlon",
            content: message
        }
        console.log('message', payload);
        if (!this.socket) return;
        // send the message to the other player
        this.socket.emit('outgoing-message', payload);
        // update the state with the new message
        this.setState(prevState => ({
            messages: prevState.messages.concat(payload)
        }));
    }

    // handles when this user recieves a message
    handleIncoming(message) {
        console.log('recieved', message);
    }

    render() {
        return (<div className="chat">
            <h3 className="chat-title">Chat</h3>
            <MessageList messages={this.state.messages} />
            <MessageForm handleSend={this.handleSend} />
        </div>);
    }
}