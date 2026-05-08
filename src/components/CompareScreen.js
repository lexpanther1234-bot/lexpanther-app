import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './CompareScreen.css';

const RANK_TYPES = [
  { id: 'overall', label: '総合' },
  { id: 'fps', label: 'FPS・ゲーム' },
  { id: 'camera', label: 'カメラ' },
  { id: 'battery', label: 'バッテリー' },
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
  { label: 'ゲームスコア', key: 'fps', isScore: true },
  { label: 'カメラスコア', key: 'camera', isScore: true },
  { label: 'バッテリースコア', key: 'battery', isScore: true },
];

const REVIEWS = {
  's25u': [
    { source: 'MKBHD — YouTube', text: 'カメラの完成度が高く望遠性能は他機種を圧倒。S Pen搭載で生産性も抜群。', stars: 4, type: 'influencer' },
    { source: 'Dave2D — YouTube', text: 'デザインが洗練されており処理速度も文句なし。価格は高いが価値はある。', stars: 5, type: 'influencer' },
    { source: 'r/Android — u/TechFan2025', text: 'AIツールが想像以上に実用的。サークル検索とライブ翻訳が特に良い。', stars: 5, type: 'reddit' },
    { source: 'r/Samsung — u/GalaxyUser', text: 'S Penが廃止されなくて本当に良かった。ノート取りに欠かせない。', stars: 4, type: 'reddit' },
  ],
  'ip16pm': [
    { source: 'MrMobile — YouTube', text: '動画撮影において圧倒的。Log撮影対応で映像クリエイターには最高の選択肢。', stars: 5, type: 'influencer' },
    { source: 'SuperSaf TV — YouTube', text: 'カメラコントロールボタンが思ったより便利。iOSのエコシステムは最強。', stars: 4, type: 'influencer' },
    { source: 'r/iPhone — u/iOSFan', text: 'カメラ品質は本当に別格。特に動画のシネマティックモードが素晴らしい。', stars: 5, type: 'reddit' },
  ],
  'xi15u': [
    { source: 'SuperSaf TV — YouTube', text: 'Leica監修カメラが圧倒的。6000mAhバッテリーで2日持ちも達成。', stars: 5, type: 'influencer' },
    { source: 'r/Xiaomi — u/XiaomiFan', text: '価格対性能比が最高。カメラはiPhoneを超えている部分も多い。', stars: 5, type: 'reddit' },
  ],
};

const getReviews = (id) => REVIEWS[id] || [
  { source: 'GSMArena', text: '総合的に高いパフォーマンスを発揮。日常使いには十分すぎる性能。', stars: 4, type: 'influencer' },
  { source: 'r/Android', text: 'コストパフォーマンスが良く満足している。', stars: 4, type: 'reddit' },
];

const Stars = ({ count }) => (
  <div className="review-stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={i <= count ? 'star' : 'star-empty'}>★</span>
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
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('ranking');
  const [activeRankType, setActiveRankType] = useState('overall');
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorSlot, setSelectorSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewPhoneId, setReviewPhoneId] = useState('s25u');

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

  const sortedRanking = useMemo(() =>
    [...phones].sort((a, b) => (b.scores?.[activeRankType] || 0) - (a.scores?.[activeRankType] || 0)).slice(0, 10),
    [activeRankType, phones]
  );

  const reviewPhone = phones.find(p => p.id === reviewPhoneId) || phones[0];
  const reviews = getReviews(reviewPhoneId);

  const handleSlotClick = (index) => {
    setSelectorSlot(index);
    setShowSelector(true);
    setSearchQuery('');
  };

  const handlePhoneSelect = (phone) => {
    const newSelected = [...selectedPhones];
    if (selectorSlot !== null && selectorSlot < newSelected.length) {
      newSelected[selectorSlot] = phone;
    } else {
      if (newSelected.length < 4 && !newSelected.find(p => p.id === phone.id)) {
        newSelected.push(phone);
      }
    }
    setSelectedPhones(newSelected);
    setShowSelector(false);
  };

  const removePhone = (index, e) => {
    e.stopPropagation();
    setSelectedPhones(selectedPhones.filter((_, i) => i !== index));
  };

  const filteredPhones = phones.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rankClass = (i) => ['rank-gold', 'rank-silver', 'rank-bronze', 'rank-other'][i] || 'rank-other';

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

      {activeSection === 'ranking' && (
        <div>
          <div className="rank-type-tabs">
            {RANK_TYPES.map(t => (
              <button key={t.id} className={`rank-tab ${activeRankType === t.id ? 'active' : ''}`} onClick={() => setActiveRankType(t.id)}>{t.label}</button>
            ))}
          </div>
          {sortedRanking.map((phone, i) => (
            <div key={phone.id} className="rank-item" onClick={() => { setReviewPhoneId(phone.id); setActiveSection('reviews'); }}>
              <div className={`rank-num ${rankClass(i)}`}>{i + 1}</div>
              <div className="rank-info">
                <div className="rank-name">{phone.name}</div>
                <div className="rank-maker">{phone.brand} · {phone.releaseYear}</div>
              </div>
              <div className="rank-score-wrap">
                <div className="rank-score">{phone.scores?.[activeRankType]}</div>
                <div className="rank-score-label">SCORE</div>
                <div className="score-bar"><div className="score-fill" style={{ width: `${phone.scores?.[activeRankType] || 0}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                        {selectedPhones.map((p, i) => {
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

      {activeSection === 'reviews' && reviewPhone && (
        <div>
          <select className="review-select" value={reviewPhoneId} onChange={e => setReviewPhoneId(e.target.value)}>
            {phones.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand} ({p.releaseYear})</option>)}
          </select>

          <div className="review-phone-header">
            <div className="review-phone-name">{reviewPhone.name}</div>
            <div className="review-score-badges">
              {RANK_TYPES.map(t => (
                <div key={t.id} className="rsb">
                  <span className="rsb-label">{t.label}</span>
                  <span className="rsb-score">{reviewPhone.scores?.[t.id]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reviews-section-title">📺 インフルエンサーレビュー</div>
          {reviews.filter(r => r.type === 'influencer').map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-source">{r.source}</div>
              <div className="review-text">{r.text}</div>
              <Stars count={r.stars} />
            </div>
          ))}

          <div className="reviews-section-title">🌍 消費者レビュー（Reddit）</div>
          {reviews.filter(r => r.type === 'reddit').map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-source">{r.source}</div>
              <div className="review-text">{r.text}</div>
              <Stars count={r.stars} />
            </div>
          ))}
        </div>
      )}

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
              {filteredPhones.map(phone => {
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
