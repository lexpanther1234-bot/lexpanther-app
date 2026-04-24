import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './ShopScreen.css';

const PRODUCTS = [
  { id: 1, name: 'Samsung Galaxy S25 Ultra', maker: 'Samsung', price: 189800, type: 'phone', emoji: '📱', spec: '6.9" / Snapdragon 8 Elite / 200MP', url: 'https://www.samsung.com/jp/smartphones/galaxy-s25-ultra/' },
  { id: 2, name: 'iPhone 16 Pro Max', maker: 'Apple', price: 198800, type: 'phone', emoji: '📱', spec: '6.9" / A18 Pro / 48MP', url: 'https://www.apple.com/jp/shop/buy-iphone/iphone-16-pro' },
  { id: 3, name: 'Google Pixel 9 Pro', maker: 'Google', price: 159800, type: 'phone', emoji: '📱', spec: '6.3" / Tensor G4 / 50MP', url: 'https://store.google.com/jp/product/pixel_9_pro' },
  { id: 4, name: 'Xiaomi 14 Ultra', maker: 'Xiaomi', price: 139800, type: 'phone', emoji: '📱', spec: '6.73" / SD8 Gen3 / Leica 50MP', url: 'https://www.mi.com/global/product/xiaomi-14-ultra' },
  { id: 5, name: 'Spigen Tough Armor', maker: 'Spigen', price: 2980, type: 'accessory', emoji: '🛡️', spec: 'iPhone 16 Pro Max対応', url: 'https://www.spigen.com/jp/' },
  { id: 6, name: 'Anker MagGo Charger', maker: 'Anker', price: 4980, type: 'accessory', emoji: '🔋', spec: 'MagSafe対応 / 15W', url: 'https://www.ankerjapan.com/' },
  { id: 7, name: 'Peak Design Mobile Case', maker: 'Peak Design', price: 8800, type: 'accessory', emoji: '📦', spec: 'Pixel 9 Pro対応', url: 'https://www.peakdesign.com/collections/mobile' },
  { id: 8, name: 'Belkin ScreenForce Pro', maker: 'Belkin', price: 3480, type: 'accessory', emoji: '🔲', spec: 'Samsung S25 Ultra対応', url: 'https://www.belkin.com/jp/' },
];

const ShopScreen = () => {
  const { user, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [compareList, setCompareList] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [addingId, setAddingId] = useState(null);

  // Firestoreカートをリアルタイム購読
  useEffect(() => {
    if (!user) { setCartItems([]); return; }
    const ref = collection(db, 'carts', user.uid, 'items');
    const unsub = onSnapshot(ref, (snap) => {
      setCartItems(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeTab === 'phone' && p.type !== 'phone') return false;
      if (activeTab === 'accessory' && p.type !== 'accessory') return false;
      if (activeTab === 'fav' && !favs.has(p.id)) return false;
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()) && !p.maker.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, keyword, favs]);

  const addToCart = async (product) => {
    if (!user) { setLoginPrompt(true); return; }
    setAddingId(product.id);
    try {
      await addDoc(collection(db, 'carts', user.uid, 'items'), {
        productId: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        url: product.url,
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
  const compareItems = PRODUCTS.filter((p) => compareList.has(p.id));

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
                <div className="product-price">¥{p.price.toLocaleString()}</div>
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
