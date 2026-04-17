import React, { useState, useMemo } from 'react';
import './ShopScreen.css';

const PRODUCTS = [
  { id: 1, name: 'Samsung Galaxy S25 Ultra', maker: 'Samsung', price: 189800, type: 'phone', emoji: '📱', spec: '6.9" / Snapdragon 8 Elite / 200MP' },
  { id: 2, name: 'iPhone 16 Pro Max', maker: 'Apple', price: 198800, type: 'phone', emoji: '📱', spec: '6.9" / A18 Pro / 48MP' },
  { id: 3, name: 'Google Pixel 9 Pro', maker: 'Google', price: 159800, type: 'phone', emoji: '📱', spec: '6.3" / Tensor G4 / 50MP' },
  { id: 4, name: 'Xiaomi 14 Ultra', maker: 'Xiaomi', price: 139800, type: 'phone', emoji: '📱', spec: '6.73" / SD8 Gen3 / Leica 50MP' },
  { id: 5, name: 'Spigen Tough Armor', maker: 'Spigen', price: 2980, type: 'accessory', emoji: '🛡️', spec: 'iPhone 16 Pro Max対応' },
  { id: 6, name: 'Anker MagGo Charger', maker: 'Anker', price: 4980, type: 'accessory', emoji: '🔋', spec: 'MagSafe対応 / 15W' },
  { id: 7, name: 'Peak Design Mobile Case', maker: 'Peak Design', price: 8800, type: 'accessory', emoji: '📦', spec: 'Pixel 9 Pro対応' },
  { id: 8, name: 'Belkin ScreenForce Pro', maker: 'Belkin', price: 3480, type: 'accessory', emoji: '🔲', spec: 'Samsung S25 Ultra対応' },
];

const ShopScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [cart, setCart] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [compareList, setCompareList] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeTab === 'phone' && p.type !== 'phone') return false;
      if (activeTab === 'accessory' && p.type !== 'accessory') return false;
      if (activeTab === 'fav' && !favs.has(p.id)) return false;
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()) && !p.maker.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, keyword, favs]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
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
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);
  const compareItems = PRODUCTS.filter((p) => compareList.has(p.id));

  return (
    <div className="shop-screen">

      <div className="shop-header">
        <h2 className="shop-title">▶ Shop</h2>
        <button className="cart-btn" onClick={() => setCartOpen((v) => !v)}>
          CART
          <span className="cart-badge">{cart.length}</span>
        </button>
      </div>

      <div className="tab-row">
        {[
          { key: 'all', label: 'ALL' },
          { key: 'phone', label: 'スマホ' },
          { key: 'accessory', label: 'アクセサリー' },
          { key: 'fav', label: '♥ お気に入り' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
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
            <div
              key={p.id}
              className={`product-card ${compareList.has(p.id) ? 'compare-on' : ''}`}
            >
              <div className="product-img">{p.emoji}</div>
              <div className="product-body">
                <div className="product-name">{p.name}</div>
                <div className="product-maker">{p.maker}</div>
                <div className="product-price">¥{p.price.toLocaleString()}</div>
                <div className="product-actions">
                  <button className="btn-cart" onClick={() => addToCart(p)}>+ CART</button>
                  <button
                    className={`btn-fav ${favs.has(p.id) ? 'active' : ''}`}
                    onClick={() => toggleFav(p.id)}
                  >♥</button>
                  <button
                    className={`btn-compare ${compareList.has(p.id) ? 'active' : ''}`}
                    onClick={() => toggleCompare(p.id)}
                  >比</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartOpen && (
        <div className="cart-panel">
          <div className="cart-panel-title">CART</div>
          {cart.length === 0 ? (
            <p className="cart-empty">カートは空です</p>
          ) : (
            cart.map((p, i) => (
              <div key={i} className="cart-item">
                <span className="cart-item-name">{p.name}</span>
                <span className="cart-item-price">¥{p.price.toLocaleString()}</span>
              </div>
            ))
          )}
          <div className="cart-total">
            <span className="cart-total-label">合計</span>
            <span className="cart-total-price">¥{cartTotal.toLocaleString()}</span>
          </div>
          <button className="checkout-btn">購入手続きへ →</button>
        </div>
      )}

    </div>
  );
};

export default ShopScreen;
