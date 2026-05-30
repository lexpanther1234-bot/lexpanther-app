import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './ShopScreen.css';

const OPTION_CASE_PRICE = 500;
const OPTION_GLASS_PRICE = 500;

const TOP_TABS = ['おすすめ', 'Apple', '国産', 'タブレット', 'PC', 'イヤホン'];

const CATEGORY_ICONS = [
  { label: '充電器',           icon: '🔌', color: 'linear-gradient(135deg,#ff6b6b,#ff8e53)' },
  { label: 'ケース',           icon: '📱', color: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { label: 'モバイルバッテリー', icon: '🔋', color: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { label: 'プロジェクター',   icon: '📽', color: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { label: 'ゲーム機',         icon: '🎮', color: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { label: 'カメラ',           icon: '📷', color: 'linear-gradient(135deg,#fda085,#f6d365)' },
  { label: '電子書籍',         icon: '📚', color: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { label: 'スマートウォッチ', icon: '⌚', color: 'linear-gradient(135deg,#11998e,#38ef7d)' },
  { label: '修理受付',         icon: '🔧', color: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { label: '買取査定',         icon: '♻',  color: 'linear-gradient(135deg,#ee0979,#ff6a00)' },
];

const SIDEBAR_CATEGORIES = [
  'Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Sony',
  'OPPO', 'Honor', 'Nothing', 'Motorola', 'ASUS', 'Realme', 'vivo',
];

const ShopScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // 画面管理
  const [view, setView] = useState('top');
  // 'top' | 'brand' | 'search' | 'detail' | 'reviews'
  const [activeTab, setActiveTab] = useState('おすすめ');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [sidebarCategory, setSidebarCategory] = useState('Apple');
  const [searchQuery, setSearchQuery] = useState('');
  const [saleTimeLeft, setSaleTimeLeft] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAllList, setShowAllList] = useState(false);

  // Firestore phones購読
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      setPhones(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          brand: data.brand || '',
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
          grade: data.grade || '新品',
          imei: data.imei || '',
          inspectionReport: data.inspectionReport || '',
          activationDate: data.activationDate || '',
          includeItems: data.includeItems || '',
          batteryHealth: data.batteryHealth || 0,
          realPhotos: data.realPhotos || [],
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
  const salePhones = useMemo(() =>
    phones.filter(p => p.isSale && p.salePrice > 0),
    [phones]
  );

  const newPhones = useMemo(() =>
    phones.filter(p => p.isNew).slice(0, 8),
    [phones]
  );

  const phonesByBrand = useMemo(() => {
    const map = {};
    phones.forEach(p => {
      if (p.brand) {
        if (!map[p.brand]) map[p.brand] = [];
        map[p.brand].push(p);
      }
    });
    return map;
  }, [phones]);

  const tabPhones = useMemo(() => {
    if (activeTab === 'おすすめ') return phones.slice(0, 20);
    if (activeTab === 'Apple') return phones.filter(p => p.brand === 'Apple');
    if (activeTab === '国産') return phones.filter(p =>
      ['Xiaomi', 'OPPO', 'OnePlus', 'HUAWEI', 'Honor', 'vivo', 'Realme'].includes(p.brand)
    );
    if (activeTab === 'タブレット') return phones.filter(p => p.category === 'tablet');
    return phones;
  }, [phones, activeTab]);

  // モデル選択時のフィルタ済みリスト
  const filteredTabPhones = useMemo(() => {
    if (!selectedModel) return tabPhones;
    return tabPhones.filter(p => p.id === selectedModel);
  }, [tabPhones, selectedModel]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return phones.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [phones, searchQuery]);

  // ── タイムセールカウントダウン ──
  useEffect(() => {
    if (salePhones.length === 0) return;
    const withUntil = salePhones.filter(p => p.saleUntil?.toMillis);
    if (withUntil.length === 0) return;
    const nearestSale = [...withUntil].sort((a, b) =>
      a.saleUntil.toMillis() - b.saleUntil.toMillis()
    )[0];

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

  // ── カート操作（既存維持）──
  const handleAddToCart = useCallback(async (product) => {
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
  }, [user, selectedOptions]);

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

  const openDetail = (phone) => {
    setSelectedPhone(phone);
    setView('detail');
  };

  // ── prevView for back navigation ──
  const goBack = () => {
    if (view === 'detail') setView(selectedBrand ? 'brand' : 'top');
    else if (view === 'reviews') setView('detail');
    else if (view === 'brand' || view === 'search') setView('top');
    else if (showAllList) { setShowAllList(false); }
    else setView('top');
  };

  return (
    <div className="shop-screen">

      {/* ═══ ヘッダー ═══ */}
      <div className="shop-hdr">
        <div className="shop-hdr-top">
          {(view === 'detail' || view === 'reviews' || view === 'brand' || view === 'search') ? (
            <button className="shdr-back" onClick={goBack}>←</button>
          ) : (
            <div className="shop-logo" onClick={() => setView('top')} style={{ cursor: 'pointer' }}>
              <span className="sl-lex">LEX</span><span className="sl-panther">PANTHER</span>
            </div>
          )}
          <div className="shop-hdr-icons">
            <button className="shdr-btn" onClick={() => setView(view === 'search' ? 'top' : 'search')}>🔍</button>
            <button className="shdr-btn shdr-cart" onClick={() => setCartOpen(true)}>
              🛒
              {cartCount > 0 && <span className="shdr-cart-dot">{cartCount}</span>}
            </button>
          </div>
        </div>
        {(view === 'top' || view === 'brand') && (
          <div className="cat-tabs-scroll">
            {TOP_TABS.map(tab => (
              <button
                key={tab}
                className={`cat-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setSelectedModel(null); setShowAllList(false); setView('top'); }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ═══ ① トップページ ═══ */}
      {view === 'top' && (
        <div className="shop-scroll">

          {/* カテゴリアイコングリッド（おすすめタブのみ） */}
          {activeTab === 'おすすめ' && (
            <div className="icon-grid">
              {CATEGORY_ICONS.map(c => (
                <div key={c.label} className="icon-item">
                  <div className="icon-circle" style={{ background: c.color }}>{c.icon}</div>
                  <div className="icon-label">{c.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* おすすめタブ: バナー・セール・ブランドチップ */}
          {activeTab === 'おすすめ' && (
            <>
              {/* バナー */}
              <div className="banner-row">
                {newPhones[0] ? (
                  <div className="banner banner-main" onClick={() => openDetail(newPhones[0])}>
                    <span className="banner-tag">NEW</span>
                    <div className="banner-title">{newPhones[0].name}</div>
                    <div className="banner-price">¥{(newPhones[0].price || 0).toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="banner banner-main">
                    <span className="banner-tag">SHOP</span>
                    <div className="banner-title">海外スマホ<br />専門ストア</div>
                    <div className="banner-price" style={{ fontSize: 11 }}>関税・送料込み</div>
                  </div>
                )}
                <div className="banner banner-sub">
                  <div className="banner-sub-txt">信頼の買取</div>
                  <div className="banner-title">スマホ買取<br />ここが確実</div>
                  <div className="banner-link">→ 査定はこちら</div>
                </div>
              </div>

              {/* タイムセール */}
              {salePhones.length > 0 && (
                <div className="shop-section">
                  <div className="sec-hdr">
                    <span className="sec-title">⏰ タイムセール</span>
                    {saleTimeLeft && <span className="timer-count">{saleTimeLeft}</span>}
                  </div>
                  <div className="h-scroll">
                    {salePhones.map(p => (
                      <div key={p.id} className="sale-card" onClick={() => openDetail(p)}>
                        <div className="sale-thumb">{p.image ? <img src={p.image} alt="" className="sale-thumb-img" /> : '📱'}</div>
                        <div className="sale-name">{p.name}</div>
                        <div className="sale-price">¥{(p.salePrice || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 本日入荷 */}
              <div className="shop-section">
                <div className="sec-hdr">
                  <div className="sec-dot-title"><div className="sec-dot" /><span className="sec-title">本日入荷</span></div>
                  <span className="sec-more">全て見る ›</span>
                </div>
                <div className="product-grid-2">
                  {tabPhones.slice(0, 6).map(phone => (
                    <div key={phone.id} className="product-card-v2" onClick={() => openDetail(phone)}>
                      <div className="pc-img-wrap">
                        {phone.image
                          ? <img src={phone.image} alt="" className="pc-img" />
                          : <span className="pc-emoji">📱</span>
                        }
                        <span className={`grade-badge ${phone.grade === '新品' ? 'grade-new' : ''}`}>
                          {phone.grade || '新品'}
                        </span>
                      </div>
                      <div className="pc-info">
                        <div className="pc-name">{phone.name}</div>
                        <div className="pc-price-row">
                          <span className="pc-price">¥{(phone.price || 0).toLocaleString()}</span>
                          <span className="pc-similar">類似 ›</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ブランドから探す */}
              <div className="shop-section">
                <div className="sec-hdr">
                  <div className="sec-dot-title"><div className="sec-dot" /><span className="sec-title">ブランドから探す</span></div>
                </div>
                <div className="brand-chips-v2">
                  {Object.keys(phonesByBrand).map(brand => (
                    <button
                      key={brand}
                      className="brand-chip-v2"
                      onClick={() => { setSelectedBrand(brand); setView('brand'); }}
                    >
                      {brand}
                      <span className="chip-count-v2">{phonesByBrand[brand].length}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* もっと見る */}
              {tabPhones.length > 6 && (
                <div className="shop-section">
                  <div className="product-grid-2">
                    {tabPhones.slice(6, 20).map(phone => (
                      <div key={phone.id} className="product-card-v2" onClick={() => openDetail(phone)}>
                        <div className="pc-img-wrap">
                          {phone.image
                            ? <img src={phone.image} alt="" className="pc-img" />
                            : <span className="pc-emoji">📱</span>
                          }
                          <span className={`grade-badge ${phone.grade === '新品' ? 'grade-new' : ''}`}>
                            {phone.grade || '新品'}
                          </span>
                        </div>
                        <div className="pc-info">
                          <div className="pc-name">{phone.name}</div>
                          <div className="pc-price-row">
                            <span className="pc-price">¥{(phone.price || 0).toLocaleString()}</span>
                            <span className="pc-similar">類似 ›</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ブランドタブ（Apple・国産など）: 機種選択グリッド + 全て見る */}
          {activeTab !== 'おすすめ' && !showAllList && (
            <>
              {/* 各機種を3列グリッドで表示 */}
              {tabPhones.length > 0 && (
                <div className="model-pick-grid">
                  {tabPhones.map(phone => (
                    <div key={phone.id} className="model-pick-item" onClick={() => openDetail(phone)}>
                      <div className="model-pick-img">
                        {phone.image
                          ? <img src={phone.image} alt="" className="model-pick-photo" />
                          : <span style={{ fontSize: 30 }}>📱</span>
                        }
                      </div>
                      <div className="model-pick-name">{phone.name}</div>
                    </div>
                  ))}
                  {/* 全て見る */}
                  <div className="model-pick-item" onClick={() => setShowAllList(true)}>
                    <div className="model-pick-img model-pick-all">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </div>
                    <div className="model-pick-name">全て見る</div>
                  </div>
                </div>
              )}
              {tabPhones.length === 0 && (
                <p className="no-result">該当する商品がありません</p>
              )}
            </>
          )}

          {/* 全て見る一覧モード */}
          {activeTab !== 'おすすめ' && showAllList && (
            <div className="shop-section">
              <div className="sec-hdr">
                <div className="sec-dot-title">
                  <div className="sec-dot" />
                  <span className="sec-title">{activeTab} — 全商品</span>
                </div>
                <span className="sec-more">{tabPhones.length}件</span>
              </div>
              <div className="product-grid-2">
                {tabPhones.map(phone => (
                  <div key={phone.id} className="product-card-v2" onClick={() => openDetail(phone)}>
                    <div className="pc-img-wrap">
                      {phone.image
                        ? <img src={phone.image} alt="" className="pc-img" />
                        : <span className="pc-emoji">📱</span>
                      }
                      <span className={`grade-badge ${phone.grade === '新品' ? 'grade-new' : ''}`}>
                        {phone.grade || '新品'}
                      </span>
                    </div>
                    <div className="pc-info">
                      <div className="pc-name">{phone.name}</div>
                      <div className="pc-price-row">
                        <span className="pc-price">¥{(phone.price || 0).toLocaleString()}</span>
                        <span className="pc-similar">類似 ›</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ ② ブランド別一覧 ═══ */}
      {view === 'brand' && selectedBrand && (
        <div className="shop-scroll">
          {/* モデル選択グリッド */}
          <div className="model-select-grid">
            {(phonesByBrand[selectedBrand] || []).slice(0, 7).map(phone => (
              <div key={phone.id} className="model-select-item" onClick={() => openDetail(phone)}>
                <div className="model-select-img">
                  {phone.image ? <img src={phone.image} alt="" className="ms-img" /> : '📱'}
                </div>
                <div className="model-select-name">{phone.name.split(' ').slice(-2).join(' ')}</div>
              </div>
            ))}
            {(phonesByBrand[selectedBrand] || []).length > 7 && (
              <div className="model-select-item">
                <div className="model-select-more">⋯</div>
                <div className="model-select-name">全て見る</div>
              </div>
            )}
          </div>
          {/* 商品一覧 */}
          <div className="product-grid-2">
            {(phonesByBrand[selectedBrand] || []).map(phone => (
              <div key={phone.id} className="product-card-v2" onClick={() => openDetail(phone)}>
                <div className="pc-img-wrap">
                  {phone.image
                    ? <img src={phone.image} alt="" className="pc-img" />
                    : <span className="pc-emoji">📱</span>
                  }
                  <span className={`grade-badge ${phone.grade === '新品' ? 'grade-new' : ''}`}>
                    {phone.grade || '新品'}
                  </span>
                </div>
                <div className="pc-info">
                  <div className="pc-name">{phone.name}</div>
                  <div className="pc-price-row">
                    <span className="pc-price">¥{(phone.price || 0).toLocaleString()}</span>
                    <span className="pc-similar">類似 ›</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ③ 検索 ═══ */}
      {view === 'search' && (
        <div className="search-layout">
          {/* 左サイドバー */}
          <div className="search-sidebar">
            {SIDEBAR_CATEGORIES.map(cat => (
              <div
                key={cat}
                className={`sidebar-item ${sidebarCategory === cat ? 'active' : ''}`}
                onClick={() => setSidebarCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
          {/* 右メインエリア */}
          <div className="search-main">
            <div className="search-bar-inner">
              <input
                autoFocus
                className="search-input-inner"
                placeholder="機種名・ブランドで検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery ? (
              <div className="search-result-list">
                {searchResults.length > 0 ? searchResults.map(phone => (
                  <div key={phone.id} className="search-result-item" onClick={() => { openDetail(phone); setSearchQuery(''); }}>
                    <span className="sri-name">{phone.name}</span>
                    <span className="sri-price">¥{(phone.price || 0).toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="no-result">見つかりませんでした</p>
                )}
              </div>
            ) : (
              <div className="brand-model-grid">
                {(phonesByBrand[sidebarCategory] || []).slice(0, 12).map(phone => (
                  <div key={phone.id} className="brand-model-item" onClick={() => openDetail(phone)}>
                    <div className="bmi-img">
                      {phone.image ? <img src={phone.image} alt="" className="bmi-img-inner" /> : '📱'}
                    </div>
                    <div className="bmi-name">{phone.name.split(' ').slice(-2).join(' ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ ④ 商品詳細 ═══ */}
      {view === 'detail' && selectedPhone && (
        <div className="detail-wrap">
          {/* 実機写真エリア */}
          <div className="detail-photos-area">
            {selectedPhone.image
              ? <img src={selectedPhone.image} alt="" className="dp-main-img" />
              : <span className="dp-emoji">📱</span>
            }
            <span className="dp-self-badge">自営</span>
            {selectedPhone.realPhotos?.length > 0 && (
              <span className="dp-count">1 / {selectedPhone.realPhotos.length}</span>
            )}
          </div>

          <div className="detail-body">
            {/* グレード */}
            <span className={`grade-badge-lg ${selectedPhone.grade === '新品' ? 'grade-new' : ''}`}>
              {selectedPhone.grade || '新品'}
            </span>
            <div className="detail-name">{selectedPhone.name}</div>

            {/* 価格 */}
            {selectedPhone.isSale && selectedPhone.salePrice > 0 ? (
              <div className="detail-price-area">
                <span className="detail-price-sale">¥{(selectedPhone.salePrice || 0).toLocaleString()}</span>
                <span className="detail-price-original">¥{(selectedPhone.price || 0).toLocaleString()}</span>
              </div>
            ) : (
              <div className="detail-price">¥{(selectedPhone.price || 0).toLocaleString()}</div>
            )}

            {/* 保証バー */}
            <div className="guarantee-bar">
              {['🚚 送料無料', '📸 実機撮影', '↩ 7日返品', '🛡 1年保証'].map(g => (
                <div key={g} className="g-item">{g}</div>
              ))}
            </div>

            {/* 活動 */}
            <div className="activity-row">
              <span className="activity-tag">活動</span>
              <span className="activity-text">スマホ・タブレット・PC・ゲーム機・カメラ・イヤホン 買取受付中</span>
              <span className="activity-arrow">›</span>
            </div>

            {/* IMEI/SN */}
            {selectedPhone.imei && (
              <div className="info-row">
                <span className="info-label">IMEI/SN</span>
                <span className="info-value">{selectedPhone.imei}</span>
              </div>
            )}

            {/* 質検報告 */}
            {selectedPhone.inspectionReport && (
              <div className="info-row">
                <span className="info-label">質検報告</span>
                <span className="info-value">{selectedPhone.inspectionReport}</span>
              </div>
            )}

            {/* 付属品 */}
            {selectedPhone.includeItems && (
              <div className="info-row">
                <span className="info-label">付属品</span>
                <span className="info-value green">{selectedPhone.includeItems}</span>
              </div>
            )}

            {/* 電池残量 */}
            {selectedPhone.batteryHealth > 0 && (
              <div className="info-row">
                <span className="info-label">電池残量</span>
                <span className="info-value green">{selectedPhone.batteryHealth}%</span>
              </div>
            )}

            {/* スペック */}
            {(selectedPhone.specs?.cpu || selectedPhone.specs?.ram || selectedPhone.specs?.display) && (
              <div className="detail-specs">
                {selectedPhone.specs?.cpu && <div className="detail-spec-row"><span className="spec-label">CPU</span><span className="spec-val">{selectedPhone.specs.cpu}</span></div>}
                {selectedPhone.specs?.ram && <div className="detail-spec-row"><span className="spec-label">RAM</span><span className="spec-val">{selectedPhone.specs.ram}</span></div>}
                {selectedPhone.specs?.storage && <div className="detail-spec-row"><span className="spec-label">Storage</span><span className="spec-val">{selectedPhone.specs.storage}</span></div>}
                {selectedPhone.specs?.display && <div className="detail-spec-row"><span className="spec-label">Display</span><span className="spec-val">{selectedPhone.specs.display}</span></div>}
                {selectedPhone.specs?.camera && <div className="detail-spec-row"><span className="spec-label">Camera</span><span className="spec-val">{selectedPhone.specs.camera}</span></div>}
                {selectedPhone.specs?.battery && <div className="detail-spec-row"><span className="spec-label">Battery</span><span className="spec-val">{selectedPhone.specs.battery}</span></div>}
              </div>
            )}

            {/* 実機写真グリッド */}
            {selectedPhone.realPhotos?.length > 0 && (
              <div className="real-photos-grid">
                {selectedPhone.realPhotos.slice(0, 4).map((url, i) => (
                  <img key={i} src={url} alt={`実機写真${i + 1}`} className="real-photo-img" />
                ))}
              </div>
            )}

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
              </div>
            )}

            {/* 信頼セクション */}
            <div className="trust-section">
              <div className="trust-title">🐆 LexPantherが他と違う点</div>
              {[
                { t: '完全自社在庫', d: '全商品を自社で管理。第三者業者なし、請求書は当社が発行します。' },
                { t: '実機写真掲載', d: '掲載写真はすべて実際の在庫を撮影。傷も正直に表示します。' },
                { t: '透明な価格設定', d: '関税・送料込みの最終価格のみ表示。隠れたコストは一切ありません。' },
                { t: '修理まで対応', d: '購入後の修理もアプリから申し込めます。' },
              ].map(item => (
                <div key={item.t} className="trust-item">
                  <div className="trust-item-title">{item.t}</div>
                  <div className="trust-item-desc">{item.d}</div>
                </div>
              ))}
            </div>

            {/* レビューサマリー */}
            <div className="review-summary" onClick={() => setView('reviews')}>
              <span className="review-summary-title">購入者レビュー</span>
              <span className="review-summary-arrow">›</span>
            </div>
          </div>

          {/* 購入ボタンバー */}
          <div className="buy-bar">
            <button className="buy-service-btn" onClick={() => toggleFav(selectedPhone.id)}>
              {favs.has(selectedPhone.id) ? '❤️' : '🤍'}<br />お気に入り
            </button>
            <button
              className="buy-cart-btn"
              onClick={() => handleAddToCart(selectedPhone)}
              disabled={addingId === selectedPhone.id}
            >
              {addingId === selectedPhone.id ? '追加中...' : 'カートに入れる'}
            </button>
            <button className="buy-now-btn" onClick={() => {
              if (selectedPhone.url) window.open(selectedPhone.url, '_blank');
              else handleAddToCart(selectedPhone);
            }}>
              今すぐ購入
            </button>
          </div>
        </div>
      )}

      {/* ═══ ⑤ レビューページ ═══ */}
      {view === 'reviews' && selectedPhone && (
        <div className="shop-scroll">
          <div className="sec-hdr" style={{ marginBottom: '14px' }}>
            <span className="sec-title">購入者レビュー — {selectedPhone.name}</span>
          </div>
          <p className="no-result">まだレビューがありません</p>
        </div>
      )}

      {/* ═══ カートモーダル ═══ */}
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
                <button className="cart-login-btn" onClick={() => { signIn(); setCartOpen(false); }}>Googleでログイン</button>
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
                <button className="checkout-btn" onClick={() => { if (cartItems[0]?.url) window.open(cartItems[0].url, '_blank'); }}>
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
            <button className="cart-login-btn" onClick={() => { signIn(); setLoginPrompt(false); }}>Googleでログイン</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
