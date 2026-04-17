import React from 'react';
import VideoFeed from './components/VideoFeed';
import ShopScreen from './components/ShopScreen';
import CommunityScreen from './components/CommunityScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  return (
    <div className="App">
      <VideoFeed />
      <ShopScreen />
      <CommunityScreen />
      <ChatScreen />
    </div>
  );
}

export default App;