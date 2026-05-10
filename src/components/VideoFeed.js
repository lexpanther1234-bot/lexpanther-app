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
  OPPO: ['Find X7 Ultra', 'Reno 12'],
  Honor: ['Magic 6 Pro', 'Magic V3'],
  Nothing: ['Phone 2a', 'Phone 2'],
  Realme: ['GT 6', 'GT Neo 6'],
  ASUS: ['ROG Phone 9', 'Zenfone 11'],
  Motorola: ['Edge 50 Ultra', 'Razr 50'],
};

const BRAND_LIST = ['all', ...Object.keys(MAKER_MODELS)];

const CHINESE_CREATORS = ['STORM影视飓风', '何同学', '科技美学', 'Geekerwan极客湾'];
const JAPANESE_CREATORS = ['がじぇっとれびゅー', 'スマホ情報局', 'テックテックテック'];
const GLOBAL_CHANNELS = ['MKBHD', 'Dave2D', 'MrMobile', 'SuperSaf TV'];
const TAGS = ['flagship', 'camera', 'budget', 'review', 'comparison', 'chinese', 'japanese', 'global'];

const BILIBILI_KEYWORDS = {
  all:      'スマートフォン 评测 最新',
  Samsung:  '三星 Galaxy 评测',
  Apple:    '苹果 iPhone 评测',
  Google:   'Pixel 手机 评测',
  OnePlus:  '一加 手机 评测',
  Xiaomi:   '小米 手机 评测',
  Sony:     'Sony Xperia 评测',
  OPPO:     'OPPO 手机 评测',
  Honor:    '荣耀 手机 评测',
  Nothing:  'Nothing Phone review',
  Realme:   'realme 手机 评测',
  ASUS:     'ROG Phone 评测',
  Motorola: 'Motorola 手机 评测',
};

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
  const params = { part: 'snippet', q: query, type: 'video', maxResults: '50' };
  if (pageToken) params.pageToken = pageToken;
  const res = await fetch('/api/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: 'search', params }),
  });
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
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [platform, setPlatform] = useState('youtube');
  const [bilibiliVideos, setBilibiliVideos] = useState([]);
  const [bilibiliLoading, setBilibiliLoading] = useState(false);
  const loaderRef = useRef(null);

  const buildQuery = useCallback(() => {
    if (selectedModel) return `${selectedModel} smartphone review`;
    if (selectedMaker) return `${selectedMaker} smartphone review 2026`;
    if (activeTag === 'chinese') return `${CHINESE_CREATORS[Math.floor(Math.random() * CHINESE_CREATORS.length)]} smartphone`;
    if (activeTag === 'japanese') return `${JAPANESE_CREATORS[Math.floor(Math.random() * JAPANESE_CREATORS.length)]} スマホ`;
    if (activeTag === 'global') return `${GLOBAL_CHANNELS[Math.floor(Math.random() * GLOBAL_CHANNELS.length)]} smartphone review 2026`;
    if (activeTag) return `smartphone ${activeTag} 2026`;
    return null;
  }, [selectedMaker, selectedModel, activeTag]);

  // YouTube: マルチクエリ取得（GET /api/youtube）
  const fetchMultiQuery = useCallback(async (brand = 'all') => {
    setLoading(true);
    setVideos([]);
    setNextPageToken(null);
    try {
      const url = brand && brand !== 'all'
        ? `/api/youtube?brand=${encodeURIComponent(brand)}`
        : '/api/youtube';
      const res = await fetch(url);
      const data = await res.json();
      if (data.items) {
        setVideos(data.items.map(item => formatVideo(item)));
        if (data.nextPageToken) {
          setCurrentQuery(brand);
          setNextPageToken(data.nextPageToken);
        }
      }
    } catch (e) {
      console.error('Multi-query fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // YouTube: 既存のシングルクエリ取得（POST /api/youtube）
  const fetchVideos = useCallback(async () => {
    const query = buildQuery();
    if (!query) {
      fetchMultiQuery(selectedBrand);
      return;
    }

    setLoading(true);
    setNextPageToken(null);
    setVideos([]);

    try {
      const data = await fetchPage(query);
      if (data.items) setVideos(data.items.map((item) => formatVideo(item, { maker: selectedMaker, model: selectedModel, tag: activeTag })));
      setCurrentQuery(query);
      setNextPageToken(data.nextPageToken || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, selectedMaker, selectedModel, activeTag, selectedBrand, fetchMultiQuery]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loadingMore || !currentQuery) return;
    setLoadingMore(true);
    try {
      if (!buildQuery()) {
        const url = `/api/youtube?brand=${encodeURIComponent(currentQuery)}&pageToken=${nextPageToken}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.items) {
          const seen = new Set(videos.map((v) => v.videoId));
          const newItems = data.items.filter((i) => !seen.has(i.id?.videoId)).map((i) => formatVideo(i));
          setVideos((prev) => [...prev, ...newItems]);
          setNextPageToken(data.nextPageToken || null);
        }
      } else {
        const data = await fetchPage(currentQuery, nextPageToken);
        if (data.items) {
          const seen = new Set(videos.map((v) => v.videoId));
          const newItems = data.items.filter((i) => !seen.has(i.id.videoId)).map((i) => formatVideo(i));
          setVideos((prev) => [...prev, ...newItems]);
          setNextPageToken(data.nextPageToken || null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, currentQuery, videos, buildQuery]);

  // Bilibili取得
  const fetchBilibili = useCallback(async (brand = 'all') => {
    setBilibiliLoading(true);
    try {
      const kw = BILIBILI_KEYWORDS[brand] || BILIBILI_KEYWORDS.all;
      const res = await fetch(`/api/bilibili?keyword=${encodeURIComponent(kw)}`);
      const data = await res.json();
      setBilibiliVideos(data.videos || []);
    } catch (err) {
      console.error('Bilibili fetch error:', err);
      setBilibiliVideos([]);
    } finally {
      setBilibiliLoading(false);
    }
  }, []);

  // 無限スクロール（YouTube only）
  useEffect(() => {
    if (platform !== 'youtube') return;
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, platform]);

  // YouTubeフィルター変更時
  useEffect(() => {
    if (platform === 'youtube') fetchVideos();
  }, [selectedMaker, selectedModel, activeTag]); // eslint-disable-line react-hooks/exhaustive-deps

  // ブランドタブ変更時
  useEffect(() => {
    if (platform === 'youtube' && !selectedMaker && !activeTag) {
      fetchMultiQuery(selectedBrand);
    }
    if (platform === 'bilibili') {
      fetchBilibili(selectedBrand);
    }
  }, [selectedBrand]); // eslint-disable-line react-hooks/exhaustive-deps

  // プラットフォーム切替時
  useEffect(() => {
    if (platform === 'bilibili') {
      fetchBilibili(selectedBrand);
    } else {
      fetchVideos();
    }
  }, [platform]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMakerChange = (e) => { setSelectedMaker(e.target.value); setSelectedModel(''); };

  const filteredVideos = useMemo(() => {
    if (!keyword) return videos;
    const kw = keyword.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(kw) || v.channel.toLowerCase().includes(kw));
  }, [videos, keyword]);

  const modelOptions = selectedMaker ? MAKER_MODELS[selectedMaker] || [] : [];

  return (
    <div className="video-feed">
      <h2 className="feed-section-title">▶ Video Feed</h2>

      {/* プラットフォーム切り替え */}
      <div className="feed-platform-tabs">
        <button
          className={`platform-tab ${platform === 'youtube' ? 'active' : ''}`}
          onClick={() => setPlatform('youtube')}
        >
          ▶ YouTube
        </button>
        <button
          className={`platform-tab ${platform === 'bilibili' ? 'active' : ''}`}
          onClick={() => setPlatform('bilibili')}
        >
          📺 Bilibili
        </button>
      </div>

      {/* ブランドフィルタータブ */}
      <div className="brand-filter-row">
        {BRAND_LIST.map(b => (
          <button
            key={b}
            className={`brand-tab ${selectedBrand === b ? 'active' : ''}`}
            onClick={() => { setSelectedBrand(b); setSelectedMaker(''); setSelectedModel(''); setActiveTag(''); }}
          >
            {b === 'all' ? '全て' : b}
          </button>
        ))}
      </div>

      {/* YouTube専用フィルター */}
      {platform === 'youtube' && (
        <>
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
        </>
      )}

      {/* YouTube動画リスト */}
      {platform === 'youtube' && (
        <>
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
              <div ref={loaderRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loadingMore && <p className="no-result" style={{ padding: 0 }}>読み込み中...</p>}
                {!loadingMore && !nextPageToken && videos.length > 0 && (
                  <p className="no-result" style={{ padding: 0, fontSize: 11 }}>すべて表示しました</p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Bilibili動画リスト */}
      {platform === 'bilibili' && (
        <div className="bilibili-feed">
          {bilibiliLoading ? (
            <p className="no-result">Bilibiliから取得中...</p>
          ) : bilibiliVideos.length > 0 ? (
            bilibiliVideos.map(v => (
              <a
                key={v.id}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bilibili-card"
              >
                <img src={v.thumbnail} alt={v.title} className="bilibili-thumb" />
                <div className="bilibili-info">
                  <div className="bilibili-title">{v.title}</div>
                  <div className="bilibili-meta">
                    <span>{v.author}</span>
                    <span>▶ {(v.play || 0).toLocaleString()}</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <p className="no-result">動画が見つかりませんでした</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
