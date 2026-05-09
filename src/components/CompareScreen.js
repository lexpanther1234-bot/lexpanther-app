import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './CompareScreen.css';

const RANK_TYPES = [
  { id: 'overall', label: '総合' },
  { id: 'fps', label: 'パフォーマンス' },
  { id: 'camera', label: 'カメラ' },
  { id: 'battery', label: 'バッテリー' },
  { id: 'cospa', label: 'コスパ' },
  { id: 'votes', label: '🗳 投票' },
];

const SPEC_ROWS = [
  { label: 'チップ', key: 'cpu', isSpec: true },
  { label: 'RAM', key: 'ram', isSpec: true },
  { label: 'カメラ', key: 'camera', isSpec: true },
  { label: 'バッテリー', key: 'battery', isSpec: true },
  { label: '充電速度', key: 'charge' },
  { label: 'ディスプレイ', key: 'display', isSpec: true },
  { label: '重量', key: 'weight' },
  { label: '価格', key: 'price', isPrice: true },
  { label: '総合スコア', key: 'overall', isScore: true },
  { label: 'パフォーマンス', key: 'fps', isScore: true },
  { label: 'カメラスコア', key: 'camera', isScore: true },
  { label: 'バッテリースコア', key: 'battery', isScore: true },
];

const REVIEW_CATEGORIES = [
  { id: 'camera', label: 'カメラ' },
  { id: 'design', label: 'デザイン' },
  { id: 'battery', label: 'バッテリー' },
  { id: 'performance', label: 'パフォーマンス' },
  { id: 'cospa', label: 'コスパ' },
];

const PRICE_RANGES = [
  { id: 'all', label: '全価格帯' },
  { id: 'under30k', label: '〜3万円', max: 30000 },
  { id: '30k-60k', label: '3〜6万円', min: 30000, max: 60000 },
  { id: '60k-100k', label: '6〜10万円', min: 60000, max: 100000 },
  { id: '100k-150k', label: '10〜15万円', min: 100000, max: 150000 },
  { id: 'over150k', label: '15万円〜', min: 150000 },
];

const YEAR_OPTIONS = [
  { id: 'all', label: '全年式' },
  { id: '2025', label: '2025' },
  { id: '2024', label: '2024' },
  { id: '2023', label: '2023' },
  { id: '2022', label: '2022' },
  { id: '2021', label: '2021' },
  { id: '2020', label: '2020' },
];

const cospaScore = (phone) => {
  if (!phone.price || phone.price <= 0) return 0;
  const overall = phone.scores?.overall || 0;
  return Math.round((overall / (phone.price / 10000)) * 10);
};

const getScore = (phone, type) => {
  if (type === 'cospa') return cospaScore(phone);
  if (type === 'votes') return phone.voteCount || 0;
  return phone.scores?.[type] || 0;
};

const Stars = ({ count, interactive, onRate }) => (
  <div className="review-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        className={i <= count ? 'star' : 'star-empty'}
        onClick={interactive ? () => onRate(i) : undefined}
        style={interactive ? { cursor: 'pointer' } : undefined}
      >★</span>
    ))}
  </div>
);

const getSpecValue = (phone, row) => {
  if (row.isScore) return phone.scores?.[row.key];
  if (row.isSpec) return phone.specs?.[row.key];
  if (row.isPrice) return `¥${(phone.price || 0).toLocaleString()}`;
  return phone[row.key];
};

const CompareScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('ranking');
  const [activeRankType, setActiveRankType] = useState('overall');
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorSlot, setSelectorSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewPhoneId, setReviewPhoneId] = useState('s25u');

  // Ranking filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Reviews
  const [userReviews, setUserReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ camera: 0, design: 0, battery: 0, performance: 0, cospa: 0, text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Influencer reviews
  const [influencerReviews, setInfluencerReviews] = useState([]);

  // Reddit reviews
  const [redditPosts, setRedditPosts] = useState([]);
  const [redditLoading, setRedditLoading] = useState(false);
  const [redditError, setRedditError] = useState(false);

  // Likes
  const [likes, setLikes] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());

  // Votes
  const [userVotes, setUserVotes] = useState(new Set());
  const [votingId, setVotingId] = useState(null);

  // Spec detail modal
  const [showSpecModal, setShowSpecModal] = useState(false);

  // Reddit translations
  const [redditTranslations, setRedditTranslations] = useState({});

  // Expanded influencer YouTube
  const [expandedYouTube, setExpandedYouTube] = useState(new Set());

  // AI Review
  const [aiReview, setAiReview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPhones(data);
      if (data.length > 0 && selectedPhones.length === 0) {
        setSelectedPhones(data.slice(0, 3));
      }
      setLoading(false);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user votes
  useEffect(() => {
    if (!user) { setUserVotes(new Set()); return; }
    const unsub = onSnapshot(
      collection(db, 'userVotes', user.uid, 'phones'),
      (snap) => setUserVotes(new Set(snap.docs.map(d => d.id)))
    );
    return () => unsub();
  }, [user]);

  // Load reviews for selected phone
  useEffect(() => {
    if (!reviewPhoneId) return;
    const unsub = onSnapshot(
      collection(db, 'phones', reviewPhoneId, 'reviews'),
      (snap) => setUserReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [reviewPhoneId]);

  // Load influencer reviews for selected phone
  useEffect(() => {
    if (!reviewPhoneId) return;
    const unsub = onSnapshot(
      collection(db, 'phones', reviewPhoneId, 'influencerReviews'),
      (snap) => setInfluencerReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [reviewPhoneId]);

  // Load likes for selected phone
  useEffect(() => {
    if (!reviewPhoneId) return;
    const unsub = onSnapshot(
      collection(db, 'phones', reviewPhoneId, 'likes'),
      (snap) => {
        setLikes(prev => ({ ...prev, [reviewPhoneId]: snap.size }));
        if (user) {
          setUserLikes(prev => {
            const next = new Set(prev);
            if (snap.docs.some(d => d.id === user.uid)) next.add(reviewPhoneId);
            else next.delete(reviewPhoneId);
            return next;
          });
        }
      }
    );
    return () => unsub();
  }, [reviewPhoneId, user]);

  // Clear state on phone change
  useEffect(() => {
    setAiReview('');
    setRedditPosts([]);
    setRedditError(false);
    setRedditTranslations({});
    setExpandedYouTube(new Set());
    setShowSpecModal(false);
  }, [reviewPhoneId]);

  const brands = useMemo(() => {
    const set = new Set(phones.map(p => p.brand).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [phones]);

  const filteredRanking = useMemo(() => {
    let list = [...phones];
    if (filterCategory !== 'all') list = list.filter(p => p.category === filterCategory);
    if (filterBrand !== 'all') list = list.filter(p => p.brand === filterBrand);
    if (filterYear !== 'all') list = list.filter(p => String(p.releaseYear) === filterYear);
    if (filterPrice !== 'all') {
      const range = PRICE_RANGES.find(r => r.id === filterPrice);
      if (range) {
        list = list.filter(p => {
          const pr = p.price || 0;
          if (range.min && pr < range.min) return false;
          if (range.max && pr >= range.max) return false;
          return true;
        });
      }
    }
    list.sort((a, b) => getScore(b, activeRankType) - getScore(a, activeRankType));
    return list.slice(0, 20);
  }, [phones, filterCategory, filterBrand, filterPrice, filterYear, activeRankType]);

  const reviewPhone = phones.find(p => p.id === reviewPhoneId) || phones[0];

  const avgReviewScores = useMemo(() => {
    if (userReviews.length === 0) return null;
    const sums = { camera: 0, design: 0, battery: 0, performance: 0, cospa: 0 };
    userReviews.forEach(r => {
      REVIEW_CATEGORIES.forEach(c => { sums[c.id] += (r[c.id] || 0); });
    });
    const avg = {};
    REVIEW_CATEGORIES.forEach(c => { avg[c.id] = +(sums[c.id] / userReviews.length).toFixed(1); });
    return avg;
  }, [userReviews]);

  const handleSlotClick = (index) => {
    setSelectorSlot(index);
    setShowSelector(true);
    setSearchQuery('');
  };

  const handlePhoneSelect = (phone) => {
    const newSelected = [...selectedPhones];
    if (selectorSlot !== null && selectorSlot < newSelected.length) {
      newSelected[selectorSlot] = phone;
    } else if (newSelected.length < 4 && !newSelected.find(p => p.id === phone.id)) {
      newSelected.push(phone);
    }
    setSelectedPhones(newSelected);
    setShowSelector(false);
  };

  const removePhone = (index, e) => {
    e.stopPropagation();
    setSelectedPhones(selectedPhones.filter((_, i) => i !== index));
  };

  const selectorPhones = phones.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVote = async (phoneId) => {
    if (!user) { signIn(); return; }
    setVotingId(phoneId);
    try {
      const voteRef = doc(db, 'userVotes', user.uid, 'phones', phoneId);
      const phoneRef = doc(db, 'phones', phoneId);
      const voteSnap = await getDoc(voteRef);
      if (voteSnap.exists()) {
        await deleteDoc(voteRef);
        await updateDoc(phoneRef, { voteCount: increment(-1) });
      } else {
        await setDoc(voteRef, { votedAt: serverTimestamp() });
        await updateDoc(phoneRef, { voteCount: increment(1) });
      }
    } finally {
      setVotingId(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !reviewPhoneId) return;
    const hasRating = REVIEW_CATEGORIES.some(c => reviewForm[c.id] > 0);
    if (!hasRating) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'phones', reviewPhoneId, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        ...Object.fromEntries(REVIEW_CATEGORIES.map(c => [c.id, reviewForm[c.id]])),
        text: reviewForm.text,
        createdAt: serverTimestamp(),
      });
      setReviewForm({ camera: 0, design: 0, battery: 0, performance: 0, cospa: 0, text: '' });
      setShowReviewForm(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user || !reviewPhoneId) return;
    await deleteDoc(doc(db, 'phones', reviewPhoneId, 'reviews', reviewId));
  };

  const handleLike = async () => {
    if (!user) { signIn(); return; }
    const likeRef = doc(db, 'phones', reviewPhoneId, 'likes', user.uid);
    if (userLikes.has(reviewPhoneId)) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
    }
  };

  const fetchAiReview = useCallback(async () => {
    if (!reviewPhone) return;
    setAiLoading(true);
    setAiReview('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'あなたはスマートフォンの専門レビュアーです。与えられた機種情報をもとに、日本語で簡潔にレビューを書いてください。特徴、長所、短所をそれぞれ2-3点ずつ挙げてください。300文字以内で。',
          messages: [{
            role: 'user',
            content: `${reviewPhone.name} (${reviewPhone.brand}, ${reviewPhone.releaseYear}年) のレビューを書いてください。スペック: CPU=${reviewPhone.specs?.cpu}, RAM=${reviewPhone.specs?.ram}, カメラ=${reviewPhone.specs?.camera}, バッテリー=${reviewPhone.specs?.battery}, ディスプレイ=${reviewPhone.specs?.display}, 価格=¥${(reviewPhone.price || 0).toLocaleString()}, カテゴリ=${reviewPhone.category}`
          }],
        }),
      });
      const data = await res.json();
      setAiReview(data.content?.[0]?.text || 'レビューを生成できませんでした。');
    } catch {
      setAiReview('レビュー生成に失敗しました。');
    } finally {
      setAiLoading(false);
    }
  }, [reviewPhone]);

  // Auto-fetch Reddit reviews when phone changes
  // サーバーレスプロキシ経由（old.reddit.comでブロック回避）
  useEffect(() => {
    if (!reviewPhoneId || phones.length === 0) return;
    const phone = phones.find(p => p.id === reviewPhoneId);
    if (!phone) return;

    setRedditPosts([]);
    setRedditError(false);
    setRedditLoading(true);
    let cancelled = false;

    const fetchReddit = async () => {
      try {
        const res = await fetch(`/api/reddit?q=${encodeURIComponent(phone.name)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRedditPosts(data.posts || []);
      } catch (err) {
        console.error('Reddit fetch error:', err);
        if (!cancelled) setRedditError(true);
      } finally {
        if (!cancelled) setRedditLoading(false);
      }
    };

    fetchReddit();
    return () => { cancelled = true; };
  }, [reviewPhoneId, phones]);

  // Auto-translate Reddit posts to Japanese
  useEffect(() => {
    if (redditPosts.length === 0) return;
    let cancelled = false;

    const translateAll = async () => {
      for (const post of redditPosts) {
        if (cancelled) break;
        try {
          const text = (post.title + '. ' + (post.selftext || '').slice(0, 400)).slice(0, 500);
          const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja`
          );
          const data = await res.json();
          if (!cancelled && data?.responseData?.translatedText) {
            setRedditTranslations(prev => ({
              ...prev,
              [post.id]: data.responseData.translatedText,
            }));
          }
        } catch (err) {
          console.error('Translation error:', err);
        }
      }
    };

    translateAll();
    return () => { cancelled = true; };
  }, [redditPosts]);

  const toggleYouTube = (id) => {
    setExpandedYouTube(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  const rankClass = (i) => ['rank-gold', 'rank-silver', 'rank-bronze'][i] || 'rank-other';

  if (loading) {
    return <div className="compare-screen"><h2 className="compare-title">⚖ Compare</h2><p style={{ color: '#555', textAlign: 'center' }}>読み込み中...</p></div>;
  }

  return (
    <div className="compare-screen">
      <h2 className="compare-title">⚖ Compare</h2>

      <div className="sec-tabs">
        {[{ id: 'ranking', label: '🏆 ランキング' }, { id: 'compare', label: '⚖ 機種比較' }, { id: 'reviews', label: '💬 レビュー' }].map(s => (
          <button key={s.id} className={`sec-tab ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>{s.label}</button>
        ))}
      </div>

      {/* ═══ RANKING ═══ */}
      {activeSection === 'ranking' && (
        <div>
          <div className="rank-type-tabs">
            {RANK_TYPES.map(t => (
              <button key={t.id} className={`rank-tab ${activeRankType === t.id ? 'active' : ''}`} onClick={() => setActiveRankType(t.id)}>{t.label}</button>
            ))}
          </div>

          <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? '▲ フィルターを閉じる' : '▼ フィルター'}
          </button>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-row">
                <label className="filter-label">カテゴリ</label>
                <div className="filter-options">
                  {[{ id: 'all', label: '全て' }, { id: 'flagship', label: 'フラッグシップ' }, { id: 'midrange', label: 'ミドルレンジ' }, { id: 'budget', label: 'バジェット' }].map(c => (
                    <button key={c.id} className={`filter-btn ${filterCategory === c.id ? 'active' : ''}`} onClick={() => setFilterCategory(c.id)}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div className="filter-row">
                <label className="filter-label">メーカー</label>
                <select className="filter-select" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
                  {brands.map(b => <option key={b} value={b}>{b === 'all' ? '全メーカー' : b}</option>)}
                </select>
              </div>
              <div className="filter-row">
                <label className="filter-label">価格帯</label>
                <div className="filter-options">
                  {PRICE_RANGES.map(r => (
                    <button key={r.id} className={`filter-btn ${filterPrice === r.id ? 'active' : ''}`} onClick={() => setFilterPrice(r.id)}>{r.label}</button>
                  ))}
                </div>
              </div>
              <div className="filter-row">
                <label className="filter-label">年式</label>
                <div className="filter-options">
                  {YEAR_OPTIONS.map(y => (
                    <button key={y.id} className={`filter-btn ${filterYear === y.id ? 'active' : ''}`} onClick={() => setFilterYear(y.id)}>{y.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="rank-count">{filteredRanking.length}機種表示</div>

          {filteredRanking.map((phone, i) => (
            <div key={phone.id} className="rank-item">
              <div className={`rank-num ${rankClass(i)}`}>{i + 1}</div>
              <div className="rank-info" onClick={() => { setReviewPhoneId(phone.id); setActiveSection('reviews'); }}>
                <div className="rank-name">{phone.name}</div>
                <div className="rank-maker">{phone.brand} · {phone.releaseYear} · ¥{(phone.price || 0).toLocaleString()}</div>
                <span className={`rank-category cat-${phone.category}`}>{phone.category}</span>
              </div>
              <div className="rank-score-wrap">
                <div className="rank-score">{getScore(phone, activeRankType)}</div>
                <div className="rank-score-label">{activeRankType === 'votes' ? 'VOTES' : activeRankType === 'cospa' ? 'COSPA' : 'SCORE'}</div>
                {activeRankType !== 'votes' && (
                  <div className="score-bar"><div className="score-fill" style={{ width: `${Math.min(getScore(phone, activeRankType), 100)}%` }} /></div>
                )}
              </div>
              {activeRankType === 'votes' && (
                <button
                  className={`vote-btn ${userVotes.has(phone.id) ? 'voted' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleVote(phone.id); }}
                  disabled={votingId === phone.id}
                >
                  {votingId === phone.id ? '...' : userVotes.has(phone.id) ? '✓' : '🗳'}
                </button>
              )}
            </div>
          ))}
          {filteredRanking.length === 0 && <p className="no-result">条件に一致する機種がありません</p>}
        </div>
      )}

      {/* ═══ COMPARE ═══ */}
      {activeSection === 'compare' && (
        <div>
          <p className="compare-hint">最大4機種を選択して比較（緑が最強項目）</p>
          <div className="compare-slots">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`compare-slot ${selectedPhones[i] ? 'filled' : 'empty'}`} onClick={() => handleSlotClick(i)}>
                {selectedPhones[i] ? (
                  <>
                    <button className="slot-remove" onClick={(e) => removePhone(i, e)}>×</button>
                    <div className="slot-emoji">📱</div>
                    <div className="slot-name">{selectedPhones[i].name}</div>
                    <div className="slot-maker">{selectedPhones[i].brand}</div>
                  </>
                ) : (
                  <>
                    <div className="slot-add">＋</div>
                    <div className="slot-empty-text">機種を追加</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {selectedPhones.length >= 2 && (
            <div className="spec-table-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    {selectedPhones.map(p => <th key={p.id}>{p.name.split(' ').slice(-2).join(' ')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map(row => {
                    const vals = selectedPhones.map(p => getSpecValue(p, row));
                    const best = row.isScore ? Math.max(...vals.map(Number)) : null;
                    return (
                      <tr key={row.label}>
                        <td className="spec-label">{row.label}</td>
                        {selectedPhones.map((p) => {
                          const val = getSpecValue(p, row);
                          const isBest = row.isScore && Number(val) === best;
                          return <td key={p.id} className={isBest ? 'spec-best' : ''}>{val}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ REVIEWS ═══ */}
      {activeSection === 'reviews' && reviewPhone && (
        <div>
          <select className="review-select" value={reviewPhoneId} onChange={e => setReviewPhoneId(e.target.value)}>
            {phones.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand} ({p.releaseYear})</option>)}
          </select>

          <div className="review-phone-header">
            <div className="review-phone-top">
              <div className="review-phone-name">{reviewPhone.name}</div>
              <div className="review-like-wrap">
                <button className={`like-btn ${userLikes.has(reviewPhoneId) ? 'liked' : ''}`} onClick={handleLike}>
                  {userLikes.has(reviewPhoneId) ? '♥' : '♡'} {likes[reviewPhoneId] || 0}
                </button>
              </div>
            </div>
            <div className="review-score-badges">
              {RANK_TYPES.filter(t => t.id !== 'votes').map(t => (
                <div key={t.id} className="rsb">
                  <span className="rsb-label">{t.label}</span>
                  <span className="rsb-score">{getScore(reviewPhone, t.id)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spec detail button */}
          <div className="spec-detail-actions">
            <button className="spec-detail-btn" onClick={() => setShowSpecModal(true)}>📋 スペック詳細を見る</button>
          </div>

          {/* AI Review */}
          <div className="ai-review-section">
            <button className="ai-review-btn" onClick={fetchAiReview} disabled={aiLoading}>
              {aiLoading ? '生成中...' : '🐆 AIレビューを見る'}
            </button>
            {aiReview && (
              <div className="ai-review-card">
                <div className="ai-review-badge">LEX AI Review</div>
                <div className="ai-review-text">{aiReview}</div>
              </div>
            )}
          </div>

          {/* Influencer reviews */}
          {influencerReviews.length > 0 && (
            <div>
              <div className="reviews-section-title">🎬 インフルエンサーレビュー</div>
              {influencerReviews.map(r => {
                const ytId = getYouTubeId(r.url);
                const isExpanded = expandedYouTube.has(r.id);
                return (
                  <div key={r.id} className="review-card influencer-review-card">
                    <div className="influencer-header">
                      {r.avatarUrl && <img src={r.avatarUrl} alt="" className="influencer-avatar" />}
                      <div className="influencer-info">
                        <div className="influencer-name">{r.name}</div>
                        <div className="influencer-channel">{r.platform || 'YouTube'} · {r.subscribers || ''}</div>
                      </div>
                      <div className="influencer-rating">{r.rating}/10</div>
                    </div>
                    <div className="review-text">{r.summary}</div>
                    {ytId && (
                      <>
                        <button className="yt-toggle-btn" onClick={() => toggleYouTube(r.id)}>
                          {isExpanded ? '▲ 動画を閉じる' : '▶ 動画を再生'}
                        </button>
                        {isExpanded && (
                          <div className="yt-embed-wrap">
                            <iframe
                              className="yt-embed"
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={r.name}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Reddit consumer reviews */}
          <div className="reddit-section">
            <div className="reviews-section-title">🔍 消費者レビュー（Reddit）</div>
            {redditLoading ? (
              <p className="reddit-loading">Redditから取得中...</p>
            ) : redditPosts.length > 0 ? (
              <div className="reddit-posts">
                {redditPosts.map(p => (
                  <div key={p.id} className="reddit-post expanded">
                    <div className="reddit-post-header">
                      <span className="reddit-sub">r/{p.subreddit}</span>
                      <span className="reddit-score">▲ {p.score}</span>
                    </div>
                    {redditTranslations[p.id] ? (
                      <>
                        <div className="reddit-post-title">{redditTranslations[p.id]}</div>
                        <div className="reddit-original-title">原文: {p.title}</div>
                      </>
                    ) : (
                      <>
                        <div className="reddit-post-title">{p.title}</div>
                        <div className="reddit-translating">🌐 翻訳中...</div>
                      </>
                    )}
                    {p.selftext && (
                      <div className="reddit-post-text reddit-text-expanded">
                        {p.selftext}
                      </div>
                    )}
                    <div className="reddit-post-meta">
                      {p.numComments} comments · u/{p.author}
                    </div>
                  </div>
                ))}
              </div>
            ) : redditError ? (
              <p className="no-result">Redditの取得に失敗しました。しばらくしてから再度お試しください。</p>
            ) : (
              <p className="no-result">関連するReddit投稿が見つかりませんでした</p>
            )}
          </div>

          {/* User review averages */}
          {avgReviewScores && (
            <div className="user-avg-section">
              <div className="reviews-section-title">⭐ ユーザー評価（{userReviews.length}件）</div>
              <div className="avg-grid">
                {REVIEW_CATEGORIES.map(c => (
                  <div key={c.id} className="avg-item">
                    <span className="avg-label">{c.label}</span>
                    <span className="avg-score">{avgReviewScores[c.id]}</span>
                    <div className="avg-bar"><div className="avg-fill" style={{ width: `${(avgReviewScores[c.id] / 5) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write review */}
          {!showReviewForm ? (
            <button className="write-review-btn" onClick={() => { if (!user) { signIn(); return; } setShowReviewForm(true); }}>
              レビューを書く
            </button>
          ) : (
            <div className="review-form">
              <div className="review-form-title">レビューを投稿</div>
              {REVIEW_CATEGORIES.map(c => (
                <div key={c.id} className="review-form-row">
                  <span className="review-form-label">{c.label}</span>
                  <Stars count={reviewForm[c.id]} interactive onRate={(n) => setReviewForm(prev => ({ ...prev, [c.id]: n }))} />
                </div>
              ))}
              <textarea
                className="review-form-text"
                placeholder="コメント（任意）"
                value={reviewForm.text}
                onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                rows={3}
              />
              <div className="review-form-actions">
                <button className="review-submit-btn" onClick={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? '送信中...' : '投稿する'}
                </button>
                <button className="review-cancel-btn" onClick={() => setShowReviewForm(false)}>キャンセル</button>
              </div>
            </div>
          )}

          {/* User reviews list */}
          {userReviews.length > 0 && (
            <div>
              <div className="reviews-section-title">📝 ユーザーレビュー</div>
              {userReviews.map(r => (
                <div key={r.id} className="review-card user-review-card">
                  <div className="user-review-header">
                    <div className="user-review-user">
                      {r.userPhoto && <img src={r.userPhoto} alt="" className="user-review-avatar" />}
                      <span className="user-review-name">{r.userName}</span>
                    </div>
                    {user?.uid === r.userId && (
                      <button className="user-review-delete" onClick={() => handleDeleteReview(r.id)}>削除</button>
                    )}
                  </div>
                  <div className="user-review-scores">
                    {REVIEW_CATEGORIES.map(c => (
                      <span key={c.id} className="user-review-score-item">
                        {c.label}: {'★'.repeat(r[c.id] || 0)}{'☆'.repeat(5 - (r[c.id] || 0))}
                      </span>
                    ))}
                  </div>
                  {r.text && <div className="review-text">{r.text}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SPEC DETAIL MODAL ═══ */}
      {showSpecModal && reviewPhone && (
        <div className="selector-overlay" onClick={() => setShowSpecModal(false)}>
          <div className="spec-modal" onClick={e => e.stopPropagation()}>
            <div className="spec-modal-header">
              <span>{reviewPhone.name} スペック詳細</span>
              <button className="selector-close" onClick={() => setShowSpecModal(false)}>×</button>
            </div>
            <div className="spec-modal-body">
              <table className="spec-modal-table">
                <tbody>
                  {[
                    { label: 'メーカー', value: reviewPhone.brand },
                    { label: 'カテゴリ', value: reviewPhone.category },
                    { label: '発売年', value: reviewPhone.releaseYear },
                    { label: '価格', value: `¥${(reviewPhone.price || 0).toLocaleString()}` },
                    { label: 'チップ', value: reviewPhone.specs?.cpu },
                    { label: 'RAM', value: reviewPhone.specs?.ram },
                    { label: 'ストレージ', value: reviewPhone.specs?.storage },
                    { label: 'カメラ', value: reviewPhone.specs?.camera },
                    { label: 'バッテリー', value: reviewPhone.specs?.battery },
                    { label: 'ディスプレイ', value: reviewPhone.specs?.display },
                    { label: '充電速度', value: reviewPhone.charge },
                    { label: '重量', value: reviewPhone.weight },
                    { label: '総合スコア', value: reviewPhone.scores?.overall },
                    { label: 'パフォーマンス', value: reviewPhone.scores?.fps },
                    { label: 'カメラスコア', value: reviewPhone.scores?.camera },
                    { label: 'バッテリースコア', value: reviewPhone.scores?.battery },
                    { label: 'コスパスコア', value: cospaScore(reviewPhone) },
                  ].map(row => (
                    <tr key={row.label}>
                      <td className="spec-modal-label">{row.label}</td>
                      <td className="spec-modal-value">{row.value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PHONE SELECTOR MODAL ═══ */}
      {showSelector && (
        <div className="selector-overlay" onClick={() => setShowSelector(false)}>
          <div className="selector-modal" onClick={e => e.stopPropagation()}>
            <div className="selector-header">
              <span>機種を選択</span>
              <button className="selector-close" onClick={() => setShowSelector(false)}>×</button>
            </div>
            <input
              className="selector-search"
              type="text"
              placeholder="機種名・メーカーで検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="selector-list">
              {selectorPhones.map(phone => {
                const alreadySelected = selectedPhones.find(p => p.id === phone.id);
                return (
                  <div key={phone.id} className={`selector-item ${alreadySelected ? 'already-selected' : ''}`} onClick={() => !alreadySelected && handlePhoneSelect(phone)}>
                    <div>
                      <div className="selector-item-name">{phone.name}</div>
                      <div className="selector-item-meta">{phone.brand} · {phone.releaseYear} · ¥{(phone.price || 0).toLocaleString()}</div>
                    </div>
                    <div className="selector-item-score">{phone.scores?.overall}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareScreen;
