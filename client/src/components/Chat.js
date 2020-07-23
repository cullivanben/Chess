import React from 'react';
import ChatTitle from './ChatTitle';
import MessageList from './MessageList';
import MessageForm from './MessageForm';

export default function Chat(props) {

    return (<div className="chat">
        <ChatTitle />
        <MessageList messages={props.messages} />
        <MessageForm handleSend={props.handleSend} />
    </div>);
}