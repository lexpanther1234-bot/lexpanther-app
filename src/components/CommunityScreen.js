import { useState, useEffect, useMemo, useRef } from 'react';
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
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './CommunityScreen.css';

const SUBREDDITS = ['Android', 'iphone', 'Smartphones'];

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

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

const isJapanese = (text) => /[぀-鿿＀-￯]/.test(text || '');
const needsTranslation = (post) =>
  !isJapanese((post.title || '') + (post.body || ''));

// ── 外部データ取得 ────────────────────────────
const fetchRedditPosts = async () => {
  const results = await Promise.allSettled(
    SUBREDDITS.map((sub) =>
      fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`)
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

const ytFetch = (path, params) =>
  fetch('/api/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, params }),
  }).then((r) => r.json());

const fetchYouTubeComments = async () => {
  try {
    const searchData = await ytFetch('search', {
      part: 'snippet',
      q: 'スマートフォン レビュー 2025',
      type: 'video',
      order: 'viewCount',
      maxResults: '4',
    });
    if (!searchData.items) return [];

    const videoIds = searchData.items.map((item) => item.id.videoId);
    const commentResults = await Promise.allSettled(
      videoIds.map((videoId) =>
        ytFetch('commentThreads', {
          part: 'snippet',
          videoId,
          maxResults: '5',
          order: 'relevance',
        })
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
const PostCard = ({ post, user, onLoginRequest, onTagClick, activeTag }) => {
  const liked = user ? (post.likedBy || []).includes(user.uid) : false;
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const postType = post.postType || 'general';

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
    <div className={`post-card post-type-${postType}`}>
      {/* タイプバッジ */}
      {postType !== 'general' && (
        <div className={`post-type-badge badge-${postType}`}>
          {postType === 'question' ? '🙋 購入相談' :
           postType === 'purchase' ? '📦 購入レポ' :
           postType === 'sale'     ? '💰 セール情報' : ''}
        </div>
      )}

      {/* 購入レポ情報 */}
      {postType === 'purchase' && post.phoneName && (
        <div className="post-purchase-info">
          <span className="purchase-phone">📱 {post.phoneName}</span>
          {post.purchasePlace && <span className="purchase-place">🏪 {post.purchasePlace}</span>}
          {post.purchasePrice > 0 && <span className="purchase-price">¥{post.purchasePrice.toLocaleString()}</span>}
        </div>
      )}

      {/* セール情報 */}
      {postType === 'sale' && (
        <div className="post-sale-info">
          {post.salePhoneName && <span className="sale-phone">📱 {post.salePhoneName}</span>}
          {post.salePrice > 0 && <span className="sale-price">🔥 ¥{post.salePrice.toLocaleString()}</span>}
          {post.saleDeadline && <span className="sale-deadline">⏰ {post.saleDeadline}</span>}
          {post.saleUrl && (
            <a href={post.saleUrl} target="_blank" rel="noopener noreferrer" className="sale-link"
               onClick={e => e.stopPropagation()}>
              セールページを見る →
            </a>
          )}
        </div>
      )}

      <div className="post-header">
        <div className="post-avatar">{post.avatarInitials}</div>
        <div className="post-meta">
          <div className="post-username">{post.username}</div>
          <div className="post-time">{formatTime(post.createdAt)}</div>
        </div>
        <div className="post-badges">
          <SourceBadge source="user" />
          {post.tag && <span className="post-tag-pill">{post.tag}</span>}
        </div>
      </div>

      <p className="post-body">{post.body}</p>

      {post.imageUrl && (
        <img className="post-image" src={post.imageUrl} alt="投稿画像" />
      )}

      {/* ハッシュタグ */}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.map(tag => (
            <button
              key={tag}
              className={`post-tag-btn ${activeTag === tag ? 'active' : ''}`}
              onClick={() => onTagClick(activeTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* LEX AI自動回答 */}
      {postType === 'question' && post.aiResponse && (
        <div className="ai-answer-card">
          <div className="ai-answer-header">🐆 LEX AI からの回答</div>
          <p className="ai-answer-text">{post.aiResponse}</p>
        </div>
      )}
      {postType === 'question' && !post.aiResponse && (
        <div className="ai-answer-pending">🐆 LEX AI が回答を準備中...</div>
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
        .join(' ')
        .slice(0, 500);
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`
      );
      const data = await res.json();
      if (!cancelledRef.current) {
        const translated = data?.responseData?.translatedText;
        setTranslation(translated || '翻訳結果を取得できませんでした。');
      }
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
const PostModal = ({ user, phones, onClose }) => {
  const [body, setBody] = useState('');
  const [postType, setPostType] = useState('general');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [purchasePlace, setPurchasePlace] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleUrl, setSaleUrl] = useState('');
  const [saleDeadline, setSaleDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const selectedPhone = phones.find(p => p.id === selectedPhoneId);
      const postData = {
        uid: user.uid,
        username: user.displayName || 'ユーザー',
        avatarInitials: (user.displayName?.[0] || 'U').toUpperCase(),
        body: body.trim(),
        imageUrl: null,
        tag: postType === 'question' ? 'question' : postType === 'purchase' ? 'review' : postType === 'sale' ? 'deal' : 'review',
        likeCount: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        postType,
        tags,
        ...(postType === 'purchase' && selectedPhone ? {
          phoneId: selectedPhone.id,
          phoneName: selectedPhone.name,
          purchasePlace: purchasePlace.trim(),
          purchasePrice: Number(purchasePrice) || 0,
        } : {}),
        ...(postType === 'sale' && selectedPhone ? {
          salePhoneId: selectedPhone.id,
          salePhoneName: selectedPhone.name,
          salePrice: Number(salePrice) || 0,
          saleUrl: saleUrl.trim(),
          saleDeadline: saleDeadline.trim(),
        } : {}),
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);

      // 購入相談の場合はLEX AIが自動回答
      if (postType === 'question') {
        fetchAiAnswer(body.trim(), docRef.id);
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '').slice(0, 20);
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags(prev => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">新規投稿</div>

        {/* 投稿タイプ選択 */}
        <div className="post-type-selector">
          {[
            { id: 'general',  label: '💬 通常' },
            { id: 'question', label: '🙋 相談' },
            { id: 'purchase', label: '📦 購入レポ' },
            { id: 'sale',     label: '💰 セール' },
          ].map(t => (
            <button
              key={t.id}
              className={`post-type-btn ${postType === t.id ? 'active' : ''}`}
              onClick={() => setPostType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {postType === 'question' && (
          <p className="form-hint">🐆 投稿するとLEX AIが自動で回答します</p>
        )}

        {/* 機種選択 */}
        {(postType === 'purchase' || postType === 'sale') && (
          <select
            className="form-select"
            value={selectedPhoneId}
            onChange={e => setSelectedPhoneId(e.target.value)}
          >
            <option value="">機種を選択...</option>
            {phones.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>
            ))}
          </select>
        )}

        {/* 購入レポ専用 */}
        {postType === 'purchase' && (
          <div className="form-extra-fields">
            <input className="form-input" placeholder="購入場所（例: AliExpress、Amazon）"
              value={purchasePlace} onChange={e => setPurchasePlace(e.target.value)} />
            <input className="form-input" type="number" placeholder="購入価格（円）"
              value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} />
          </div>
        )}

        {/* セール専用 */}
        {postType === 'sale' && (
          <div className="form-extra-fields">
            <input className="form-input" type="number" placeholder="セール価格（円）"
              value={salePrice} onChange={e => setSalePrice(e.target.value)} />
            <input className="form-input" placeholder="セールページURL"
              value={saleUrl} onChange={e => setSaleUrl(e.target.value)} />
            <input className="form-input" placeholder="期限（例: 5/31まで）任意"
              value={saleDeadline} onChange={e => setSaleDeadline(e.target.value)} />
          </div>
        )}

        <textarea
          className="modal-textarea"
          placeholder={
            postType === 'question' ? '例: 予算5万円でカメラ重視です。Xiaomi vs OPPOどちらがいいですか？' :
            postType === 'purchase' ? '購入した感想・レビューを書いてください' :
            postType === 'sale'     ? 'セール情報の詳細を書いてください' :
            '内容を入力...'
          }
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />

        {/* ハッシュタグ */}
        <div className="tag-input-wrap">
          <input
            className="tag-input"
            placeholder="タグを追加（Enterで確定）例: Xiaomi"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          {tags.length > 0 && (
            <div className="tag-list">
              {tags.map(tag => (
                <span key={tag} className="tag-badge">
                  #{tag}
                  <button className="tag-remove" onClick={() => setTags(prev => prev.filter(t => t !== tag))}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

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

// AI自動回答（非同期で実行・Firestoreキャッシュ対応）
const fetchAiAnswer = async (question, postId) => {
  try {
    const questionHash = simpleHash(question.trim());

    // ① Firestoreキャッシュを確認
    const cacheRef = doc(db, 'aiAnswerCache', questionHash);
    const cacheSnap = await getDoc(cacheRef);

    let answer;
    if (cacheSnap.exists()) {
      answer = cacheSnap.data().answerText;
    } else {
      // ② キャッシュがなければGemini APIを呼び出す
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'あなたはLEXPANTHERというスマートフォン販売アプリの執事型AIアシスタントです。ユーザーのスマートフォン購入相談に対して、丁寧かつ具体的にアドバイスしてください。予算・用途・好みを考慮した上で、200文字以内で端的に回答してください。',
          messages: [{ role: 'user', content: question }],
        }),
      });
      const data = await res.json();
      answer = data.content?.[0]?.text || '申し訳ございません。回答を生成できませんでした。';

      // ③ 生成結果をFirestoreに保存
      if (answer && answer !== '申し訳ございません。回答を生成できませんでした。') {
        await setDoc(cacheRef, {
          question:   question.trim(),
          answerText: answer,
          createdAt:  serverTimestamp(),
          model:      'gemini-2.5-flash',
        });
      }
    }

    // 投稿ドキュメントにAI回答を保存
    await updateDoc(doc(db, 'posts', postId), {
      aiResponse:   answer,
      aiAnsweredAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('AI answer error:', err);
  }
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
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [firestorePosts, setFirestorePosts] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [ytComments, setYtComments] = useState([]);
  const [externalLoading, setExternalLoading] = useState(true);
  const [externalError, setExternalError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [phones, setPhones] = useState([]);

  // Firestore リアルタイム購読
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFirestorePosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // phones コレクション読み込み
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), snap => {
      setPhones(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    });
    return () => unsub();
  }, []);

  // Reddit + YouTube 初回取得
  useEffect(() => {
    Promise.allSettled([fetchRedditPosts(), fetchYouTubeComments()]).then(
      ([redditResult, ytResult]) => {
        if (redditResult.status === 'fulfilled') setRedditPosts(redditResult.value);
        if (ytResult.status === 'fulfilled') setYtComments(ytResult.value);
        const bothFailed =
          redditResult.status === 'rejected' && ytResult.status === 'rejected';
        if (bothFailed) setExternalError('Reddit・YouTubeの読み込みに失敗しました');
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
      // カテゴリフィルター
      if (activeCategory === 'question') return p.source === 'user' && p.postType === 'question';
      if (activeCategory === 'purchase') return p.source === 'user' && p.postType === 'purchase';
      if (activeCategory === 'sale') return p.source === 'user' && p.postType === 'sale';
      if (activeCategory === 'reddit') return p.source === 'reddit';
      if (activeCategory === 'youtube') return p.source === 'youtube';
      // 'all' はすべて表示

      return true;
    }).filter((p) => {
      // タグフィルター
      if (activeTag && !(p.tags || []).includes(activeTag)) return false;
      // キーワード検索
      if (keyword) {
        const kw = keyword.toLowerCase();
        const matchText = (p.body || '').toLowerCase().includes(kw) ||
          (p.title || '').toLowerCase().includes(kw) ||
          (p.username || '').toLowerCase().includes(kw) ||
          (p.tags || []).some(t => t.toLowerCase().includes(kw));
        if (!matchText) return false;
      }
      return true;
    });
  }, [allPosts, activeCategory, activeTag, keyword]);

  const CATEGORIES = [
    { id: 'all',      label: '全て' },
    { id: 'question', label: '🙋 相談' },
    { id: 'purchase', label: '📦 購入レポ' },
    { id: 'sale',     label: '💰 セール' },
    { id: 'reddit',   label: 'Reddit' },
    { id: 'youtube',  label: 'YouTube' },
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
        <PostModal user={user} phones={phones} onClose={() => setModalOpen(false)} />
      )}

      {/* カテゴリフィルター */}
      <div className="source-filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`source-filter-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => { setActiveCategory(c.id); setActiveTag(null); }}
          >
            {c.label}
            {(c.id === 'reddit' || c.id === 'youtube') && externalLoading && (
              <span className="loading-dot"> ···</span>
            )}
          </button>
        ))}
      </div>

      <input
        className="community-search"
        type="text"
        placeholder="キーワード・タグで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {activeTag && (
        <div className="active-tag-bar">
          <span>タグ: #{activeTag}</span>
          <button className="clear-tag-btn" onClick={() => setActiveTag(null)}>× クリア</button>
        </div>
      )}

      {externalError && (
        <p className="no-result" style={{ color: '#ff6644', fontSize: '11px' }}>
          ⚠ {externalError}
        </p>
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
              onTagClick={setActiveTag}
              activeTag={activeTag}
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
