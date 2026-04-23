import React, { useState, useMemo } from 'react';
import './CompareScreen.css';

const PHONES = [
  const PHONES = [
  // ── 2026 ──
  { id: 's26u', name: 'Galaxy S26 Ultra', maker: 'Samsung', year: 2026, chip: 'SD 8 Elite Gen5', ram: '12GB', camera: '320MP', battery: '5000mAh', charge: '60W', display: '6.9" AMOLED', weight: '220g', price: '¥199,800', scores: { overall: 98, fps: 98, camera: 99, battery: 95 } },
  { id: 's26p', name: 'Galaxy S26+', maker: 'Samsung', year: 2026, chip: 'SD 8 Elite Gen5', ram: '12GB', camera: '50MP', battery: '5000mAh', charge: '45W', display: '6.7" AMOLED', weight: '195g', price: '¥169,800', scores: { overall: 93, fps: 96, camera: 91, battery: 93 } },
  { id: 's26', name: 'Galaxy S26', maker: 'Samsung', year: 2026, chip: 'SD 8 Elite Gen5', ram: '12GB', camera: '50MP', battery: '4200mAh', charge: '45W', display: '6.2" AMOLED', weight: '165g', price: '¥134,800', scores: { overall: 90, fps: 94, camera: 88, battery: 87 } },
  { id: 'xi17u', name: 'Xiaomi 17 Ultra', maker: 'Xiaomi', year: 2026, chip: 'SD 8 Elite Gen5', ram: '16GB', camera: 'Leica 1inch 50MP', battery: '6200mAh', charge: '100W', display: '6.73" AMOLED', weight: '235g', price: '¥159,800', scores: { overall: 99, fps: 97, camera: 100, battery: 99 } },
  { id: 'xi17', name: 'Xiaomi 17', maker: 'Xiaomi', year: 2026, chip: 'SD 8 Elite Gen5', ram: '12GB', camera: 'Leica 50MP', battery: '5500mAh', charge: '90W', display: '6.55" AMOLED', weight: '198g', price: '¥109,800', scores: { overall: 93, fps: 95, camera: 95, battery: 96 } },
  { id: 'op15', name: 'OnePlus 15', maker: 'OnePlus', year: 2026, chip: 'SD 8 Elite Gen5', ram: '12GB', camera: 'Hasselblad 50MP', battery: '6500mAh', charge: '100W', display: '6.82" AMOLED', weight: '213g', price: '¥109,800', scores: { overall: 92, fps: 96, camera: 90, battery: 99 } },
  // ── 2025 ──
  { id: 's25u', name: 'Galaxy S25 Ultra', maker: 'Samsung', year: 2025, chip: 'SD 8 Elite', ram: '12GB', camera: '200MP', battery: '5000mAh', charge: '45W', display: '6.9" AMOLED', weight: '218g', price: '¥189,800', scores: { overall: 96, fps: 97, camera: 97, battery: 94 } },
  { id: 's25p', name: 'Galaxy S25+', maker: 'Samsung', year: 2025, chip: 'SD 8 Elite', ram: '12GB', camera: '50MP', battery: '4900mAh', charge: '45W', display: '6.7" AMOLED', weight: '190g', price: '¥159,800', scores: { overall: 91, fps: 95, camera: 90, battery: 92 } },
  { id: 'xi15u', name: 'Xiaomi 15 Ultra', maker: 'Xiaomi', year: 2025, chip: 'SD 8 Elite', ram: '16GB', camera: 'Leica 50MP', battery: '6000mAh', charge: '90W', display: '6.73" AMOLED', weight: '233g', price: '¥149,800', scores: { overall: 97, fps: 96, camera: 99, battery: 98 } },
  { id: 'xi15p', name: 'Xiaomi 15 Pro', maker: 'Xiaomi', year: 2025, chip: 'SD 8 Elite', ram: '12GB', camera: 'Leica 50MP', battery: '6100mAh', charge: '90W', display: '6.73" AMOLED', weight: '218g', price: '¥129,800', scores: { overall: 94, fps: 95, camera: 96, battery: 97 } },
  { id: 'op13', name: 'OnePlus 13', maker: 'OnePlus', year: 2025, chip: 'SD 8 Elite', ram: '12GB', camera: 'Hasselblad 50MP', battery: '6000mAh', charge: '100W', display: '6.82" AMOLED', weight: '210g', price: '¥99,800', scores: { overall: 90, fps: 95, camera: 88, battery: 97 } },
  // ── 2024 ──
  { id: 'ip16pm', name: 'iPhone 16 Pro Max', maker: 'Apple', year: 2024, chip: 'A18 Pro', ram: '8GB', camera: '48MP', battery: '4685mAh', charge: '30W', display: '6.9" OLED', weight: '227g', price: '¥198,800', scores: { overall: 95, fps: 99, camera: 96, battery: 88 } },
  { id: 'ip16p', name: 'iPhone 16 Pro', maker: 'Apple', year: 2024, chip: 'A18 Pro', ram: '8GB', camera: '48MP', battery: '3582mAh', charge: '27W', display: '6.3" OLED', weight: '199g', price: '¥159,800', scores: { overall: 93, fps: 98, camera: 95, battery: 83 } },
  { id: 'ip16', name: 'iPhone 16', maker: 'Apple', year: 2024, chip: 'A18', ram: '8GB', camera: '48MP', battery: '3561mAh', charge: '25W', display: '6.1" OLED', weight: '170g', price: '¥124,800', scores: { overall: 88, fps: 94, camera: 88, battery: 80 } },
  { id: 'p9pxl', name: 'Pixel 9 Pro XL', maker: 'Google', year: 2024, chip: 'Tensor G4', ram: '16GB', camera: '50MP', battery: '5060mAh', charge: '37W', display: '6.8" OLED', weight: '221g', price: '¥179,800', scores: { overall: 92, fps: 89, camera: 95, battery: 93 } },
  { id: 'p9p', name: 'Pixel 9 Pro', maker: 'Google', year: 2024, chip: 'Tensor G4', ram: '16GB', camera: '50MP', battery: '4700mAh', charge: '37W', display: '6.3" OLED', weight: '221g', price: '¥159,800', scores: { overall: 91, fps: 89, camera: 95, battery: 90 } },
  { id: 'p9', name: 'Pixel 9', maker: 'Google', year: 2024, chip: 'Tensor G4', ram: '12GB', camera: '50MP', battery: '4700mAh', charge: '27W', display: '6.3" OLED', weight: '198g', price: '¥128,900', scores: { overall: 87, fps: 86, camera: 92, battery: 89 } },
  { id: 'xi14u', name: 'Xiaomi 14 Ultra', maker: 'Xiaomi', year: 2024, chip: 'SD 8 Gen 3', ram: '16GB', camera: 'Leica 50MP', battery: '5000mAh', charge: '90W', display: '6.73" AMOLED', weight: '229g', price: '¥139,800', scores: { overall: 93, fps: 94, camera: 98, battery: 93 } },
  { id: 'xi14tp', name: 'Xiaomi 14T Pro', maker: 'Xiaomi', year: 2024, chip: 'Dimensity 9300+', ram: '12GB', camera: 'Leica 50MP', battery: '5000mAh', charge: '120W', display: '6.67" AMOLED', weight: '209g', price: '¥89,800', scores: { overall: 88, fps: 91, camera: 90, battery: 94 } },
  { id: 'op12', name: 'OnePlus 12', maker: 'OnePlus', year: 2024, chip: 'SD 8 Gen 3', ram: '12GB', camera: 'Hasselblad 50MP', battery: '5400mAh', charge: '100W', display: '6.82" AMOLED', weight: '220g', price: '¥89,800', scores: { overall: 88, fps: 93, camera: 85, battery: 95 } },
  { id: 'xp1vi', name: 'Xperia 1 VI', maker: 'Sony', year: 2024, chip: 'SD 8 Gen 3', ram: '12GB', camera: '52MP', battery: '5000mAh', charge: '30W', display: '6.5" OLED', weight: '192g', price: '¥189,800', scores: { overall: 87, fps: 90, camera: 91, battery: 89 } },
  { id: 'zfold6', name: 'Galaxy Z Fold 6', maker: 'Samsung', year: 2024, chip: 'SD 8 Gen 3', ram: '12GB', camera: '50MP', battery: '4400mAh', charge: '25W', display: '7.6" Foldable', weight: '239g', price: '¥239,800', scores: { overall: 89, fps: 93, camera: 88, battery: 82 } },
];
];

