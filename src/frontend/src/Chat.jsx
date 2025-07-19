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

    // Wildlife Tours Rwanda Logo Component
    const Logo = () => (
        <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm overflow-hidden">
                <img 
                    src="./logo.png" 
                    alt="Wildlife Tours Rwanda Logo" 
                    className="w-full h-full object-contain"
                />
            </div>
            <div>
                <div className="text-white font-semibold text-sm tracking-wide">Wildlife Tours Rwanda</div>
                <div className="text-emerald-100 text-xs">Travel Concierge</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md h-[600px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
                {/* Professional Header with Logo */}
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 px-4 py-4 border-b border-emerald-600">
                    <Logo />
                </div>
                
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 py-3 h-[440px]">
                    {messages.length === 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-sm text-gray-600 mb-4">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                                    <path d="M12 2L13.09 8.26L19.94 8.26L14.47 12.74L15.56 19L12 15.27L8.44 19L9.53 12.74L4.06 8.26L10.91 8.26L12 2Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div className="leading-relaxed">{welcomeMessage}</div>
                        </div>
                    )}
                    
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-3 ${message.role === 'User' ? 'flex justify-end' : 'flex justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                message.role === 'User' 
                                    ? 'bg-emerald-600 text-white ml-12' 
                                    : 'bg-gray-100 text-gray-800 mr-12 border border-gray-200'
                            }`}>
                                <div className={`text-xs font-medium mb-1 ${
                                    message.role === 'User' ? 'text-emerald-100' : 'text-gray-500'
                                }`}>
                                    {message.role === 'User' ? 'You' : 'Concierge'}
                                </div>
                                <div className="leading-relaxed whitespace-pre-wrap">{message.content}</div>
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex justify-start mb-3">
                            <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 mr-12 text-sm">
                                <div className="text-xs font-medium text-gray-500 mb-1">Concierge</div>
                                <div className="flex items-center text-gray-600">
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                    <span className="ml-2 text-xs">Typing...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messageEndRef} />
                </div>
                
                {/* Input Form */}
                <div className="border-t border-gray-200 p-3 bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask about gorilla trekking, parks, or trip planning..."
                            disabled={isTyping}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
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
                            disabled={isTyping}
                            onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input');
                                const inputValue = input.value;
                                if (inputValue.trim() !== "" && !isTyping) {
                                    handleSendMessage(inputValue);
                                    input.value = '';
                                }
                            }}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isTyping ? (
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;