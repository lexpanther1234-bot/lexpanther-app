import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
const CHINESE_CREATORS = ['STORM影视飓风', '何同学', '科技美学', 'Geekerwan极客湾'];
const JAPANESE_CREATORS = ['がじぇっとれびゅー', 'スマホ情報局', 'テックテックテック'];
const GLOBAL_CHANNELS = ['MKBHD', 'Dave2D', 'MrMobile', 'SuperSaf TV'];
const TAGS = ['flagship', 'camera', 'budget', 'review', 'comparison', 'chinese', 'japanese', 'global'];

const DEFAULT_QUERIES = [
  'smartphone review 2025',
  'best phone 2025',
  'android review 2025',
  'iphone review 2025',
];

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const formatVideo = (item, extra = {}) => ({
  videoId: item.id.videoId,
  title: item.snippet.title,
  channel: item.snippet.channelTitle,
  views: '',
  publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('ja-JP'),
  duration: '',
  thumbnail: item.snippet.thumbnails.medium.url,
  isNew: false,
  ...extra,
});

const fetchPage = async (query, pageToken = null) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '50');
  url.searchParams.set('key', API_KEY);
  if (pageToken) url.searchParams.set('pageToken', pageToken);
  const res = await fetch(url.toString());
  return res.json();
};

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const loaderRef = useRef(null);

  const buildQuery = useCallback(() => {
    if (selectedModel) return `${selectedModel} smartphone review`;
    if (selectedMaker) return `${selectedMaker} smartphone review 2025`;
    if (activeTag === 'chinese') return `${CHINESE_CREATORS[Math.floor(Math.random() * CHINESE_CREATORS.length)]} smartphone`;
    if (activeTag === 'japanese') return `${JAPANESE_CREATORS[Math.floor(Math.random() * JAPANESE_CREATORS.length)]} スマホ`;
    if (activeTag === 'global') return `${GLOBAL_CHANNELS[Math.floor(Math.random() * GLOBAL_CHANNELS.length)]} smartphone review 2025`;
    if (activeTag) return `smartphone ${activeTag} 2025`;
    return null; // default: use DEFAULT_QUERIES
  }, [selectedMaker, selectedModel, activeTag]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setNextPageToken(null);
    setVideos([]);
    const query = buildQuery();

    try {
      if (!query) {
        // デフォルト: 複数クエリを並列取得して結合
        const results = await Promise.allSettled(DEFAULT_QUERIES.map((q) => fetchPage(q)));
        const seen = new Set();
        const all = [];
        const tokenMap = {};

        results.forEach((r, i) => {
          if (r.status !== 'fulfilled' || !r.value.items) return;
          r.value.items.forEach((item) => {
            if (!seen.has(item.id.videoId)) {
              seen.add(item.id.videoId);
              all.push(formatVideo(item));
            }
          });
          if (r.value.nextPageToken) tokenMap[DEFAULT_QUERIES[i]] = r.value.nextPageToken;
        });

        setVideos(all);
        const firstQ = DEFAULT_QUERIES.find((q) => tokenMap[q]);
        if (firstQ) { setCurrentQuery(firstQ); setNextPageToken(tokenMap[firstQ]); }
      } else {
        const data = await fetchPage(query);
        if (data.items) setVideos(data.items.map((item) => formatVideo(item, { maker: selectedMaker, model: selectedModel, tag: activeTag })));
        setCurrentQuery(query);
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, selectedMaker, selectedModel, activeTag]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore || !currentQuery) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(currentQuery, nextPageToken);
      if (data.items) {
        const seen = new Set(videos.map((v) => v.videoId));
        const newItems = data.items.filter((i) => !seen.has(i.id.videoId)).map((i) => formatVideo(i));
        setVideos((prev) => [...prev, ...newItems]);
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, currentQuery, videos]);

  // 無限スクロール: sentinel が見えたら loadMore
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    fetchVideos();
  }, [selectedMaker, selectedModel, activeTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMakerChange = (e) => { setSelectedMaker(e.target.value); setSelectedModel(''); };

  const filteredVideos = useMemo(() => {
    if (!keyword) return videos;
    const kw = keyword.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(kw) || v.channel.toLowerCase().includes(kw));
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
        <>
          {filteredVideos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
          {/* 無限スクロール sentinel */}
          <div ref={loaderRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loadingMore && <p className="no-result" style={{ padding: 0 }}>読み込み中...</p>}
            {!loadingMore && !nextPageToken && videos.length > 0 && (
              <p className="no-result" style={{ padding: 0, fontSize: 11 }}>すべて表示しました</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoFeed;
