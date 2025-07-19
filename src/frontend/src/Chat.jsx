// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown'

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messageEndRef = useRef(null);
    const welcomeMessage = 'Welcome to your personal wildlife guide! Ask me anything about Rwanda\'s incredible national parks, wildlife safaris, or travel planning tips.';

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
                throw new Error("Connection issue - please try again in a moment.");
            }

            const systemResponse = await response.json();
            const systemMessages = parseSystemResponse(systemResponse);
            console.log(systemMessages)

            return systemMessages;
        } catch (error) {
            console.error("Error while processing chat: ", error)
            return ["Sorry, I'm having trouble connecting right now. Please try again in a moment."];
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
            {/* Header with branding */}
            <div className="chat-header">
                <h1>Wildlife Rwanda Guide</h1>
                <div className="subtitle">Your Expert Safari Companion</div>
            </div>
            
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="welcome-message">{welcomeMessage}</div>
                )}
                
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={message.role === 'User' ? "message-user" : "message-agent"}
                        role="article"
                        aria-label={`Message from ${message.role === 'User' ? 'you' : 'Wildlife Rwanda Guide'}`}
                    >
                        <div className="message">
                            <div className="message-header">
                                {message.role === 'User' ? 'You' : 'Guide'}
                            </div>
                            <Markdown className="message-content">{message.content}</Markdown>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="message-agent">
                        <div className="message-typing">Guide is thinking</div>
                    </div>
                )}
                
                <div ref={messageEndRef} />
            </div>
            
            <form
                className="chat-input-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.input.value;
                    if (input.trim() !== "") {
                        handleSendMessage(input);
                        e.target.reset();
                    }
                }}
                aria-label="Send message form"
            >
                <input
                    className="chat-input"
                    type="text"
                    name="input"
                    placeholder="Ask about gorilla trekking, national parks, safari planning..."
                    disabled={isTyping}
                    aria-label="Type your message"
                />
                <button
                    className="chat-submit-button" 
                    type="submit"
                    disabled={isTyping}
                    aria-label="Send message"
                >
                    {isTyping ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default Chat;