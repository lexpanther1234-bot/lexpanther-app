import { useState, useEffect, useMemo, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './CommunityScreen.css';

const TAGS = ['review', 'question', 'deal', 'photo'];
const SUBREDDITS = ['Android', 'iphone', 'Smartphones', 'japanphone'];
const YT_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ── ヘルパー ──────────────────────────────────
const formatTime = (ts) => {
  if (ts == null) return '';
  let ms;
  if (typeof ts === 'number') ms = ts;
  else if (typeof ts === 'string') ms = new Date(ts).getTime();
  else if (ts.toDate) ms = ts.toDate().getTime();
  else ms = new Date(ts).getTime();
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return 'たった今';
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
};

const isJapanese = (text) => /[\u3040-\u9FFF\uFF00-\uFFEF]/.test(text || '');
const needsTranslation = (post) =>
  !isJapanese((post.title || '') + (post.body || ''));

// ── 外部データ取得 ────────────────────────────
const fetchRedditPosts = async () => {
  const results = await Promise.allSettled(
    SUBREDDITS.map((sub) =>
      fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8&raw_json=1`, {
        headers: { Accept: 'application/json' },
      })
        .then((r) => r.json())
        .then((data) =>
          (data.data?.children || []).map((child) => {
            const p = child.data;
            return {
              id: `reddit_${p.id}`,
              source: 'reddit',
              username: `u/${p.author}`,
              avatarInitials: p.author.slice(0, 2).toUpperCase(),
              title: p.title,
              body: p.selftext || '',
              likeCount: p.score,
              commentCount: p.num_comments,
              createdAtMs: p.created_utc * 1000,
              url: `https://www.reddit.com${p.permalink}`,
              subreddit: p.subreddit_name_prefixed,
            };
          })
        )
    )
  );
  return results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);
};

const fetchYouTubeComments = async () => {
  if (!YT_KEY) return [];
  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=スマートフォン+レビュー+2025&type=video&order=viewCount&maxResults=4&key=${YT_KEY}`
    );
    const searchData = await searchRes.json();
    if (!searchData.items) return [];

    const videoIds = searchData.items.map((item) => item.id.videoId);
    const commentResults = await Promise.allSettled(
      videoIds.map((videoId) =>
        fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&order=relevance&key=${YT_KEY}`
        )
          .then((r) => r.json())
          .then((data) =>
            (data.items || []).map((item) => {
              const c = item.snippet.topLevelComment.snippet;
              return {
                id: `yt_${item.id}`,
                source: 'youtube',
                username: c.authorDisplayName,
                avatarInitials: (c.authorDisplayName || 'YT').slice(0, 2).toUpperCase(),
                body: c.textDisplay,
                likeCount: c.likeCount || 0,
                commentCount: item.snippet.totalReplyCount || 0,
                createdAtMs: new Date(c.publishedAt).getTime(),
                url: `https://www.youtube.com/watch?v=${videoId}`,
                videoId,
              };
            })
          )
      )
    );
    return commentResults
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value);
  } catch {
    return [];
  }
};

// ── ソースバッジ ──────────────────────────────
const SourceBadge = ({ source }) => {
  const labels = { user: 'ユーザー', reddit: 'Reddit', youtube: 'YouTube' };
  return (
    <span className={`source-badge source-badge--${source}`}>
      {labels[source] || source}
    </span>
  );
};

