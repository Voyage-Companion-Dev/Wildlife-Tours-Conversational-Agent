// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown'

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messageEndRef = useRef(null);
    const welcomeMessage = 'Hi there! Ask me anything about wildlife in Rwanda.'; // Customized welcome message

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const createSystemInput = (userMessageContent) => {
        return {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                message: userMessageContent
            })
        }
    };

    const parseSystemResponse = (systemResponse) => {
        const messages = systemResponse["messages"]
        return messages
    }

    const chatWithSystem = async (userMessageContent) => {
        try {
            const response = await fetch(
                `/chat`,
                createSystemInput(userMessageContent)
            );

            if (!response.ok) {
                throw new Error("Oops! Something went wrong while chatting."); // More user-friendly error
            }

            const systemResponse = await response.json();
            const systemMessages = parseSystemResponse(systemResponse);
            console.log(systemMessages)

            return systemMessages;
        } catch (error) {
            console.error("Error while processing chat: ", error)
        }
    };

    const handleSendMessage = async (userMessageContent) => {
        setMessages((prevMessages) => [
            ...prevMessages, { role: "User", content: userMessageContent }
        ]);

        setIsTyping(true);
        const systemMessages = await chatWithSystem(userMessageContent);
        setIsTyping(false);

        for (const msg of systemMessages) {
            setMessages((prevMessages) => [
                ...prevMessages, { role: "System", content: msg }
            ]);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.length == 0 && (<div className="message-content welcome-message">{welcomeMessage}</div>)}
                {messages.map((message, index) => (
                    <div key={index} tabIndex="0" className={message.role === 'User' ? "message-user" : "message-agent"}>
                        <div className="message">
                            <h3 className="message-header">{message.role === 'User' ? 'You' : 'Wildlife Rwanda Bot'}</h3> {/* Custom role titles */}
                            <Markdown className="message-content">{message.content}</Markdown>
                        </div>
                    </div>
                ))}
                {isTyping && <p className="message message-typing">The bot is thinking...</p>} {/* Friendlier typing message */}
                <div ref={messageEndRef}/>
            </div>
            <form
                className="chat-input-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.input.value;
                    if (input.trim() != "") {
                        handleSendMessage(input);
                        e.target.reset();
                    }
                }}
                aria-label="Chat Input Form"
            >
                <input
                    className="chat-input"
                    type="text"
                    name="input"
                    placeholder="Ask about wildlife, national parks, or travel tips..." // Custom placeholder
                    disabled={isTyping}/>
                <button
                    className="chat-submit-button" 
                    type="submit"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;
