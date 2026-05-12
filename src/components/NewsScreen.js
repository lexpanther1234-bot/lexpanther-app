import { useState, useEffect, useRef } from 'react';
import './NewsScreen.css';

const RSS_SOURCES = [
  { id: 'gsm',   name: 'GSMArena',   url: 'https://www.gsmarena.com/rss-news-reviews.php3', badge: 'badge-gsm' },
  { id: 'verge', name: 'The Verge',  url: 'https://www.theverge.com/rss/index.xml',         badge: 'badge-verge' },
  { id: '9to5g', name: '9to5Google', url: 'https://9to5google.com/feed',                    badge: 'badge-9to5g' },
  { id: '9to5m', name: '9to5Mac',    url: 'https://9to5mac.com/feed',                       badge: 'badge-9to5m' },
  { id: 'pa',    name: 'PhoneArena', url: 'https://www.phonearena.com/news/rss',             badge: 'badge-pa' },
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
const NewsCard = ({ item, translation }) => {
  const [expanded, setExpanded] = useState(false);
  const source = RSS_SOURCES.find((s) => s.id === item.sourceId);

  const displayTitle = translation?.title || item.title;
  const isTranslating = !translation;

  return (
    <div className={`news-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(v => !v)}>
      <div className="news-card-main">
        {item.thumbnail ? (
          <img className="news-thumb" src={item.thumbnail} alt="" onError={(e) => e.target.style.display='none'} />
        ) : (
          <div className="news-thumb news-thumb-placeholder">📱</div>
        )}
        <div className="news-body">
          <span className={`news-source-badge ${source?.badge}`}>{source?.name?.toUpperCase()}</span>
          <div className="news-title">
            {isTranslating && <span className="news-translating-dot">●</span>}
            {displayTitle}
          </div>
          <div className="news-meta">
            <span className="news-date">{new Date(item.pubDate).toLocaleDateString('ja-JP')}</span>
            <span className="news-expand-hint">{expanded ? '▲ 閉じる' : '▼ 詳細'}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="news-detail" onClick={(e) => e.stopPropagation()}>
          {isTranslating ? (
            <div className="translating">
              <div className="typing"><span></span><span></span><span></span></div>
              <span>翻訳中...</span>
            </div>
          ) : (
            <>
              <h3 className="news-detail-title">{translation.title}</h3>
              <p className="news-detail-body">{translation.description}</p>
            </>
          )}
          <button className="news-open-btn" onClick={() => window.open(item.link, '_blank')}>
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
  const [translations, setTranslations] = useState({});
  const translatingRef = useRef(false);

  // 記事取得
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

  // 記事取得後に自動翻訳（順次実行でレート制限回避）
  useEffect(() => {
    if (articles.length === 0 || translatingRef.current) return;
    translatingRef.current = true;

    const translateAll = async () => {
      for (const article of articles) {
        // 既に翻訳済みならスキップ
        if (translations[article.id]) continue;
        try {
          const result = await translateArticle(article.title, article.description);
          setTranslations(prev => ({ ...prev, [article.id]: result }));
        } catch (e) {
          // 失敗時は原文をそのまま使う
          setTranslations(prev => ({
            ...prev,
            [article.id]: { title: article.title, description: (article.description || '').replace(/<[^>]*>/g, '') },
          }));
        }
      }
      translatingRef.current = false;
    };
    translateAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles]);

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
          <NewsCard key={item.id} item={item} translation={translations[item.id]} />
        ))
      )}
    </div>
  );
};

export default NewsScreen;
