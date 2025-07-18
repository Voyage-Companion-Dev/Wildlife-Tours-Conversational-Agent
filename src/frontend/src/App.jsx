// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import './App.css';
import Chat from './Chat.jsx';

const App = () => {
  document.documentElement.lang = 'en';
  return (
    <div className="page-content-container">
      <h1>Wildlife Tours-Rwanda Chat. ✨</h1>
      <div className="chat-disclaimer">
        This chat uses AI to assist with Wildlife Tours Rwanda inquiries. Please confirm all details with our team before booking. 🦍
      </div>
      <Chat/>
    </div>
  );
};

export default App;
