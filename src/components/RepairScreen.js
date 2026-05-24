import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import './RepairScreen.css';

const SYMPTOMS = [
  { id: 'screen',   label: '📱 画面割れ・不具合' },
  { id: 'battery',  label: '🔋 バッテリー劣化' },
  { id: 'charge',   label: '🔌 充電できない' },
  { id: 'camera',   label: '📷 カメラ不具合' },
  { id: 'sound',    label: '🔊 音声トラブル' },
  { id: 'water',    label: '💧 水没' },
  { id: 'signal',   label: '📶 通信不具合' },
  { id: 'other',    label: '✏️ その他' },
];

const PRICE_GUIDE = [
  { label: '画面交換',         price: '¥8,000〜15,000' },
  { label: 'バッテリー交換',   price: '¥5,000〜8,000' },
  { label: '充電口修理',       price: '¥6,000〜10,000' },
  { label: 'カメラ修理',       price: '¥8,000〜12,000' },
];

const RepairScreen = () => {
  const { user } = useAuth();
  const [phoneName,        setPhoneName]        = useState('');
  const [customPhone,      setCustomPhone]      = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [detail,           setDetail]           = useState('');
  const [name,             setName]             = useState('');
  const [email,            setEmail]            = useState(user?.email || '');
  const [tel,              setTel]              = useState('');
  const [submitting,       setSubmitting]       = useState(false);
  const [submitted,        setSubmitted]        = useState(false);

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const finalPhone = phoneName === 'other' ? customPhone : phoneName;
    if (!finalPhone || selectedSymptoms.length === 0 || !name || !email) {
      alert('機種名・症状・お名前・メールアドレスは必須です。');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'repairRequests'), {
        userId:    user?.uid || null,
        phoneName: finalPhone,
        symptoms:  selectedSymptoms,
        detail:    detail.trim(),
        name:      name.trim(),
        email:     email.trim(),
        phone:     tel.trim(),
        status:    'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Repair submit error:', err);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="repair-screen">
        <div className="repair-success">
          <div className="success-icon">✅</div>
          <div className="success-title">申し込み完了</div>
          <p className="success-text">24時間以内にメールにてご連絡いたします。</p>
          <button className="success-back" onClick={() => setSubmitted(false)}>
            新しい申し込みをする
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="repair-screen">
      <h2 className="repair-title">🔧 修理受付</h2>
      <p className="repair-subtitle">海外スマホの修理をお受けします</p>

      {/* 費用目安 */}
      <div className="price-guide-card">
        <div className="price-guide-title">💰 修理費用の目安</div>
        {PRICE_GUIDE.map(g => (
          <div key={g.label} className="price-guide-row">
            <span className="price-guide-label">{g.label}</span>
            <span className="price-guide-val">{g.price}</span>
          </div>
        ))}
      </div>

      {/* Step 1: 機種 */}
      <div className="repair-step-label"><span className="step-num">1</span> 端末情報</div>
      <select className="repair-select" value={phoneName} onChange={e => setPhoneName(e.target.value)}>
        <option value="">機種を選択...</option>
        <option value="Galaxy S26 Ultra">Galaxy S26 Ultra</option>
        <option value="Galaxy S25 Ultra">Galaxy S25 Ultra</option>
        <option value="Xiaomi 15 Ultra">Xiaomi 15 Ultra</option>
        <option value="iPhone 17 Pro">iPhone 17 Pro</option>
        <option value="Pixel 10 Pro">Pixel 10 Pro</option>
        <option value="OnePlus 13">OnePlus 13</option>
        <option value="other">その他（直接入力）</option>
      </select>
      {phoneName === 'other' && (
        <input
          className="repair-input"
          placeholder="機種名を入力"
          value={customPhone}
          onChange={e => setCustomPhone(e.target.value)}
        />
      )}

      {/* Step 2: 症状 */}
      <div className="repair-step-label"><span className="step-num">2</span> 症状を選択（複数可）</div>
      <div className="symptom-grid">
        {SYMPTOMS.map(s => (
          <div
            key={s.id}
            className={`symptom-chip ${selectedSymptoms.includes(s.id) ? 'selected' : ''}`}
            onClick={() => toggleSymptom(s.id)}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step 3: 詳細・連絡先 */}
      <div className="repair-step-label"><span className="step-num">3</span> 詳細・連絡先</div>
      <textarea
        className="repair-textarea"
        placeholder="症状の詳細（いつから・どのような状況で発生したか等）任意"
        value={detail}
        onChange={e => setDetail(e.target.value)}
        rows={3}
      />
      <input className="repair-input" placeholder="お名前 *" value={name} onChange={e => setName(e.target.value)} />
      <input className="repair-input" type="email" placeholder="メールアドレス *" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="repair-input" type="tel" placeholder="電話番号（任意）" value={tel} onChange={e => setTel(e.target.value)} />

      <button className="repair-submit-btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? '送信中...' : '修理を申し込む →'}
      </button>
      <p className="repair-note">申し込み後、24時間以内にメールにてご連絡します</p>
    </div>
  );
};

export default RepairScreen;
