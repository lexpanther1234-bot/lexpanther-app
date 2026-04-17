import React from 'react';
import VideoFeed from './components/VideoFeed';
import ShopScreen from './components/ShopScreen';
import CommunityScreen from './components/CommunityScreen';
import './App.css';

function App() {
  return (
    <div className="App">
      <VideoFeed />
      <ShopScreen />
      <CommunityScreen />
    </div>
  );
}

export default App;
