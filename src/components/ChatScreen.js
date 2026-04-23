import React, { useState, useRef, useEffect } from 'react';
import './ChatScreen.css';

// ─────────────────────────────────────────
// Anthropic API設定
// .env ファイルに以下を追加してください:
//   REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
// ─────────────────────────────────────────

const SYSTEM_PROMPT = `あなたはLexPantherアプリの専属AIアシスタント「LEX」です。
海外スマートフォンに精通した、品格ある執事のような口調でお答えください。

口調のルール：
- ユーザーのことは「貴方様」と呼ぶ
- 丁寧で落ち着いた執事風の言葉遣い（「〜でございます」「かしこまりました」「左様でございますか」など）
- ただし堅苦しくなりすぎず、スマホへの熱意は自然に表現する
- 絵文字は控えめに、使う場合は🎩や📱など品のあるものを

得意分野：
- 海外スマートフォンの機種比較・選び方
- カメラ性能・スペック解説
- コスパ・予算別おすすめ
- 最新フラッグシップ情報（Samsung・Apple・Google・Xiaomi・Sony・OnePlusなど）
- アクセサリー選び

スマホ以外の質問にも対応しますが、自然にスマホ話題に戻すよう心がけてください。`;

const SUGGESTIONS = [
  '今一番おすすめのスマホは？',
  'カメラ重視で選ぶなら？',
  '10万以下のコスパ最強は？',
  'Galaxy vs iPhoneどっちが良い？',
];

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'assistant',
      content: 'お待ちしておりました。私はLEX、貴方様の専属スマートフォンアドバイザーでございます🎩\n\nスマホ選びから最新機種の比較、カメラ性能まで、何なりとお申し付けくださいませ。',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setShowSuggestions(false);

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userText },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== 'init')
        .map((m) => ({ role: m.role, content: m.content }));

      // initメッセージはsystem promptに含まれるので除外
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'ご返答に支障が生じました。もう一度お試しくださいませ。';

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '申し訳ございません、通信に支障が生じたようでございます。しばらくしてからもう一度お試しくださいませ。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-screen">
      <div className="chat-header">
        <div className="mascot-icon">🐆</div>
        <div className="mascot-info">
          <div className="mascot-name">LEX — AI Advisor</div>
          <div className="mascot-status">
            <div className="status-dot"></div>
            スマホ何でもご相談くださいませ
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.role === 'user' ? 'user' : ''}`}>
            <div className="msg-avatar">{msg.role === 'user' ? '👤' : '🐆'}</div>
            <div>
              <div className="msg-bubble">
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg">
            <div className="msg-avatar">🐆</div>
            <div className="msg-bubble">
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="sug-btn" onClick={() => sendMessage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="スマホについて何でも聞いてください..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
