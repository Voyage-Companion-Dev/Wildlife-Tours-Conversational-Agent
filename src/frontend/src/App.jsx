// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useEffect } from 'react';
import './App.css';
import Chat from './Chat.jsx';

const App = () => {
  useEffect(() => {
    // Set document language and meta information
    document.documentElement.lang = 'en';
    document.title = 'Wildlife Rwanda Tours - Expert Safari Chat';
    
    // Set meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get expert advice on Rwanda wildlife tours, gorilla trekking, and safari planning from our AI-powered chat assistant.');
    }
  }, []);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="brand-section">
          <h1 className="app-title">
            <span className="brand-icon">🦍</span>
            Wildlife Rwanda Tours
            <span className="brand-accent">✨</span>
          </h1>
          <p className="app-subtitle">Your Gateway to Rwanda's Wild Beauty</p>
        </div>
        
        <div className="disclaimer-section">
          <div className="disclaimer-content">
            <span className="disclaimer-icon">💡</span>
            <span className="disclaimer-text">
              AI-powered assistant. Always verify booking details with our expert team.
            </span>
          </div>
        </div>
      </div>
      
      <div className="chat-wrapper">
        <Chat />
      </div>
    </div>
  );
};

export default App;