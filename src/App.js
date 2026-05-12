import React, { useState, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import VideoFeed from './components/VideoFeed';
import NewsScreen from './components/NewsScreen';
import ShopScreen from './components/ShopScreen';
import CommunityScreen from './components/CommunityScreen';
import ChatScreen from './components/ChatScreen';
import CompareScreen from './components/CompareScreen';
import AdminScreen from './components/AdminScreen';
import { useAuth } from './AuthContext';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  const { user, signIn, signOut } = useAuth();

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="App">
      <div className="app-header">
        <span className="app-logo">LEX<span className="logo-white">PANTHER</span></span>
        <div className="header-auth">
          {user ? (
            <button className="auth-btn" onClick={signOut}>
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className="auth-avatar" />
                : <span className="auth-initials">{user.displayName?.[0] ?? 'U'}</span>
              }
              <span className="auth-label">ログアウト</span>
            </button>
          ) : (
            <button className="auth-btn" onClick={signIn}>
              <span className="auth-label">Googleでログイン</span>
            </button>
          )}
        </div>
      </div>
      <div className="app-content">
        {activeTab === 'feed' && <VideoFeed />}
        {activeTab === 'news' && <NewsScreen />}
        {activeTab === 'compare' && <CompareScreen />}
        {activeTab === 'shop' && <ShopScreen />}
        {activeTab === 'community' && <CommunityScreen />}
        {activeTab === 'chat' && <ChatScreen />}
        {activeTab === 'admin' && <AdminScreen />}
      </div>
      <div className="tab-bar">
        <button className={`tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}><span className="tab-icon">▶</span><span className="tab-label">FEED</span></button>
        <button className={`tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}><span className="tab-icon">📰</span><span className="tab-label">NEWS</span></button>
        <button className={`tab ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}><span className="tab-icon">⚖️</span><span className="tab-label">COMPARE</span></button>
        <button className={`tab ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}><span className="tab-icon">🛒</span><span className="tab-label">SHOP</span></button>
        <button className={`tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}><span className="tab-icon">💬</span><span className="tab-label">COMMUNITY</span></button>
        <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}><span className="tab-icon">🐆</span><span className="tab-label">LEX AI</span></button>
        {user && <button className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}><span className="tab-icon">⚙</span><span className="tab-label">ADMIN</span></button>}
      </div>
    </div>
  );
}

export default App;
