import { useState, useEffect } from 'react';
import './NewsScreen.css';

// ─────────────────────────────────────────
// RSSソース設定
// rss2json.com を使ってCORSを回避
// ─────────────────────────────────────────
const RSS_SOURCES = [
  {
    id: 'gsm',
    name: 'GSMArena',
    url: 'https://www.gsmarena.com/rss-news-reviews.php3',
    badge: 'badge-gsm',
  },
  {
    id: 'verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    badge: 'badge-verge',
  },
  {
    id: '9to5g',
    name: '9to5Google',
    url: 'https://9to5google.com/feed',
    badge: 'badge-9to5g',
  },
  {
    id: '9to5m',
    name: '9to5Mac',
    url: 'https://9to5mac.com/feed',
    badge: 'badge-9to5m',
  },
  {
    id: 'pa',
    name: 'PhoneArena',
    url: 'https://www.phonearena.com/news/rss',
    badge: 'badge-pa',
  },
];

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

// ── 翻訳関数（Groq LLM経由）─────────────
const translateArticle = async (title, description) => {
  const plainDesc = (description || '').replace(/<[^>]*>/g, '').slice(0, 1000);
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description: plainDesc }),
  });
  if (!res.ok) throw new Error('Translation failed');
  return res.json();
};

// ── ニュースカード ──────────────────────────
const NewsCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  const source = RSS_SOURCES.find((s) => s.id === item.sourceId);

  const handleTap = async () => {
    if (!expanded && !translated) {
      setExpanded(true);
      setTranslating(true);
      try {
        const result = await translateArticle(item.title, item.description);
        setTranslated(result);
      } catch (e) {
        setTranslated({ title: item.title, description: item.description });
      } finally {
        setTranslating(false);
      }
    } else {
      setExpanded((v) => !v);
    }
  };

  return (
    <div className={`news-card ${expanded ? 'expanded' : ''}`} onClick={handleTap}>
      <div className="news-card-main">
        {item.thumbnail ? (
          <img className="news-thumb" src={item.thumbnail} alt={item.title} onError={(e) => e.target.style.display='none'} />
        ) : (
          <div className="news-thumb news-thumb-placeholder">📱</div>
        )}
        <div className="news-body">
          <span className={`news-source-badge ${source?.badge}`}>{source?.name?.toUpperCase()}</span>
          <div className="news-title">{item.title}</div>
          <div className="news-meta">
            <span className="news-date">{new Date(item.pubDate).toLocaleDateString('ja-JP')}</span>
            <span className="news-expand-hint">{expanded ? '▲ 閉じる' : '▼ 日本語で読む'}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="news-detail" onClick={(e) => e.stopPropagation()}>
          {translating ? (
            <div className="translating">
              <div className="typing"><span></span><span></span><span></span></div>
              <span>LEXが翻訳中でございます...</span>
            </div>
          ) : translated ? (
            <>
              <h3 className="news-detail-title">{translated.title}</h3>
              <p className="news-detail-body">{translated.description}</p>
            </>
          ) : null}
          <button
            className="news-open-btn"
            onClick={() => window.open(item.link, '_blank')}
          >
            元記事を開く →
          </button>
        </div>
      )}
    </div>
  );
};

// ── メイン ───────────────────────────────
const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled(
        RSS_SOURCES.map(async (source) => {
          const res = await fetch(`${RSS2JSON}${encodeURIComponent(source.url)}&count=10`);
          const data = await res.json();
          return (data.items || []).map((item) => ({
            id: `${source.id}_${item.guid || item.link}`,
            sourceId: source.id,
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: item.pubDate,
            thumbnail: item.thumbnail || item.enclosure?.link || null,
          }));
        })
      );

      const allArticles = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      setArticles(allArticles);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const filtered = activeSource === 'all'
    ? articles
    : articles.filter((a) => a.sourceId === activeSource);

  return (
    <div className="news-screen">
      <h2 className="news-screen-title">📰 News Feed</h2>

      <div className="source-row">
        <button
          className={`source-btn ${activeSource === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSource('all')}
        >
          ALL
        </button>
        {RSS_SOURCES.map((s) => (
          <button
            key={s.id}
            className={`source-btn ${activeSource === s.id ? 'active' : ''}`}
            onClick={() => setActiveSource(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="news-loading">記事を読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="news-loading">記事が見つかりませんでした</p>
      ) : (
        filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))
      )}
    </div>
  );
};

export default NewsScreen;
