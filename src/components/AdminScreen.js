import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, updateDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './AdminScreen.css';

const STATUS_LABELS = {
  pending:    '⏳ 未対応',
  contacted:  '📞 連絡済み',
  in_repair:  '🔧 修理中',
  done:       '✅ 完了',
};

const EMPTY_PHONE = {
  name: '', brand: '', price: 0, image: '', category: 'flagship', releaseYear: 2025,
  specs: { cpu: '', ram: '', storage: '', camera: '', battery: '', display: '' },
  scores: { overall: 0, fps: 0, camera: 0, battery: 0 },
  benchmarks: { antutu: 0, geekbench_single: 0, geekbench_multi: 0, dmark: 0 },
  weight: '', charge: '', shopUrl: '',
  stock: 0, hasCase: false, hasGlass: false, tecApproved: true,
  isNew: false, isSale: false, salePrice: 0, saleUntilStr: '',
};

const EMPTY_INFLUENCER = {
  name: '', platform: 'YouTube', subscribers: '', rating: 0, summary: '', url: '', avatarUrl: '',
};

const AdminScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PHONE);
  const [docId, setDocId] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Influencer reviews
  const [adminTab, setAdminTab] = useState('phones');
  const [infPhoneId, setInfPhoneId] = useState('');
  const [infReviews, setInfReviews] = useState([]);
  const [infForm, setInfForm] = useState(EMPTY_INFLUENCER);
  const [infEditing, setInfEditing] = useState(null);
  const [infSaving, setInfSaving] = useState(false);

  // Repair requests
  const [repairRequests, setRepairRequests] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'repairRequests'), orderBy('createdAt', 'desc')),
      snap => setRepairRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Repair requests load error:', err)
    );
    return () => unsub();
  }, []);

  const updateRepairStatus = async (id, status) => {
    await updateDoc(doc(db, 'repairRequests', id), { status });
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPhones(data);
      if (data.length > 0 && !infPhoneId) setInfPhoneId(data[0].id);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!infPhoneId) return;
    const unsub = onSnapshot(
      collection(db, 'phones', infPhoneId, 'influencerReviews'),
      (snap) => setInfReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [infPhoneId]);

  if (!user) {
    return (
      <div className="admin-screen">
        <h2 className="admin-title">管理画面</h2>
        <div className="admin-login">
          <p>管理画面を利用するにはログインが必要です</p>
          <button className="admin-login-btn" onClick={signIn}>Googleでログイン</button>
        </div>
      </div>
    );
  }

  const startAdd = () => {
    setEditing('new');
    setForm(EMPTY_PHONE);
    setDocId('');
  };

  const startEdit = (phone) => {
    setEditing(phone.id);
    setDocId(phone.id);
    setForm({
      name: phone.name || '',
      brand: phone.brand || '',
      price: phone.price || 0,
      image: phone.image || '',
      category: phone.category || 'flagship',
      releaseYear: phone.releaseYear || 2025,
      specs: { ...EMPTY_PHONE.specs, ...phone.specs },
      scores: { ...EMPTY_PHONE.scores, ...phone.scores },
      weight: phone.weight || '',
      charge: phone.charge || '',
      shopUrl: phone.shopUrl || '',
      benchmarks: { ...EMPTY_PHONE.benchmarks, ...phone.benchmarks },
      stock: phone.stock || 0,
      hasCase: phone.hasCase || false,
      hasGlass: phone.hasGlass || false,
      tecApproved: phone.tecApproved !== false,
      isNew: phone.isNew || false,
      isSale: phone.isSale || false,
      salePrice: phone.salePrice || 0,
      saleUntilStr: phone.saleUntil?.toDate ? phone.saleUntil.toDate().toISOString().slice(0, 16) : '',
    });
  };

  const handleSave = async () => {
    const id = editing === 'new' ? docId.trim() : editing;
    if (!id || !form.name.trim()) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        releaseYear: Number(form.releaseYear),
        scores: {
          overall: Number(form.scores.overall),
          fps: Number(form.scores.fps),
          camera: Number(form.scores.camera),
          battery: Number(form.scores.battery),
        },
        benchmarks: {
          antutu: Number(form.benchmarks?.antutu) || 0,
          geekbench_single: Number(form.benchmarks?.geekbench_single) || 0,
          geekbench_multi: Number(form.benchmarks?.geekbench_multi) || 0,
          dmark: Number(form.benchmarks?.dmark) || 0,
        },
        stock: Number(form.stock) || 0,
        hasCase: Boolean(form.hasCase),
        hasGlass: Boolean(form.hasGlass),
        tecApproved: Boolean(form.tecApproved),
        isNew: Boolean(form.isNew),
        isSale: Boolean(form.isSale),
        salePrice: Number(form.salePrice) || 0,
        ...(form.saleUntilStr ? { saleUntil: Timestamp.fromDate(new Date(form.saleUntilStr)) } : {}),
      };
      await setDoc(doc(db, 'phones', id), data);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specs: form.specs,
          price: Number(form.price),
          category: form.category,
        }),
      });
      const data = await res.json();
      if (data.scores) {
        setForm(prev => ({
          ...prev,
          scores: {
            overall: data.scores.overall,
            fps: data.scores.fps,
            camera: data.scores.camera,
            battery: data.scores.battery,
          },
        }));
      }
    } catch (err) {
      console.error('Score generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('この機種を削除しますか？')) return;
    await deleteDoc(doc(db, 'phones', id));
  };

  const updateField = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        next[parent] = { ...next[parent], [child]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const handleSaveInfluencer = async () => {
    if (!infPhoneId || !infForm.name.trim()) return;
    setInfSaving(true);
    try {
      if (infEditing) {
        await setDoc(doc(db, 'phones', infPhoneId, 'influencerReviews', infEditing), {
          ...infForm,
          rating: Number(infForm.rating),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'phones', infPhoneId, 'influencerReviews'), {
          ...infForm,
          rating: Number(infForm.rating),
          createdAt: serverTimestamp(),
        });
      }
      setInfForm(EMPTY_INFLUENCER);
      setInfEditing(null);
    } finally {
      setInfSaving(false);
    }
  };

  const startEditInfluencer = (r) => {
    setInfEditing(r.id);
    setInfForm({
      name: r.name || '',
      platform: r.platform || 'YouTube',
      subscribers: r.subscribers || '',
      rating: r.rating || 0,
      summary: r.summary || '',
      url: r.url || '',
      avatarUrl: r.avatarUrl || '',
    });
  };

  const handleDeleteInfluencer = async (id) => {
    if (!window.confirm('このレビューを削除しますか？')) return;
    await deleteDoc(doc(db, 'phones', infPhoneId, 'influencerReviews', id));
  };

  return (
    <div className="admin-screen">
      <h2 className="admin-title">管理画面</h2>

      <div className="admin-tabs">
        <button className={`admin-tab-btn ${adminTab === 'phones' ? 'active' : ''}`} onClick={() => setAdminTab('phones')}>📱 機種管理</button>
        <button className={`admin-tab-btn ${adminTab === 'influencer' ? 'active' : ''}`} onClick={() => setAdminTab('influencer')}>🎬 インフルエンサー</button>
        <button className={`admin-tab-btn ${adminTab === 'repair' ? 'active' : ''}`} onClick={() => setAdminTab('repair')}>🔧 修理管理</button>
      </div>

      {adminTab === 'phones' && (
        <>
          <button className="admin-add-btn" onClick={startAdd}>+ 機種を追加</button>

          {editing !== null && (
            <div className="admin-form">
              <h3 className="form-title">{editing === 'new' ? '新規追加' : '編集'}</h3>
              {editing === 'new' && (
                <label className="form-row">
                  <span>ドキュメントID</span>
                  <input value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="例: s26u" />
                </label>
              )}
              <label className="form-row">
                <span>機種名</span>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </label>
              <label className="form-row">
                <span>メーカー</span>
                <input value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
              </label>
              <label className="form-row">
                <span>価格（数値）</span>
                <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
              </label>
              <label className="form-row">
                <span>画像URL</span>
                <input value={form.image} onChange={(e) => updateField('image', e.target.value)} />
              </label>
              <label className="form-row">
                <span>カテゴリ</span>
                <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                  <option value="flagship">Flagship</option>
                  <option value="midrange">Midrange</option>
                  <option value="budget">Budget</option>
                </select>
              </label>
              <label className="form-row">
                <span>発売年</span>
                <input type="number" value={form.releaseYear} onChange={(e) => updateField('releaseYear', e.target.value)} />
              </label>
              <label className="form-row">
                <span>重量</span>
                <input value={form.weight} onChange={(e) => updateField('weight', e.target.value)} />
              </label>
              <label className="form-row">
                <span>充電速度</span>
                <input value={form.charge} onChange={(e) => updateField('charge', e.target.value)} />
              </label>
              <label className="form-row">
                <span>購入URL</span>
                <input value={form.shopUrl} onChange={(e) => updateField('shopUrl', e.target.value)} />
              </label>

              <h4 className="form-section">SHOP設定</h4>
              <label className="form-row">
                <span>在庫数</span>
                <input type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} placeholder="0=非表示" />
              </label>
              <label className="form-row" style={{ cursor: 'pointer' }}>
                <span>ケースオプション</span>
                <input type="checkbox" checked={form.hasCase} onChange={(e) => updateField('hasCase', e.target.checked)} style={{ width: 'auto' }} />
              </label>
              <label className="form-row" style={{ cursor: 'pointer' }}>
                <span>保護ガラスオプション</span>
                <input type="checkbox" checked={form.hasGlass} onChange={(e) => updateField('hasGlass', e.target.checked)} style={{ width: 'auto' }} />
              </label>
              <label className="form-row" style={{ cursor: 'pointer' }}>
                <span>技適取得済み</span>
                <input type="checkbox" checked={form.tecApproved} onChange={(e) => updateField('tecApproved', e.target.checked)} style={{ width: 'auto' }} />
              </label>

              <h4 className="form-section">在庫・セール管理</h4>
              <label className="form-row" style={{ cursor: 'pointer' }}>
                <span>新着フラグ</span>
                <input type="checkbox" checked={form.isNew || false} onChange={(e) => updateField('isNew', e.target.checked)} style={{ width: 'auto' }} />
              </label>
              <label className="form-row" style={{ cursor: 'pointer' }}>
                <span>セール中</span>
                <input type="checkbox" checked={form.isSale || false} onChange={(e) => updateField('isSale', e.target.checked)} style={{ width: 'auto' }} />
              </label>
              {form.isSale && (
                <>
                  <label className="form-row">
                    <span>セール価格</span>
                    <input type="number" value={form.salePrice || ''} onChange={(e) => updateField('salePrice', e.target.value)} placeholder="例: 89000" />
                  </label>
                  <label className="form-row">
                    <span>セール終了日時</span>
                    <input type="datetime-local" value={form.saleUntilStr || ''} onChange={(e) => updateField('saleUntilStr', e.target.value)} />
                  </label>
                </>
              )}

              <h4 className="form-section">スペック</h4>
              {['cpu', 'ram', 'storage', 'camera', 'battery', 'display'].map((key) => (
                <label className="form-row" key={key}>
                  <span>{key.toUpperCase()}</span>
                  <input value={form.specs[key]} onChange={(e) => updateField(`specs.${key}`, e.target.value)} />
                </label>
              ))}

              <h4 className="form-section">スコア</h4>
              <button className="admin-add-btn" onClick={handleAutoGenerate} disabled={generating} style={{ marginBottom: '12px', fontSize: '12px' }}>
                {generating ? '生成中...' : '🤖 AIスコア自動生成'}
              </button>
              {['overall', 'fps', 'camera', 'battery'].map((key) => (
                <label className="form-row" key={key}>
                  <span>{key}</span>
                  <input type="number" value={form.scores[key]} onChange={(e) => updateField(`scores.${key}`, e.target.value)} />
                </label>
              ))}

              <h4 className="form-section">ベンチマークスコア</h4>
              {[
                { key: 'antutu', label: 'Antutu', placeholder: '例: 2100000' },
                { key: 'geekbench_single', label: 'Geekbench Single', placeholder: '例: 3200' },
                { key: 'geekbench_multi', label: 'Geekbench Multi', placeholder: '例: 8500' },
                { key: 'dmark', label: '3DMark Wild Life', placeholder: '例: 12000' },
              ].map(b => (
                <label className="form-row" key={b.key}>
                  <span>{b.label}</span>
                  <input
                    type="number"
                    placeholder={b.placeholder}
                    value={form.benchmarks?.[b.key] || ''}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      benchmarks: { ...prev.benchmarks, [b.key]: e.target.value }
                    }))}
                  />
                </label>
              ))}

              <div className="form-actions">
                <button className="form-save" onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
                <button className="form-cancel" onClick={() => setEditing(null)}>キャンセル</button>
              </div>
            </div>
          )}

          <div className="admin-list">
            {phones.map((phone) => (
              <div key={phone.id} className="admin-item">
                <div className="admin-item-info">
                  <div className="admin-item-name">{phone.name}</div>
                  <div className="admin-item-meta">{phone.brand} · {phone.releaseYear} · ¥{(phone.price || 0).toLocaleString()}</div>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-edit-btn" onClick={() => startEdit(phone)}>編集</button>
                  <button className="admin-cache-clear-btn" onClick={async () => {
                    await deleteDoc(doc(db, 'aiReviewCache', phone.id));
                    alert('AIレビューキャッシュを削除しました。');
                  }}>🗑 AICache</button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(phone.id)}>削除</button>
                </div>
              </div>
            ))}
            {phones.length === 0 && <p className="admin-empty">機種データがありません</p>}
          </div>
        </>
      )}

      {adminTab === 'influencer' && (
        <>
          <select className="inf-phone-select" value={infPhoneId} onChange={e => setInfPhoneId(e.target.value)}>
            {phones.map(p => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
          </select>

          <div className="admin-form">
            <h3 className="form-title">{infEditing ? 'レビュー編集' : 'インフルエンサーレビュー追加'}</h3>
            <label className="form-row">
              <span>レビュアー名</span>
              <input value={infForm.name} onChange={e => setInfForm(prev => ({ ...prev, name: e.target.value }))} />
            </label>
            <label className="form-row">
              <span>プラットフォーム</span>
              <select value={infForm.platform} onChange={e => setInfForm(prev => ({ ...prev, platform: e.target.value }))}>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="Blog">Blog</option>
                <option value="X">X (Twitter)</option>
              </select>
            </label>
            <label className="form-row">
              <span>登録者数</span>
              <input value={infForm.subscribers} onChange={e => setInfForm(prev => ({ ...prev, subscribers: e.target.value }))} placeholder="例: 100万人" />
            </label>
            <label className="form-row">
              <span>評価 (1-10)</span>
              <input type="number" min="1" max="10" value={infForm.rating} onChange={e => setInfForm(prev => ({ ...prev, rating: e.target.value }))} />
            </label>
            <label className="form-row">
              <span>アバターURL</span>
              <input value={infForm.avatarUrl} onChange={e => setInfForm(prev => ({ ...prev, avatarUrl: e.target.value }))} />
            </label>
            <label className="form-row">
              <span>レビューURL</span>
              <input value={infForm.url} onChange={e => setInfForm(prev => ({ ...prev, url: e.target.value }))} />
            </label>
            <label className="form-row" style={{ alignItems: 'flex-start' }}>
              <span>サマリー</span>
              <textarea
                value={infForm.summary}
                onChange={e => setInfForm(prev => ({ ...prev, summary: e.target.value }))}
                rows={3}
                style={{ flex: 1, background: '#0a0a0a', border: '1px solid #1a2a1a', color: '#e8e8e8', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </label>
            <div className="form-actions">
              <button className="form-save" onClick={handleSaveInfluencer} disabled={infSaving}>
                {infSaving ? '保存中...' : infEditing ? '更新' : '追加'}
              </button>
              {infEditing && (
                <button className="form-cancel" onClick={() => { setInfEditing(null); setInfForm(EMPTY_INFLUENCER); }}>キャンセル</button>
              )}
            </div>
          </div>

          <div className="admin-list">
            {infReviews.map(r => (
              <div key={r.id} className="admin-item">
                <div className="admin-item-info">
                  <div className="admin-item-name">{r.name} ({r.platform})</div>
                  <div className="admin-item-meta">評価: {r.rating}/10 · {r.summary?.slice(0, 40)}...</div>
                </div>
                <div className="admin-item-actions">
                  <button className="admin-edit-btn" onClick={() => startEditInfluencer(r)}>編集</button>
                  <button className="admin-delete-btn" onClick={() => handleDeleteInfluencer(r.id)}>削除</button>
                </div>
              </div>
            ))}
            {infReviews.length === 0 && <p className="admin-empty">インフルエンサーレビューがありません</p>}
          </div>
        </>
      )}

      {adminTab === 'repair' && (
        <>
          <div className="admin-list">
            {repairRequests.length === 0 && <p className="admin-empty">修理申し込みがありません</p>}
            {repairRequests.map(req => (
              <div key={req.id} className="admin-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="admin-item-name">{req.phoneName}</div>
                  <span style={{ fontSize: '11px' }}>{STATUS_LABELS[req.status] || req.status}</span>
                </div>
                <div className="admin-item-meta">
                  症状: {req.symptoms?.join(', ')} · {req.name} · {req.email}
                </div>
                {req.detail && <div className="admin-item-meta" style={{ color: '#666' }}>{req.detail}</div>}
                {req.photoUrls?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {req.photoUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`添付${i + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #222' }} />
                      </a>
                    ))}
                  </div>
                )}
                <div className="admin-item-meta" style={{ color: '#444' }}>
                  {req.createdAt?.toDate?.()?.toLocaleString('ja-JP') || '—'}
                </div>
                <div className="admin-item-actions">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className={req.status === key ? 'admin-edit-btn' : 'admin-cache-clear-btn'}
                      onClick={() => updateRepairStatus(req.id, key)}
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminScreen;
