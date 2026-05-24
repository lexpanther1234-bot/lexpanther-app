import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './ShopScreen.css';

const OPTION_CASE_PRICE = 500;
const OPTION_GLASS_PRICE = 500;

const ACCESSORIES = [
  { id: 'acc-1', name: 'Spigen Tough Armor', maker: 'Spigen', price: 2980, type: 'accessory', emoji: '🛡️', spec: 'iPhone 16 Pro Max対応', url: 'https://www.spigen.com/jp/' },
  { id: 'acc-2', name: 'Anker MagGo Charger', maker: 'Anker', price: 4980, type: 'accessory', emoji: '🔋', spec: 'MagSafe対応 / 15W', url: 'https://www.ankerjapan.com/' },
  { id: 'acc-3', name: 'Peak Design Mobile Case', maker: 'Peak Design', price: 8800, type: 'accessory', emoji: '📦', spec: 'Pixel 9 Pro対応', url: 'https://www.peakdesign.com/collections/mobile' },
  { id: 'acc-4', name: 'Belkin ScreenForce Pro', maker: 'Belkin', price: 3480, type: 'accessory', emoji: '🔲', spec: 'Samsung S25 Ultra対応', url: 'https://www.belkin.com/jp/' },
];

const ShopScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [compareList, setCompareList] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      setPhones(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          maker: data.brand,
          price: data.price || 0,
          type: 'phone',
          emoji: '📱',
          spec: `${data.specs?.display || ''} / ${data.specs?.cpu || ''} / ${data.specs?.camera || ''}`,
          url: data.shopUrl || '',
          stock: data.stock || 0,
          hasCase: data.hasCase || false,
          hasGlass: data.hasGlass || false,
          tecApproved: data.tecApproved !== false,
        };
      }));
    });
    return () => unsub();
  }, []);

  // Firestoreカートをリアルタイム購読
  useEffect(() => {
    if (!user) { setCartItems([]); return; }
    const ref = collection(db, 'carts', user.uid, 'items');
    const unsub = onSnapshot(ref, (snap) => {
      setCartItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const allProducts = useMemo(() => [...phones, ...ACCESSORIES], [phones]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (activeTab === 'phone' && p.type !== 'phone') return false;
      if (activeTab === 'accessory' && p.type !== 'accessory') return false;
      if (activeTab === 'fav' && !favs.has(p.id)) return false;
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()) && !p.maker.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, keyword, favs, allProducts]);

  const addToCart = async (product) => {
    if (!user) { setLoginPrompt(true); return; }

    const opts = selectedOptions[product.id] || {};

    // 技適なし機種は同意必須
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
        options: {
          case: opts.case || false,
          glass: opts.glass || false,
        },
        optionPrice,
        totalPrice: (product.price || 0) + optionPrice,
        agreedTecApproval: opts.agreedTec || product.tecApproved || false,
        addedAt: serverTimestamp(),
      });
    } finally {
      setAddingId(null);
    }
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

  const toggleCompare = (id) => {
    setCompareList((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else if (next.size < 2) { next.add(id); }
      return next;
    });
  };

  const cartTotal = cartItems.reduce((sum, p) => sum + (p.price || 0), 0);
  const compareItems = allProducts.filter((p) => compareList.has(p.id));

  return (
    <div className="shop-screen">
      <div className="shop-header">
        <h2 className="shop-title">▶ Shop</h2>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          CART
          {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
        </button>
      </div>

      <div className="tab-row">
        {[
          { key: 'all', label: 'ALL' },
          { key: 'phone', label: 'スマホ' },
          { key: 'accessory', label: 'アクセサリー' },
          { key: 'fav', label: '♥ お気に入り' },
        ].map((t) => (
          <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <input
        className="shop-search"
        type="text"
        placeholder="商品名・メーカーで検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {compareList.size > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-title">⚖ 価格比較</div>
          <div className="compare-grid">
            {compareItems.map((p) => (
              <div key={p.id} className="compare-item">
                <div className="compare-item-name">{p.name}</div>
                <div className="compare-item-price">¥{p.price.toLocaleString()}</div>
                <div className="compare-item-spec">{p.spec}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-result">該当する商品が見つかりませんでした</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.id} className={`product-card ${compareList.has(p.id) ? 'compare-on' : ''}`}>
              <div className="product-img">{p.emoji}</div>
              <div className="product-body">
                <div className="product-name">{p.name}</div>
                <div className="product-maker">{p.maker}</div>

                {/* バッジ */}
                {p.type === 'phone' && (
                  <div className="badge-row">
                    <span className="badge badge-green">✓ 関税無料</span>
                    <span className="badge badge-green">✓ 送料無料</span>
                    {!p.tecApproved && <span className="badge badge-orange">⚠ 技適なし</span>}
                    {p.stock > 0 && p.stock <= 5 && (
                      <span className="badge badge-red">残り{p.stock}台</span>
                    )}
                  </div>
                )}

                <div className="product-price">¥{p.price.toLocaleString()}</div>

                {/* オプション選択 */}
                {p.type === 'phone' && (p.hasCase || p.hasGlass) && (
                  <div className="option-section">
                    <div className="option-section-title">オプション選択</div>

                    {p.hasCase && (
                      <div
                        className={`option-row ${selectedOptions[p.id]?.case ? 'selected' : ''}`}
                        onClick={() => setSelectedOptions(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], case: !prev[p.id]?.case }
                        }))}
                      >
                        <div className={`option-check ${selectedOptions[p.id]?.case ? 'checked' : ''}`}>
                          {selectedOptions[p.id]?.case && '✓'}
                        </div>
                        <span className="option-icon">🎁</span>
                        <div className="option-info">
                          <div className="option-name">ランダムケース</div>
                          <div className="option-desc">デザインはおまかせ・1個付属</div>
                        </div>
                        <span className="option-price">+¥{OPTION_CASE_PRICE}</span>
                      </div>
                    )}

                    {p.hasGlass && (
                      <div
                        className={`option-row ${selectedOptions[p.id]?.glass ? 'selected' : ''}`}
                        onClick={() => setSelectedOptions(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], glass: !prev[p.id]?.glass }
                        }))}
                      >
                        <div className={`option-check ${selectedOptions[p.id]?.glass ? 'checked' : ''}`}>
                          {selectedOptions[p.id]?.glass && '✓'}
                        </div>
                        <span className="option-icon">🛡</span>
                        <div className="option-info">
                          <div className="option-name">保護ガラスフィルム</div>
                          <div className="option-desc">9H強化ガラス・貼り付け簡単</div>
                        </div>
                        <span className="option-price">+¥{OPTION_GLASS_PRICE}</span>
                      </div>
                    )}

                    {!p.tecApproved && (
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
                              [p.id]: { ...prev[p.id], agreedTec: !prev[p.id]?.agreedTec }
                            }))}
                          >
                            <div className={`tec-checkbox ${selectedOptions[p.id]?.agreedTec ? 'checked' : ''}`}>
                              {selectedOptions[p.id]?.agreedTec && '✓'}
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
                            (p.price || 0) +
                            (selectedOptions[p.id]?.case ? OPTION_CASE_PRICE : 0) +
                            (selectedOptions[p.id]?.glass ? OPTION_GLASS_PRICE : 0)
                          ).toLocaleString()}
                        </div>
                        <div className="option-total-sub">関税・送料込み</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="product-actions">
                  <button
                    className="btn-cart"
                    onClick={() => addToCart(p)}
                    disabled={addingId === p.id}
                  >
                    {addingId === p.id ? '...' : '+ CART'}
                  </button>
                  <button className={`btn-fav ${favs.has(p.id) ? 'active' : ''}`} onClick={() => toggleFav(p.id)}>♥</button>
                  <button className={`btn-compare ${compareList.has(p.id) ? 'active' : ''}`} onClick={() => toggleCompare(p.id)}>比</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* カートモーダル */}
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
                        <div className="cart-item-price">¥{item.price.toLocaleString()}</div>
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