// ── ユーザー投稿カード ────────────────────────
const PostCard = ({ post, user, onLoginRequest }) => {
  const liked = user ? (post.likedBy || []).includes(user.uid) : false;
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    if (!user) { onLoginRequest(); return; }
    const postRef = doc(db, 'posts', post.id);
    if (liked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(user.uid),
        likeCount: Math.max(0, (post.likeCount || 0) - 1),
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(user.uid),
        likeCount: (post.likeCount || 0) + 1,
      });
    }
  };

  const toggleComments = async () => {
    const next = !commentOpen;
    setCommentOpen(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      const snap = await getDocs(
        query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc'))
      );
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!user) { onLoginRequest(); return; }
    if (!commentInput.trim()) return;
    const newComment = {
      uid: user.uid,
      username: user.displayName || 'ユーザー',
      avatarInitials: (user.displayName?.[0] || 'U').toUpperCase(),
      body: commentInput.trim(),
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'posts', post.id, 'comments'), newComment);
    setComments((prev) => [...prev, { id: ref.id, ...newComment, createdAt: null }]);
    setCommentInput('');
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.avatarInitials}</div>
        <div className="post-meta">
          <div className="post-username">{post.username}</div>
          <div className="post-time">{formatTime(post.createdAt)}</div>
        </div>
        <div className="post-badges">
          <SourceBadge source="user" />
          <span className="post-tag-pill">{post.tag}</span>
        </div>
      </div>

      <p className="post-body">{post.body}</p>

      {post.imageUrl && (
        <img className="post-image" src={post.imageUrl} alt="投稿画像" />
      )}

      <div className="post-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          ♥ {post.likeCount || 0}
        </button>
        <button className="action-btn" onClick={toggleComments}>
          💬 {post.commentCount || 0}
        </button>
        <button className="action-btn">↗ シェア</button>
      </div>

      {commentOpen && (
        <div className="comment-area">
          {loadingComments && <p className="loading-comments">読み込み中...</p>}
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <div className="comment-avatar">{c.avatarInitials}</div>
              <div className="comment-bubble">
                <div className="comment-username">{c.username}</div>
                <div className="comment-body">{c.body}</div>
              </div>
            </div>
          ))}
          <div className="comment-input-row">
            <input
              className="comment-input"
              type="text"
              placeholder={user ? 'コメントを追加...' : 'ログインしてコメント'}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              onClick={!user ? onLoginRequest : undefined}
              readOnly={!user}
            />
            <button className="comment-send-btn" onClick={handleComment}>
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 外部ソースカード（Reddit / YouTube）────────
const ExternalCard = ({ post }) => {
  const bodyPreview = (post.body || '').length > 200
    ? post.body.slice(0, 200) + '…'
    : post.body;

  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => { cancelledRef.current = true; };
  }, []);

  const handleTranslate = async () => {
    if (translation !== null || translating) return;
    cancelledRef.current = false;
    setTranslating(true);
    setTranslation('');
    try {
      const text = [post.title, post.body]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 2000);
      const stream = anthropic.messages.stream({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `次のテキストを自然な日本語に翻訳してください。翻訳文のみを返してください：\n\n${text}`,
        }],
      });
      stream.on('text', (delta) => {
        if (!cancelledRef.current) {
          setTranslation((prev) => (prev ?? '') + delta);
        }
      });
      await stream.finalMessage();
    } catch {
      if (!cancelledRef.current) {
        setTranslation('翻訳に失敗しました。しばらく経ってから再試行してください。');
      }
    } finally {
      if (!cancelledRef.current) setTranslating(false);
    }
  };

  return (
    <div className={`post-card external-card external-card--${post.source}`}>
      <div className="post-header">
        <div className="post-avatar">{post.avatarInitials}</div>
        <div className="post-meta">
          <div className="post-username">
            {post.username}
            {post.subreddit && (
              <span className="post-subreddit"> · {post.subreddit}</span>
            )}
          </div>
          <div className="post-time">{formatTime(post.createdAtMs)}</div>
        </div>
        <SourceBadge source={post.source} />
      </div>

      {post.title && <p className="external-title">{post.title}</p>}
      {bodyPreview && <p className="post-body">{bodyPreview}</p>}

      {translating && translation === '' && (
        <p className="translation-loading">翻訳中...</p>
      )}
      {translation !== null && translation !== '' && (
        <div className="translation-box">
          <div className="translation-label">🌐 日本語訳</div>
          <p className="translation-text">{translation}</p>
        </div>
      )}

      <div className="post-actions external-actions">
        <span className="action-count">♥ {post.likeCount.toLocaleString()}</span>
        <span className="action-count">💬 {post.commentCount.toLocaleString()}</span>
        {needsTranslation(post) && translation === null && (
          <button
            className={`translate-btn ${translating ? 'translating' : ''}`}
            onClick={handleTranslate}
            disabled={translating}
          >
            {translating ? '翻訳中...' : '🌐 日本語に翻訳'}
          </button>
        )}
        <a
          className="external-link-btn"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ 元の投稿
        </a>
      </div>
    </div>
  );
};

