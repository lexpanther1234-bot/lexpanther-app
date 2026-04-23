import React, { useState } from 'react';
import VideoFeed from './components/VideoFeed';
import NewsScreen from './components/NewsScreen';
import ShopScreen from './components/ShopScreen';
import CommunityScreen from './components/CommunityScreen';
import ChatScreen from './components/ChatScreen';
import CompareScreen from './components/CompareScreen';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  return (
    <div className="App">
      <div className="app-header">
        <span className="app-logo">LEX<span className="logo-white">PANTHER</span></span>
      </div>
      <div className="app-content">
        {activeTab === 'feed' && <VideoFeed />}
        {activeTab === 'news' && <NewsScreen />}
        {activeTab === 'compare' && <CompareScreen />}
        {activeTab === 'shop' && <ShopScreen />}
        {activeTab === 'community' && <CommunityScreen />}
        {activeTab === 'chat' && <ChatScreen />}
      </div>
      <div className="tab-bar">
        <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}><span className="tab-icon">▶</span><span className="tab-label">FEED</span></button>
        <button className={`tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}><span className="tab-icon">📰</span><span className="tab-label">NEWS</span></button>
        <button className={`tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}><span className="tab-icon">⚖️</span><span className="tab-label">COMPARE</span></button>
        <button className={`tab ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}><span className="tab-icon">🛒</span><span className="tab-label">SHOP</span></button>
        <button className={`tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}><span className="tab-icon">💬</span><span className="tab-label">COMMUNITY</span></button>
        <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}><span className="tab-icon">🐆</span><span className="tab-label">LEX AI</span></button>
      </div>
    </div>
  );
}

export default App;