const RANK_TYPES = [
  { id: 'overall', label: '総合' },
  { id: 'fps', label: 'FPS・ゲーム' },
  { id: 'camera', label: 'カメラ' },
  { id: 'battery', label: 'バッテリー' },
];

const SPEC_ROWS = [
  { label: 'チップ', key: 'chip' },
  { label: 'RAM', key: 'ram' },
  { label: 'カメラ', key: 'camera' },
  { label: 'バッテリー', key: 'battery' },
  { label: '充電速度', key: 'charge' },
  { label: 'ディスプレイ', key: 'display' },
  { label: '重量', key: 'weight' },
  { label: '価格', key: 'price' },
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

const CompareScreen = () => {
  const [activeSection, setActiveSection] = useState('ranking');
  const [activeRankType, setActiveRankType] = useState('overall');
  const [selectedPhones, setSelectedPhones] = useState([PHONES[0], PHONES[4], PHONES[11]]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorSlot, setSelectorSlot] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewPhoneId, setReviewPhoneId] = useState('s25u');

  const sortedRanking = useMemo(() =>
    [...PHONES].sort((a, b) => b.scores[activeRankType] - a.scores[activeRankType]).slice(0, 10),
    [activeRankType]
  );

  const reviewPhone = PHONES.find(p => p.id === reviewPhoneId) || PHONES[0];
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

  const filteredPhones = PHONES.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.maker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rankClass = (i) => ['rank-gold', 'rank-silver', 'rank-bronze', 'rank-other'][i] || 'rank-other';

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
                <div className="rank-maker">{phone.maker} · {phone.year}</div>
              </div>
              <div className="rank-score-wrap">
                <div className="rank-score">{phone.scores[activeRankType]}</div>
                <div className="rank-score-label">SCORE</div>
                <div className="score-bar"><div className="score-fill" style={{ width: `${phone.scores[activeRankType]}%` }} /></div>
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
                    <div className="slot-maker">{selectedPhones[i].maker}</div>
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
                    const vals = selectedPhones.map(p => row.isScore ? p.scores[row.key] : p[row.key]);
                    const best = row.isScore ? Math.max(...vals.map(Number)) : null;
                    return (
                      <tr key={row.label}>
                        <td className="spec-label">{row.label}</td>
                        {selectedPhones.map((p, i) => {
                          const val = row.isScore ? p.scores[row.key] : p[row.key];
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

      {activeSection === 'reviews' && (
        <div>
          <select className="review-select" value={reviewPhoneId} onChange={e => setReviewPhoneId(e.target.value)}>
            {PHONES.map(p => <option key={p.id} value={p.id}>{p.name} — {p.maker} ({p.year})</option>)}
          </select>

          <div className="review-phone-header">
            <div className="review-phone-name">{reviewPhone.name}</div>
            <div className="review-score-badges">
              {RANK_TYPES.map(t => (
                <div key={t.id} className="rsb">
                  <span className="rsb-label">{t.label}</span>
                  <span className="rsb-score">{reviewPhone.scores[t.id]}</span>
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
                      <div className="selector-item-meta">{phone.maker} · {phone.year} · {phone.price}</div>
                    </div>
                    <div className="selector-item-score">{phone.scores.overall}</div>
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