// ── 新規投稿モーダル ──────────────────────────
const PostModal = ({ user, onClose }) => {
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('review');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    await addDoc(collection(db, 'posts'), {
      uid: user.uid,
      username: user.displayName || 'ユーザー',
      avatarInitials: (user.displayName?.[0] || 'U').toUpperCase(),
      body: body.trim(),
      imageUrl: null,
      tag,
      likeCount: 0,
      likedBy: [],
      commentCount: 0,
      createdAt: serverTimestamp(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">新規投稿</div>
        <div className="modal-tag-row">
          {TAGS.map((t) => (
            <button
              key={t}
              className={`tag-btn ${tag === t ? 'active' : ''}`}
              onClick={() => setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          className="modal-textarea"
          placeholder="内容を入力..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
        />
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onClose}>キャンセル</button>
          <button
            className="modal-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
          >
            {submitting ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── ログイン促進バナー ────────────────────────
const LoginBanner = ({ onLogin }) => (
  <div className="login-banner">
    <p className="login-banner-text">投稿・いいね・コメントにはGoogleログインが必要です</p>
    <button className="login-banner-btn" onClick={onLogin}>Googleでログイン</button>
  </div>
);

// ── メイン ───────────────────────────────────
const CommunityScreen = () => {
  const { user, signIn } = useAuth();
  const [activeSource, setActiveSource] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [keyword, setKeyword] = useState('');
  const [firestorePosts, setFirestorePosts] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [ytComments, setYtComments] = useState([]);
  const [externalLoading, setExternalLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // Firestore リアルタイム購読
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFirestorePosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Reddit + YouTube 初回取得
  useEffect(() => {
    Promise.allSettled([fetchRedditPosts(), fetchYouTubeComments()]).then(
      ([redditResult, ytResult]) => {
        if (redditResult.status === 'fulfilled') setRedditPosts(redditResult.value);
        if (ytResult.status === 'fulfilled') setYtComments(ytResult.value);
        setExternalLoading(false);
      }
    );
  }, []);

  // 全投稿を時系列マージ
  const allPosts = useMemo(() => {
    const userPosts = firestorePosts.map((p) => {
      const ms = p.createdAt
        ? (p.createdAt.toDate ? p.createdAt.toDate().getTime() : new Date(p.createdAt).getTime())
        : Date.now();
      return { ...p, source: 'user', createdAtMs: ms };
    });
    return [...userPosts, ...redditPosts, ...ytComments].sort(
      (a, b) => b.createdAtMs - a.createdAtMs
    );
  }, [firestorePosts, redditPosts, ytComments]);

  const handleNewPost = () => {
    if (!user) { setLoginPrompt(true); return; }
    setModalOpen(true);
  };

  const handleLoginRequest = () => setLoginPrompt(true);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((p) => {
      const matchSource = !activeSource || p.source === activeSource;
      const matchTag =
        p.source !== 'user' || !activeTag || p.tag === activeTag;
      const matchKeyword =
        !keyword ||
        (p.body || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (p.title || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (p.username || '').toLowerCase().includes(keyword.toLowerCase());
      return matchSource && matchTag && matchKeyword;
    });
  }, [allPosts, activeSource, activeTag, keyword]);

  const SOURCES = [
    { key: '', label: '全て' },
    { key: 'user', label: 'ユーザー投稿' },
    { key: 'reddit', label: 'Reddit' },
    { key: 'youtube', label: 'YouTube' },
  ];

  return (
    <div className="community-screen">
      <div className="community-header">
        <h2 className="community-title">▶ Community</h2>
        <button className="new-post-btn" onClick={handleNewPost}>+ 投稿</button>
      </div>

      {!user && <LoginBanner onLogin={signIn} />}

      {loginPrompt && !user && (
        <div className="modal-overlay" onClick={() => setLoginPrompt(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">ログインが必要です</div>
            <p className="modal-body-text">この操作にはGoogleアカウントでのログインが必要です。</p>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={() => setLoginPrompt(false)}>キャンセル</button>
              <button className="modal-submit-btn" onClick={() => { signIn(); setLoginPrompt(false); }}>
                Googleでログイン
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && user && (
        <PostModal user={user} onClose={() => setModalOpen(false)} />
      )}

      {/* ソースフィルター */}
      <div className="source-filter-row">
        {SOURCES.map((s) => (
          <button
            key={s.key}
            className={`source-filter-btn ${activeSource === s.key ? 'active' : ''}`}
            onClick={() => setActiveSource(s.key)}
          >
            {s.label}
            {s.key === 'reddit' && externalLoading && (
              <span className="loading-dot"> ···</span>
            )}
          </button>
        ))}
      </div>

      <input
        className="community-search"
        type="text"
        placeholder="キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {/* タグフィルター（ユーザー投稿表示時のみ） */}
      {(activeSource === '' || activeSource === 'user') && (
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
      )}

      {filteredPosts.length === 0 ? (
        <p className="no-result">
          {externalLoading ? '読み込み中...' : '該当する投稿が見つかりませんでした'}
        </p>
      ) : (
        filteredPosts.map((post) =>
          post.source === 'user' ? (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onLoginRequest={handleLoginRequest}
            />
          ) : (
            <ExternalCard key={post.id} post={post} />
          )
        )
      )}
    </div>
  );
};

export default CommunityScreen;
