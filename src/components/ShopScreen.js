import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './ShopScreen.css';

const OPTION_CASE_PRICE = 500;
const OPTION_GLASS_PRICE = 500;

const ShopScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // 新しいstate
  const [view, setView] = useState('top');        // 'top' | 'brand' | 'detail'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [saleTimeLeft, setSaleTimeLeft] = useState('');
  const [aiRecommends, setAiRecommends] = useState([]);
  const [aiRecLoading, setAiRecLoading] = useState(false);

  // Firestore phones購読
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      setPhones(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          brand: data.brand || '',
          maker: data.brand || '',
          price: data.price || 0,
          type: 'phone',
          emoji: '📱',
          image: data.image || '',
          spec: `${data.specs?.display || ''} / ${data.specs?.cpu || ''} / ${data.specs?.camera || ''}`,
          specs: data.specs || {},
          url: data.shopUrl || '',
          releaseYear: data.releaseYear || 0,
          stock: data.stock || 0,
          hasCase: data.hasCase || false,
          hasGlass: data.hasGlass || false,
          tecApproved: data.tecApproved !== false,
          isNew: data.isNew || false,
          isSale: data.isSale || false,
          salePrice: data.salePrice || 0,
          saleUntil: data.saleUntil || null,
          weeklyViews: data.weeklyViews || 0,
          category: data.category || '',
        };
      }));
    });
    return () => unsub();
  }, []);

  // カート購読
  useEffect(() => {
    if (!user) { setCartItems([]); return; }
    const ref = collection(db, 'carts', user.uid, 'items');
    const unsub = onSnapshot(ref, (snap) => {
      setCartItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // ── 派生データ ──
  const rankingPhones = useMemo(() =>
    [...phones].sort((a, b) => (b.weeklyViews || 0) - (a.weeklyViews || 0)).slice(0, 5),
    [phones]
  );

  const salePhones = useMemo(() =>
    phones.filter(p => p.isSale && p.salePrice > 0),
    [phones]
  );

  const newPhones = useMemo(() =>
    phones.filter(p => p.isNew).slice(0, 8),
    [phones]
  );

  const lowStockPhones = useMemo(() =>
    phones.filter(p => p.stock > 0 && p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3),
    [phones]
  );

  const brands = useMemo(() => {
    const map = {};
    phones.forEach(p => {
      if (p.brand) {
        if (!map[p.brand]) map[p.brand] = 0;
        map[p.brand]++;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [phones]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return phones.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [phones, searchQuery]);

  // ── タイムセールカウントダウン ──
  useEffect(() => {
    if (salePhones.length === 0) return;
    const withUntil = salePhones.filter(p => p.saleUntil);
    if (withUntil.length === 0) return;
    const nearestSale = withUntil.sort((a, b) =>
      (a.saleUntil.toMillis ? a.saleUntil.toMillis() : 0) -
      (b.saleUntil.toMillis ? b.saleUntil.toMillis() : 0)
    )[0];
    if (!nearestSale?.saleUntil?.toMillis) return;

    const tick = () => {
      const diff = nearestSale.saleUntil.toMillis() - Date.now();
      if (diff <= 0) { setSaleTimeLeft('終了'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setSaleTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [salePhones]);

  // ── LEX AIおすすめ ──
  const fetchAiRecommends = useCallback(async () => {
    if (!user || phones.length === 0) return;
    setAiRecLoading(true);
    try {
      const phoneList = phones.slice(0, 30).map(p =>
        `${p.name}(${p.brand},¥${p.price?.toLocaleString()})`
      ).join(', ');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'あなたはスマートフォン販売のAIアシスタントです。ユーザーの好みに合わせて機種を3つ推薦してください。機種名のみをカンマ区切りで返してください。他の文字は一切含めないでください。',
          messages: [{
            role: 'user',
            content: `以下の機種リストから3つ推薦してください: ${phoneList}`
          }]
        })
      });
      const data = await res.json();
      const names = data.content?.[0]?.text?.split(',').map(s => s.trim()) || [];
      const recommended = names
        .map(name => phones.find(p => p.name.includes(name)))
        .filter(Boolean)
        .slice(0, 3);
      setAiRecommends(recommended);
    } catch { }
    finally { setAiRecLoading(false); }
  }, [user, phones]);

  useEffect(() => {
    if (user && phones.length > 0) fetchAiRecommends();
  }, [user, phones.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── カート操作（既存維持）──
  const addToCart = async (product) => {
    if (!user) { setLoginPrompt(true); return; }
    const opts = selectedOptions[product.id] || {};
    if (product.type === 'phone' && !product.tecApproved && !opts.agreedTec) {
      alert('技適に関する注意事項への同意が必要です。');
      return;
    }
    const optionPrice = (opts.case ? OPTION_CASE_PRICE : 0) + (opts.glass ? OPTION_GLASS_PRICE : 0);
    setAddingId(product.id);
    try {
      await addDoc(collection(db, 'carts', user.uid, 'items'), {
        productId: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        url: product.url,
        options: { case: opts.case || false, glass: opts.glass || false },
        optionPrice,
        totalPrice: (product.price || 0) + optionPrice,
        agreedTecApproval: opts.agreedTec || product.tecApproved || false,
        addedAt: serverTimestamp(),
      });
    } finally { setAddingId(null); }
  };

  const removeFromCart = async (docId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'carts', user.uid, 'items', docId));
  };

  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const cartTotal = cartItems.reduce((sum, p) => sum + (p.totalPrice || p.price || 0), 0);
  const cartCount = cartItems.length;

  // ── 商品詳細画面に遷移 ──
  const openDetail = (phone) => {
    setSelectedPhone(phone);
    setView('detail');
  };

  // ── レンダリング ──
  return (
    <div className="shop-screen">

      {/* ヘッダー（全viewで共通） */}
      <div className="shop-header">
        <div className="shop-logo" onClick={() => setView('top')} style={{ cursor: 'pointer' }}>
          <span className="logo-lex">LEX</span><span className="logo-panther">PANTHER</span>
        </div>
        <div className="shop-header-right">
          <button className="shop-header-btn" onClick={() => setSearchActive(true)}>🔍</button>
          <button className="shop-header-btn cart-btn" onClick={() => setCartOpen(true)}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* 検索オーバーレイ */}
      {searchActive && (
        <div className="search-overlay">
          <div className="search-bar">
            <input
              autoFocus
              className="search-input"
              placeholder="ブランド名・機種名で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="search-close-btn" onClick={() => { setSearchActive(false); setSearchQuery(''); }}>✕</button>
          </div>
          {searchQuery && (
            <div className="search-results">
              {searchResults.length > 0 ? searchResults.map(phone => (
                <div key={phone.id} className="search-result-item" onClick={() => { openDetail(phone); setSearchActive(false); setSearchQuery(''); }}>
                  <span className="sr-name">{phone.name}</span>
                  <span className="sr-brand">{phone.brand}</span>
                  <span className="sr-price">¥{(phone.price || 0).toLocaleString()}</span>
                </div>
              )) : (
                <p className="no-result">見つかりませんでした</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ トップページ ═══ */}
      {view === 'top' && (
        <div className="shop-scroll">

          {/* ① 新着バナー */}
          {newPhones[0] && (
            <div className="new-banner" onClick={() => openDetail(newPhones[0])}>
              <span className="new-badge">NEW</span>
              <div className="new-info">
                <div className="new-title">{newPhones[0].name}</div>
                <div className="new-sub">本日入荷{newPhones[0].stock > 0 ? ` · 残り${newPhones[0].stock}台` : ''}</div>
              </div>
              <div className="new-price">¥{(newPhones[0].price || 0).toLocaleString()}</div>
            </div>
          )}

          {/* ② ランキング */}
          {rankingPhones.length > 0 && (
            <div className="shop-section">
              <div className="sec-header">
                <span className="sec-title">🏆 今週の人気機種</span>
              </div>
              {rankingPhones.map((phone, i) => (
                <div key={phone.id} className="rank-item" onClick={() => openDetail(phone)}>
                  <span className={`rank-num ${['rank-gold', 'rank-silver', 'rank-bronze'][i] || 'rank-other'}`}>{i + 1}</span>
                  <div className="rank-thumb">{phone.image ? <img src={phone.image} alt="" className="rank-thumb-img" /> : '📱'}</div>
                  <div className="rank-info">
                    <div className="rank-name">{phone.name}</div>
                    <div className="rank-brand">{phone.brand}{phone.releaseYear ? ` · ${phone.releaseYear}` : ''}</div>
                  </div>
                  <div className="rank-price">¥{(phone.price || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* ③ タイムセール */}
          {salePhones.length > 0 && (
            <div className="shop-section">
              <div className="sec-header">
                <span className="sec-title">⏰ タイムセール</span>
              </div>
              {saleTimeLeft && (
                <div className="timer-badge">
                  <div className="timer-dot" />
                  <span className="timer-text">終了まで</span>
                  <span className="timer-count">{saleTimeLeft}</span>
                </div>
              )}
              <div className="h-scroll">
                {salePhones.map(phone => (
                  <div key={phone.id} className="sale-card" onClick={() => openDetail(phone)}>
                    <div className="sale-thumb">{phone.image ? <img src={phone.image} alt="" className="sale-thumb-img" /> : '📱'}</div>
                    <div className="sale-name">{phone.name}</div>
                    <div className="sale-original">¥{(phone.price || 0).toLocaleString()}</div>
                    <div className="sale-price">¥{(phone.salePrice || 0).toLocaleString()}</div>
                    {phone.price && phone.salePrice && (
                      <span className="sale-off">-{Math.round((1 - phone.salePrice / phone.price) * 100)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ④ LEX AIおすすめ */}
          {user && (
            <div className="shop-section">
              <div className="sec-header">
                <span className="sec-title">🐆 LEX AIのおすすめ</span>
              </div>
              <div className="ai-rec-card">
                <div className="ai-rec-header">
                  <span className="ai-rec-label">あなたへのおすすめ</span>
                  <span className="ai-rec-sub">購入相談の履歴から</span>
                </div>
                {aiRecLoading ? (
                  <p className="loading-text">AIが考え中...</p>
                ) : aiRecommends.length > 0 ? (
                  <div className="ai-rec-products">
                    {aiRecommends.map(phone => (
                      <div key={phone.id} className="ai-rec-item" onClick={() => openDetail(phone)}>
                        <div className="ai-rec-thumb">{phone.image ? <img src={phone.image} alt="" className="ai-rec-thumb-img" /> : '📱'}</div>
                        <div className="ai-rec-name">{phone.name}</div>
                        <div className="ai-rec-price">¥{(phone.price || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="loading-text" style={{ color: '#333' }}>おすすめ機種を取得できませんでした</p>
                )}
              </div>
            </div>
          )}

          {/* ⑤ 新着入荷 */}
          {newPhones.length > 0 && (
            <div className="shop-section">
              <div className="sec-header">
                <span className="sec-title">📦 新着入荷</span>
              </div>
              <div className="h-scroll">
                {newPhones.map(phone => (
                  <div key={phone.id} className="arrival-card" onClick={() => openDetail(phone)}>
                    <span className="arrival-new">NEW</span>
                    <div className="arrival-thumb">{phone.image ? <img src={phone.image} alt="" className="arrival-thumb-img" /> : '📱'}</div>
                    <div className="arrival-name">{phone.name}</div>
                    <div className="arrival-price">¥{(phone.price || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ⑥ 在庫わずか */}
          {lowStockPhones.length > 0 && (
            <div className="shop-section">
              <div className="sec-header">
                <span className="sec-title">🔥 在庫わずか</span>
              </div>
              {lowStockPhones.map(phone => (
                <div key={phone.id} className="stock-item" onClick={() => openDetail(phone)}>
                  <span className="stock-thumb">{phone.image ? <img src={phone.image} alt="" className="stock-thumb-img" /> : '📱'}</span>
                  <div className="stock-info">
                    <div className="stock-name">{phone.name}</div>
                    <div className="stock-price">¥{(phone.price || 0).toLocaleString()}</div>
                  </div>
                  <span className="stock-badge">残り{phone.stock}台</span>
                </div>
              ))}
            </div>
          )}

          {/* ⑦ ブランドから探す */}
          <div className="shop-section">
            <div className="sec-header">
              <span className="sec-title">🔍 ブランドから探す</span>
            </div>
            <div className="brand-chips">
              {brands.map(([brand, count]) => (
                <button
                  key={brand}
                  className="brand-chip"
                  onClick={() => { setSelectedBrand(brand); setView('brand'); }}
                >
                  {brand}
                  <span className="chip-count">{count}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ═══ ブランド別一覧 ═══ */}
      {view === 'brand' && selectedBrand && (
        <div className="shop-scroll">
          <div className="brand-header">
            <button className="back-btn" onClick={() => setView('top')}>←</button>
            <span className="brand-header-name">{selectedBrand}</span>
            <span className="brand-header-count">
              {phones.filter(p => p.brand === selectedBrand).length}機種
            </span>
          </div>
          {phones
            .filter(p => p.brand === selectedBrand)
            .map(phone => (
              <div key={phone.id} className="product-row" onClick={() => openDetail(phone)}>
                <div className="product-thumb">{phone.image ? <img src={phone.image} alt="" className="product-thumb-img" /> : '📱'}</div>
                <div className="product-info">
                  <div className="product-name">{phone.name}</div>
                  <div className="product-spec">{phone.specs?.cpu}{phone.specs?.ram ? ` · ${phone.specs.ram}` : ''}{phone.releaseYear ? ` · ${phone.releaseYear}` : ''}</div>
                  <div className="product-price">¥{(phone.price || 0).toLocaleString()}</div>
                  <div className="product-price-sub">関税・送料込み</div>
                </div>
                <div className="product-badges">
                  {phone.isNew && <span className="pb pb-new">NEW</span>}
                  {phone.isSale && <span className="pb pb-sale">SALE</span>}
                  {phone.stock > 0 && phone.stock <= 5 && <span className="pb pb-hot">残{phone.stock}</span>}
                  {!phone.tecApproved && <span className="pb pb-warn">技適なし</span>}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ═══ 商品詳細 ═══ */}
      {view === 'detail' && selectedPhone && (
        <div className="shop-scroll">
          <button className="back-btn detail-back" onClick={() => setView(selectedBrand ? 'brand' : 'top')}>← 戻る</button>

          <div className="detail-card">
            <div className="detail-img-area">
              {selectedPhone.image
                ? <img src={selectedPhone.image} alt={selectedPhone.name} className="detail-img" />
                : <span className="detail-emoji">📱</span>
              }
            </div>

            <div className="detail-body">
              <div className="detail-brand">{selectedPhone.brand}</div>
              <h3 className="detail-name">{selectedPhone.name}</h3>

              {/* バッジ */}
              <div className="badge-row">
                <span className="badge badge-green">✓ 関税無料</span>
                <span className="badge badge-green">✓ 送料無料</span>
                {!selectedPhone.tecApproved && <span className="badge badge-orange">⚠ 技適なし</span>}
                {selectedPhone.stock > 0 && selectedPhone.stock <= 5 && (
                  <span className="badge badge-red">残り{selectedPhone.stock}台</span>
                )}
                {selectedPhone.isNew && <span className="badge badge-green">NEW</span>}
                {selectedPhone.isSale && <span className="badge badge-orange">SALE</span>}
              </div>

              {/* セール価格 */}
              {selectedPhone.isSale && selectedPhone.salePrice > 0 ? (
                <div className="detail-price-area">
                  <div className="detail-price-original">¥{(selectedPhone.price || 0).toLocaleString()}</div>
                  <div className="detail-price-sale">¥{(selectedPhone.salePrice || 0).toLocaleString()}</div>
                  <span className="detail-sale-off">
                    -{Math.round((1 - selectedPhone.salePrice / selectedPhone.price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <div className="detail-price">¥{(selectedPhone.price || 0).toLocaleString()}</div>
              )}

              {/* スペック */}
              <div className="detail-specs">
                {selectedPhone.specs?.cpu && <div className="detail-spec-row"><span className="spec-label">CPU</span><span className="spec-val">{selectedPhone.specs.cpu}</span></div>}
                {selectedPhone.specs?.ram && <div className="detail-spec-row"><span className="spec-label">RAM</span><span className="spec-val">{selectedPhone.specs.ram}</span></div>}
                {selectedPhone.specs?.storage && <div className="detail-spec-row"><span className="spec-label">Storage</span><span className="spec-val">{selectedPhone.specs.storage}</span></div>}
                {selectedPhone.specs?.display && <div className="detail-spec-row"><span className="spec-label">Display</span><span className="spec-val">{selectedPhone.specs.display}</span></div>}
                {selectedPhone.specs?.camera && <div className="detail-spec-row"><span className="spec-label">Camera</span><span className="spec-val">{selectedPhone.specs.camera}</span></div>}
                {selectedPhone.specs?.battery && <div className="detail-spec-row"><span className="spec-label">Battery</span><span className="spec-val">{selectedPhone.specs.battery}</span></div>}
              </div>

              {/* オプション選択（既存機能維持） */}
              {(selectedPhone.hasCase || selectedPhone.hasGlass) && (
                <div className="option-section">
                  <div className="option-section-title">オプション選択</div>

                  {selectedPhone.hasCase && (
                    <div
                      className={`option-row ${selectedOptions[selectedPhone.id]?.case ? 'selected' : ''}`}
                      onClick={() => setSelectedOptions(prev => ({
                        ...prev,
                        [selectedPhone.id]: { ...prev[selectedPhone.id], case: !prev[selectedPhone.id]?.case }
                      }))}
                    >
                      <div className={`option-check ${selectedOptions[selectedPhone.id]?.case ? 'checked' : ''}`}>
                        {selectedOptions[selectedPhone.id]?.case && '✓'}
                      </div>
                      <span className="option-icon">🎁</span>
                      <div className="option-info">
                        <div className="option-name">ランダムケース</div>
                        <div className="option-desc">デザインはおまかせ・1個付属</div>
                      </div>
                      <span className="option-price">+¥{OPTION_CASE_PRICE}</span>
                    </div>
                  )}

                  {selectedPhone.hasGlass && (
                    <div
                      className={`option-row ${selectedOptions[selectedPhone.id]?.glass ? 'selected' : ''}`}
                      onClick={() => setSelectedOptions(prev => ({
                        ...prev,
                        [selectedPhone.id]: { ...prev[selectedPhone.id], glass: !prev[selectedPhone.id]?.glass }
                      }))}
                    >
                      <div className={`option-check ${selectedOptions[selectedPhone.id]?.glass ? 'checked' : ''}`}>
                        {selectedOptions[selectedPhone.id]?.glass && '✓'}
                      </div>
                      <span className="option-icon">🛡</span>
                      <div className="option-info">
                        <div className="option-name">保護ガラスフィルム</div>
                        <div className="option-desc">9H強化ガラス・貼り付け簡単</div>
                      </div>
                      <span className="option-price">+¥{OPTION_GLASS_PRICE}</span>
                    </div>
                  )}

                  {!selectedPhone.tecApproved && (
                    <div className="teccheck-box">
                      <span className="teccheck-icon">⚠️</span>
                      <div>
                        <p className="teccheck-text">
                          この端末は日本の技術基準適合証明（技適）を取得していません。
                          日本国内での通話・Wi-Fi・Bluetoothの使用は電波法に抵触する可能性があります。
                        </p>
                        <div
                          className="teccheck-check"
                          onClick={() => setSelectedOptions(prev => ({
                            ...prev,
                            [selectedPhone.id]: { ...prev[selectedPhone.id], agreedTec: !prev[selectedPhone.id]?.agreedTec }
                          }))}
                        >
                          <div className={`tec-checkbox ${selectedOptions[selectedPhone.id]?.agreedTec ? 'checked' : ''}`}>
                            {selectedOptions[selectedPhone.id]?.agreedTec && '✓'}
                          </div>
                          <span className="tec-check-label">上記を理解した上で購入します</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="option-total-row">
                    <span className="option-total-label">合計</span>
                    <div>
                      <div className="option-total-price">
                        ¥{(
                          (selectedPhone.isSale && selectedPhone.salePrice > 0 ? selectedPhone.salePrice : selectedPhone.price || 0) +
                          (selectedOptions[selectedPhone.id]?.case ? OPTION_CASE_PRICE : 0) +
                          (selectedOptions[selectedPhone.id]?.glass ? OPTION_GLASS_PRICE : 0)
                        ).toLocaleString()}
                      </div>
                      <div className="option-total-sub">関税・送料込み</div>
                    </div>
                  </div>
                </div>
              )}

              {/* アクションボタン */}
              <div className="detail-actions">
                <button
                  className="detail-cart-btn"
                  onClick={() => addToCart(selectedPhone)}
                  disabled={addingId === selectedPhone.id}
                >
                  {addingId === selectedPhone.id ? '追加中...' : '🛒 カートに追加'}
                </button>
                <button
                  className={`detail-fav-btn ${favs.has(selectedPhone.id) ? 'active' : ''}`}
                  onClick={() => toggleFav(selectedPhone.id)}
                >
                  ♥
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ カートモーダル（既存維持）═══ */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <span className="cart-modal-title">CART</span>
              <button className="cart-modal-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>

            {!user ? (
              <div className="cart-login-prompt">
                <p>カート機能を使うにはログインが必要です</p>
                <button className="cart-login-btn" onClick={() => { signIn(); setCartOpen(false); }}>
                  Googleでログイン
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <p className="cart-empty">カートは空です</p>
            ) : (
              <>
                <div className="cart-item-list">
                  {cartItems.map((item) => (
                    <div key={item.docId} className="cart-item">
                      <span className="cart-item-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">¥{(item.totalPrice || item.price || 0).toLocaleString()}</div>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.docId)}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span className="cart-total-label">合計</span>
                  <span className="cart-total-price">¥{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={() => {
                    if (cartItems[0]?.url) window.open(cartItems[0].url, '_blank');
                  }}
                >
                  購入する →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ログイン促進モーダル */}
      {loginPrompt && (
        <div className="modal-overlay" onClick={() => setLoginPrompt(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <span className="cart-modal-title">ログインが必要です</span>
              <button className="cart-modal-close" onClick={() => setLoginPrompt(false)}>✕</button>
            </div>
            <p className="cart-login-text">カートに追加するにはGoogleログインが必要です</p>
            <button className="cart-login-btn" onClick={() => { signIn(); setLoginPrompt(false); }}>
              Googleでログイン
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
