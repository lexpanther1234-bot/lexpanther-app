import React, { useState, useMemo } from 'react';
import VideoCard from './VideoCard';
import './VideoFeed.css';

const MAKER_MODELS = {
  Samsung: ['Galaxy S25 Ultra', 'Galaxy S25', 'Galaxy A55', 'Galaxy Z Fold 6'],
  Apple: ['iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro'],
  Google: ['Pixel 9 Pro', 'Pixel 9', 'Pixel 8a'],
  OnePlus: ['OnePlus 13', 'OnePlus 12', 'Nord 4'],
  Xiaomi: ['14 Ultra', '14T Pro', 'Redmi Note 13'],
  Sony: ['Xperia 1 VI', 'Xperia 5 V'],
};

const TAGS = ['flagship', 'camera', 'budget', 'review', 'comparison'];

const mockVideos = [
  {
    videoId: 'abc001',
    title: 'Samsung Galaxy S25 Ultra Full Review — Is It Worth $1,299?',
    channel: 'MKBHD',
    views: '4.2M views',
    publishedAt: '2日前',
    duration: '14:32',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    maker: 'Samsung',
    model: 'Galaxy S25 Ultra',
    tag: 'flagship',
    isNew: true,
  },
  {
    videoId: 'abc002',
    title: 'OnePlus 13 vs Pixel 9 Pro — Camera Shootout in Real Conditions',
    channel: 'Dave2D',
    views: '1.8M views',
    publishedAt: '5日前',
    duration: '9:18',
    thumbnail: 'https://img.youtube.com/vi/Lq8HnNfNaCE/mqdefault.jpg',
    maker: 'Google',
    model: 'Pixel 9 Pro',
    tag: 'camera',
    isNew: false,
  },
  {
    videoId: 'abc003',
    title: 'iPhone 16 Pro Max — 3 Months Later, Still the Best?',
    channel: 'MrMobile',
    views: '3.1M views',
    publishedAt: '1週間前',
    duration: '18:45',
    thumbnail: 'https://img.youtube.com/vi/ydMBfyLwiRU/mqdefault.jpg',
    maker: 'Apple',
    model: 'iPhone 16 Pro',
    tag: 'review',
    isNew: false,
  },
  {
    videoId: 'abc004',
    title: 'Xiaomi 14 Ultra — The Leica Camera Phone That Changes Everything',
    channel: 'SuperSaf TV',
    views: '2.4M views',
    publishedAt: '3日前',
    duration: '21:03',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    maker: 'Xiaomi',
    model: '14 Ultra',
    tag: 'camera',
    isNew: false,
  },
  {
    videoId: 'abc005',
    title: 'Samsung Galaxy A55 Review — Best Mid-Range of 2025?',
    channel: 'GSMArena',
    views: '680K views',
    publishedAt: '2週間前',
    duration: '12:20',
    thumbnail: 'https://img.youtube.com/vi/Lq8HnNfNaCE/mqdefault.jpg',
    maker: 'Samsung',
    model: 'Galaxy A55',
    tag: 'budget',
    isNew: false,
  },
];

const VideoFeed = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeTag, setActiveTag] = useState('');

  const handleMakerChange = (e) => {
    setSelectedMaker(e.target.value);
    setSelectedModel('');
  };

  const filteredVideos = useMemo(() => {
    return mockVideos.filter((v) => {
      const matchKeyword =
        !keyword ||
        v.title.toLowerCase().includes(keyword.toLowerCase()) ||
        v.channel.toLowerCase().includes(keyword.toLowerCase()) ||
        v.model.toLowerCase().includes(keyword.toLowerCase());
      const matchMaker = !selectedMaker || v.maker === selectedMaker;
      const matchModel = !selectedModel || v.model === selectedModel;
      const matchTag = !activeTag || v.tag === activeTag;
      return matchKeyword && matchMaker && matchModel && matchTag;
    });
  }, [keyword, selectedMaker, selectedModel, activeTag]);

  const modelOptions = selectedMaker ? MAKER_MODELS[selectedMaker] || [] : [];

  return (
    <div className="video-feed">
      <h2 className="feed-section-title">▶ Video Search</h2>

      <input
        className="search-input"
        type="text"
        placeholder="機種名・キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="filter-row">
        <select className="filter-select" value={selectedMaker} onChange={handleMakerChange}>
          <option value="">すべてのメーカー</option>
          {Object.keys(MAKER_MODELS).map((maker) => (
            <option key={maker} value={maker}>{maker}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={!selectedMaker}
        >
          <option value="">すべての機種</option>
          {modelOptions.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      <div className="tag-row">
        <button
          className={`tag-btn ${activeTag === '' ? 'active' : ''}`}
          onClick={() => setActiveTag('')}
        >
          ALL
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <p className="result-count">
        <span>{filteredVideos.length}</span> 件の動画
      </p>

      {filteredVideos.length === 0 ? (
        <p className="no-result">該当する動画が見つかりませんでした</p>
      ) : (
        filteredVideos.map((video) => (
          <VideoCard key={video.videoId} video={video} />
        ))
      )}
    </div>
  );
};

export default VideoFeed;
