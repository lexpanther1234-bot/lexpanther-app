import './App.css';

function App() {
  return (
    <div className="app">
      <div className="nav">
        <span className="logo">Lex<span className="logo-accent">Panther</span></span>
      </div>

      <div className="brand-bar">
        <button className="brand-pill active">すべて</button>
        <button className="brand-pill">Xiaomi</button>
        <button className="brand-pill">vivo</button>
        <button className="brand-pill">OPPO</button>
        <button className="brand-pill">iPhone</button>
      </div>

      <div className="content">
        <p className="section-title">最新リーク情報</p>
        <div className="news-card">
          <div className="news-tag">リーク</div>
          <p className="news-title">Xiaomi 15 Ultra — 新カメラスペック流出、200MPセンサー搭載か</p>
          <p className="news-meta">2時間前 · @TechLeaker_JP</p>
        </div>
        <div className="news-card">
          <div className="news-tag blue">公式情報</div>
          <p className="news-title">iPhone 17 Air — 薄型デザイン正式発表、5.5mm厚を実現</p>
          <p className="news-meta">5時間前 · Apple公式</p>
        </div>
      </div>

      <div className="tab-bar">
        <div className="tab active">フィード</div>
        <div className="tab">購入</div>
        <div className="tab">コミュニティ</div>
        <div className="tab">AI相談</div>
      </div>
    </div>
  );
}

export default App;