import { useState, useEffect, useRef } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messageEndRef = useRef(null);
    const welcomeMessage = 'Hello! I\'m your Wildlife Tours Rwanda concierge. I\'m here to help you discover Rwanda\'s incredible wildlife experiences and plan your perfect adventure. How may I assist you today?';

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
                throw new Error("Connection issue - please try again.");
            }

            const systemResponse = await response.json();
            const systemMessages = parseSystemResponse(systemResponse);

            return systemMessages;
        } catch (error) {
            console.error("Error while processing chat: ", error)
            return ["I'm experiencing a connection issue. Please try your question again."];
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
                ...prevMessages, { role: "Concierge", content: msg }
            ]);
        }
    };

    return (
        <div className="chat-container">
            {/* Header with Logo */}
            <div className="chat-header">
                <div className="logo-container">
                    <div className="logo-circle">
                        <img 
                            src="./logo.png" 
                            alt="Wildlife Tours Rwanda Logo" 
                        />
                    </div>
                    <div className="header-text">
                        <div className="title">Wildlife Tours Rwanda</div>
                        <div className="subtitle">Travel Concierge</div>
                    </div>
                </div>
            </div>
            
            {/* Messages Container */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="welcome-message">
                        <div className="welcome-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L13.09 8.26L19.94 8.26L14.47 12.74L15.56 19L12 15.27L8.44 19L9.53 12.74L4.06 8.26L10.91 8.26L12 2Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="welcome-text">{welcomeMessage}</div>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div key={index} className={`message-container ${message.role === 'User' ? 'user' : 'agent'}`}>
                        <div className={`message-bubble ${message.role === 'User' ? 'user' : 'agent'}`}>
                            <div className="message-header">
                                {message.role === 'User' ? 'You' : 'Concierge'}
                            </div>
                            <div className="message-content">{message.content}</div>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-bubble">
                            <div className="typing-header">Concierge</div>
                            <div className="typing-content">
                                <div className="typing-dots">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                                <span>Typing...</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messageEndRef} />
            </div>
            
            {/* Input Form */}
            <div className="chat-input-form">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about gorilla trekking, parks, or trip planning..."
                    disabled={isTyping}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isTyping) {
                            const input = e.target.value;
                            if (input.trim() !== "") {
                                handleSendMessage(input);
                                e.target.value = '';
                            }
                        }
                    }}
                />
                <button
                    className="chat-submit-button"
                    disabled={isTyping}
                    onClick={(e) => {
                        const input = e.target.parentElement.querySelector('input');
                        const inputValue = input.value;
                        if (inputValue.trim() !== "" && !isTyping) {
                            handleSendMessage(inputValue);
                            input.value = '';
                        }
                    }}
                >
                    {isTyping ? (
                        <svg className="spinner" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="submit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default Chat;