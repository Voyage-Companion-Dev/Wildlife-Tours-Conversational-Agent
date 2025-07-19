// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown'

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messageEndRef = useRef(null);
    const welcomeMessage = 'Hey there! I\'m here to help you discover Rwanda\'s amazing wildlife and plan your perfect safari adventure. What would you like to explore today?';

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
                throw new Error("Having trouble connecting - let me try that again in a moment.");
            }

            const systemResponse = await response.json();
            const systemMessages = parseSystemResponse(systemResponse);
            console.log(systemMessages)

            return systemMessages;
        } catch (error) {
            console.error("Error while processing chat: ", error)
            return ["Oops! I'm having some connection trouble right now. Mind giving it another try?"];
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
                ...prevMessages, { role: "Guide", content: msg }
            ]);
        }
    };

    return (
        <div className="chat-container">
            {/* Header with branding */}
            <div className="chat-header">
                <h1>Wildlife Rwanda Guide</h1>
                <div className="subtitle">Your Personal Safari Expert</div>
            </div>
            
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="welcome-message">{welcomeMessage}</div>
                )}
                
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={message.role === 'User' ? "message-user" : "message-guide"}
                        role="article"
                        aria-label={`Message from ${message.role === 'User' ? 'you' : 'your wildlife guide'}`}
                    >
                        <div className="message">
                            <div className="message-header">
                                {message.role === 'User' ? 'You' : 'Your Guide'}
                            </div>
                            <Markdown className="message-content">{message.content}</Markdown>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="message-guide">
                        <div className="message-typing">
                            <span className="typing-indicator">
                                Thinking about your question
                                <span className="dots">
                                    <span>.</span>
                                    <span>.</span>
                                    <span>.</span>
                                </span>
                            </span>
                        </div>
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
                    placeholder="Ask me about gorilla trekking, the best parks to visit, or planning your trip..."
                    disabled={isTyping}
                    aria-label="Type your message here"
                />
                <button
                    className="chat-submit-button" 
                    type="submit"
                    disabled={isTyping}
                    aria-label="Send your message"
                >
                    {isTyping ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default Chat;