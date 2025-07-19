import { useState, useEffect, useRef } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messageEndRef = useRef(null);
    const welcomeMessage = 'Hello! I\'m your Wildlife Tours Rwanda concierge. I\'m here to help you discover Rwanda\'s incredible wildlife experiences and plan your perfect adventure. How may I assist you today?';

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    // Simulate API call for demo purposes - replace with your actual API
    const simulateApiCall = async (userMessageContent) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Return sample responses based on keywords
        if (userMessageContent.toLowerCase().includes('gorilla')) {
            return ["Gorilla trekking in Rwanda is an incredible experience! We offer guided treks in Volcanoes National Park where you can encounter mountain gorillas in their natural habitat. The experience typically lasts 2-8 hours and includes a permit, guide, and small group setting for an intimate wildlife encounter."];
        } else if (userMessageContent.toLowerCase().includes('park')) {
            return ["Rwanda has amazing national parks! Our top recommendations include Volcanoes National Park for gorillas, Akagera National Park for the Big Five safari experience, and Nyungwe Forest for primates and canopy walks. Each offers unique wildlife experiences."];
        } else if (userMessageContent.toLowerCase().includes('price') || userMessageContent.toLowerCase().includes('cost')) {
            return ["Our tour packages vary based on duration and experiences. Gorilla trekking permits start from $1,500 per person. We offer 3-day, 5-day, and 7-day packages that include accommodation, meals, transportation, and guided experiences. Would you like me to provide details for a specific package?"];
        } else {
            return ["That's a great question! I can help you with information about gorilla trekking, wildlife parks, safari experiences, accommodation options, and trip planning. What specific aspect of Rwanda's wildlife would you like to explore?"];
        }
    };

    // Replace this with your actual API call
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
            // Uncomment this section when you have a real API endpoint
            /*
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
            */
            
            // For demo purposes, using simulated responses
            return await simulateApiCall(userMessageContent);
        } catch (error) {
            console.error("Error while processing chat: ", error)
            return ["I'm experiencing a connection issue. Please try your question again."];
        }
    };

    const handleSendMessage = async (userMessageContent) => {
        if (!userMessageContent.trim()) return;
        
        setMessages((prevMessages) => [
            ...prevMessages, { role: "User", content: userMessageContent }
        ]);
        setInputValue('');
        setIsTyping(true);
        
        const systemMessages = await chatWithSystem(userMessageContent);
        setIsTyping(false);

        for (const msg of systemMessages) {
            setMessages((prevMessages) => [
                ...prevMessages, { role: "Concierge", content: msg }
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isTyping) {
            handleSendMessage(inputValue);
        }
    };

    const handleSubmit = () => {
        if (!isTyping) {
            handleSendMessage(inputValue);
        }
    };

    return (
        <div className="chat-container">
            {/* Header with Logo */}
            <div className="chat-header">
                <div className="logo-container">
                    <div className="logo-circle">
                        {/* Replace with actual logo image when available */}
                        
                        
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
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about gorilla trekking, parks, or trip planning..."
                    disabled={isTyping}
                />
                <button
                    className="chat-submit-button"
                    disabled={isTyping}
                    onClick={handleSubmit}
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