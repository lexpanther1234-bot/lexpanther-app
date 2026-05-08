import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './AdminScreen.css';

const EMPTY_PHONE = {
  name: '', brand: '', price: 0, image: '', category: 'flagship', releaseYear: 2025,
  specs: { cpu: '', ram: '', storage: '', camera: '', battery: '', display: '' },
  scores: { overall: 0, fps: 0, camera: 0, battery: 0 },
  weight: '', charge: '', shopUrl: '',
};

const AdminScreen = () => {
  const { user, signIn } = useAuth();
  const [phones, setPhones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PHONE);
  const [docId, setDocId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'phones'), (snap) => {
      setPhones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

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
      };
      await setDoc(doc(db, 'phones', id), data);
      setEditing(null);
    } finally {
      setSaving(false);
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

  return (
    <div className="admin-screen">
      <h2 className="admin-title">管理画面</h2>
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

          <h4 className="form-section">スペック</h4>
          {['cpu', 'ram', 'storage', 'camera', 'battery', 'display'].map((key) => (
            <label className="form-row" key={key}>
              <span>{key.toUpperCase()}</span>
              <input value={form.specs[key]} onChange={(e) => updateField(`specs.${key}`, e.target.value)} />
            </label>
          ))}

          <h4 className="form-section">スコア</h4>
          {['overall', 'fps', 'camera', 'battery'].map((key) => (
            <label className="form-row" key={key}>
              <span>{key}</span>
              <input type="number" value={form.scores[key]} onChange={(e) => updateField(`scores.${key}`, e.target.value)} />
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
              <button className="admin-delete-btn" onClick={() => handleDelete(phone.id)}>削除</button>
            </div>
          </div>
        ))}
        {phones.length === 0 && <p className="admin-empty">機種データがありません</p>}
      </div>
    </div>
  );
};

export default AdminScreen;
