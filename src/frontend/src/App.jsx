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
      
      <div className="chat-wrapper">
        <Chat />
      </div>
    </div>
  );
};

export default App;