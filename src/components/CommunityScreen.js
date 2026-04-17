import React, { useState, useMemo } from 'react';
import './CommunityScreen.css';

// ─────────────────────────────────────────
// Firebase連携時はこの mockPosts を
// Firestore の onSnapshot() に差し替えるだけでOK
//
// Firestoreのコレクション構造想定:
//   /posts/{postId}
//     - uid: string
//     - username: string
//     - avatarInitials: string
//     - body: string
//     - imageUrl: string | null
//     - tag: 'review' | 'question' | 'deal' | 'photo'
//     - likeCount: number
//     - likedBy: string[]   // uidの配列
//     - createdAt: Timestamp
//
//   /posts/{postId}/comments/{commentId}
//     - uid: string
//     - username: string
//     - avatarInitials: string
//     - body: string
//     - createdAt: Timestamp
// ─────────────────────────────────────────

const mockPosts = [
  {
    id: 'post001',
    uid: 'user_tk',
    username: 'TechKing_jp',
    avatarInitials: 'TK',
    body: 'Galaxy S25 Ultraのカメラ、マジでやばい。夜景の撮影が特に神レベル。Leicaには及ばないけど日常使いなら文句なし🔥',
    imageUrl: null,
    tag: 'review',
    likeCount: 24,
    likedBy: [],
    createdAt: '2時間前',
    comments: [
      { id: 'c001', uid: 'user_ss', username: 'SmartphoneOtaku', avatarInitials: 'SS', body: '同意！特に望遠がえぐい', createdAt: '1時間前' },
    ],
  },
  {
    id: 'post002',
    uid: 'user_mr',
    username: 'MobileReview99',
    avatarInitials: 'MR',
    body: 'Pixel 9 ProとiPhone 16 Pro、どっちにするか迷ってる。カメラ重視ならどっちがおすすめ？みんなの意見が聞きたい📷',
    imageUrl: null,
    tag: 'question',
    likeCount: 17,
    likedBy: [],
    createdAt: '5時間前',
    comments: [
      { id: 'c002', uid: 'user_lx', username: 'LexFan_01', avatarInitials: 'LX', body: '動画撮るならiPhone、写真ならPixelかな', createdAt: '4時間前' },
    ],
  },
  {
    id: 'post003',
    uid: 'user_dh',
    username: 'DealHunter_X',
    avatarInitials: 'DH',
    body: 'Xiaomi 14 UltraがAmazonで¥119,800に値下がり中！定価より2万安い。欲しかった人は今がチャンス💸',
    imageUrl: null,
    tag: 'deal',
    likeCount: 41,
    likedBy: [],
    createdAt: '1日前',
    comments: [],
  },
];

const TAGS = ['review', 'question', 'deal', 'photo'];

// ── 投稿カード ──────────────────────────────
const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [commentInput, setCommentInput] = useState('');

  const handleLike = () => {
    // Firebase連携時: Firestore の likeCount と likedBy を update()
    if (liked) {
      setLikeCount((v) => v - 1);
    } else {
      setLikeCount((v) => v + 1);
    }
    setLiked((v) => !v);
  };

  const handleComment = () => {
    if (!commentInput.trim()) return;
    // Firebase連携時: addDoc('/posts/{postId}/comments', {...})
    const newComment = {
      id: `c_${Date.now()}`,
      uid: 'current_user',
      username: 'あなた',
      avatarInitials: 'ME',
      body: commentInput.trim(),
      createdAt: 'たった今',
    };
    setComments((prev) => [...prev, newComment]);
    setCommentInput('');
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.avatarInitials}</div>
        <div className="post-meta">
          <div className="post-username">{post.username}</div>
          <div className="post-time">{post.createdAt}</div>
        </div>
        <span className="post-tag-pill">{post.tag}</span>
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
          ♥ {likeCount}
        </button>
        <button
          className="action-btn"
          onClick={() => setCommentOpen((v) => !v)}
        >
          💬 {comments.length}
        </button>
        <button className="action-btn">↗ シェア</button>
      </div>

      {commentOpen && (
        <div className="comment-area">
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
              placeholder="コメントを追加..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
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

// ── メイン ───────────────────────────────
const CommunityScreen = () => {
  const [activeTag, setActiveTag] = useState('');
  const [keyword, setKeyword] = useState('');
  const [posts] = useState(mockPosts);
  // Firebase連携時: const [posts, setPosts] = useState([]);
  // useEffect(() => {
  //   const unsub = onSnapshot(collection(db, 'posts'), (snap) => {
  //     setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  //   });
  //   return () => unsub();
  // }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchTag = !activeTag || p.tag === activeTag;
      const matchKeyword =
        !keyword ||
        p.body.toLowerCase().includes(keyword.toLowerCase()) ||
        p.username.toLowerCase().includes(keyword.toLowerCase());
      return matchTag && matchKeyword;
    });
  }, [posts, activeTag, keyword]);

  return (
    <div className="community-screen">
      <div className="community-header">
        <h2 className="community-title">▶ Community</h2>
        {/* Firebase連携時: モーダルで投稿フォームを開く */}
        <button className="new-post-btn">+ 投稿</button>
      </div>

      <input
        className="community-search"
        type="text"
        placeholder="キーワードで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

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

      {filteredPosts.length === 0 ? (
        <p className="no-result">該当する投稿が見つかりませんでした</p>
      ) : (
        filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
};

export default CommunityScreen;
