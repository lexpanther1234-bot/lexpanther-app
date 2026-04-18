import React, { useState, useEffect, useMemo } from 'react';
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

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeTag, setActiveTag] = useState('');

  const buildQuery = () => {
    if (selectedModel) return `${selectedModel} smartphone review`;
    if (selectedMaker) return `${selectedMaker} smartphone review 2025`;
    if (activeTag) return `smartphone ${activeTag} 2025`;
    return 'flagship smartphone review 2025';
  };

  const fetchVideos = async (query) => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`
      );
      const data = await res.json();
      if (data.items) {
        const formatted = data.items.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          views: '',
          publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP'),
          duration: '',
          thumbnail: item.snippet.thumbnails.medium.url,
          maker: selectedMaker || '',
          model: selectedModel || '',
          tag: activeTag || '',
          isNew: false,
        }));
        setVideos(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(buildQuery());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaker, selectedModel, activeTag]);

  const handleMakerChange = (e) => {
    setSelectedMaker(e.target.value);
    setSelectedModel('');
  };

  const filteredVideos = useMemo(() => {
    if (!keyword) return videos;
    return videos.filter((v) =>
      v.title.toLowerCase().includes(keyword.toLowerCase()) ||
      v.channel.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [videos, keyword]);

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
        <button className={`tag-btn ${activeTag === '' ? 'active' : ''}`} onClick={() => setActiveTag('')}>ALL</button>
        {TAGS.map((tag) => (
          <button key={tag} className={`tag-btn ${activeTag === tag ? 'active' : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
        ))}
      </div>

      <p className="result-count"><span>{filteredVideos.length}</span> 件の動画</p>

      {loading ? (
        <p className="no-result">読み込み中...</p>
      ) : filteredVideos.length === 0 ? (
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