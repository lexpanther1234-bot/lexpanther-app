// api/chat.js — Gemini 2.5 Flash 対応版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const body = {
      // システムプロンプト
      ...(system ? {
        system_instruction: {
          parts: [{ text: system }]
        }
      } : {}),
      // メッセージ履歴（Anthropic形式 → Gemini形式に変換）
      contents: messages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature:     0.7,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(response.status).json({ error: 'Gemini API error', detail: err });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // フロントエンドが期待するAnthropicレスポンス形式で返す（互換性維持）
    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    console.error('api/chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
