import { useState, useEffect, useRef } from 'react'
import './App.css'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showChat, setShowChat] = useState(false)
  const messageEndRef = useRef(null)

  const welcomeMessage =
    "Hello! I'm your Wildlife Tours Rwanda concierge. I'm here to help you discover Rwanda's incredible wildlife experiences and plan your perfect adventure. How may I assist you today?"

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Dummy API
  const simulateApiCall = async (text) => {
    await new Promise((r) => setTimeout(r, 1200))
    const t = text.toLowerCase()
    if (t.includes('gorilla'))
      return [
        'Gorilla trekking in Rwanda is an incredible experience! We offer guided treks in Volcanoes NP with permits, guides, and small groups. Duration: 2–8 hrs.'
      ]
    if (t.includes('park'))
      return [
        'Top parks: Volcanoes (gorillas), Akagera (Big Five), Nyungwe (chimps & canopy walk). Each offers unique wildlife & landscapes.'
      ]
    if (t.includes('price') || t.includes('cost'))
      return [
        'Packages vary: Gorilla permits start at $1,500. We offer 3‑, 5‑, 7‑day tours including lodging, meals, transport & guiding. Need package details?'
      ]
    return [
      "Great question! I can help with gorilla treks, parks, safaris, lodging, and trip planning. What would you like to know?"
    ]
  }

  const chatWithSystem = async (text) => {
    try {
      // replace simulateApiCall with real fetch when ready
      return await simulateApiCall(text)
    } catch {
      return ["I'm having trouble connecting—please try again."]
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'User', content: text }])
    setInputValue('')
    setIsTyping(true)
    const replies = await chatWithSystem(text)
    setIsTyping(false)
    setMessages((m) => [...m, ...replies.map((c) => ({ role: 'Concierge', content: c }))])
  }

  const toggleChat = () => {
    if (showChat) setMessages([])
    setShowChat((v) => !v)
  }

  return (
    <>
      {/* Toggle Button */}
      <button className="chat-toggle" onClick={toggleChat} aria-label="Open chat">
        {showChat ? '✕' : '💬'}
      </button>

      {showChat && (
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <div className="logo-container">
              <div className="logo-circle">
                <img
                  src="https://wildlifetours-rwanda.com/wp-content/uploads/2025/02/wildlfie_white__1_-removebg-preview.png"
                  alt="WTR Logo"
                />
              </div>
              <div className="header-text">
                <div className="title">Wildlife Tours Rwanda</div>
                <div className="subtitle">Travel Concierge</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">⭐</div>
                <div className="welcome-text">{welcomeMessage}</div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message-container ${
                  msg.role === 'User' ? 'user' : 'agent'
                }`}
              >
                <div
                  className={`message-bubble ${
                    msg.role === 'User' ? 'user' : 'agent'
                  }`}
                >
                  <div className="message-header">
                    {msg.role === 'User' ? 'You' : 'Concierge'}
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-bubble">
                  <div className="typing-header">WTR Concierge</div>
                  <div className="typing-content">
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <span>Typing…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about gorillas, parks, or plans…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSendMessage(inputValue)}
              disabled={isTyping}
            />
            <button
              className="chat-submit-button"
              onClick={() => !isTyping && handleSendMessage(inputValue)}
              disabled={isTyping}
            >
              {isTyping ? '…' : '→'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Chat
