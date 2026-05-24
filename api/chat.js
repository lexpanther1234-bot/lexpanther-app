// api/chat.js — DeepSeek V4 Flash 対応版
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'DEEPSEEK_API_KEY not set' });

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  // 空メッセージを除去
  const cleanMessages = messages
    .filter(m => m.content && m.content.trim() !== '')
    .map(m => ({ role: m.role, content: m.content.trim() }));

  try {
    // DeepSeekはOpenAI互換フォーマットで動作する
    const body = {
      model: 'deepseek-v4-flash',
      messages: [
        // システムプロンプトをmessagesの先頭に追加
        ...(system ? [{ role: 'system', content: system }] : []),
        ...cleanMessages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    };

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('DeepSeek API error:', err);
      return res.status(response.status).json({ error: 'DeepSeek API error', detail: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // フロントエンドが期待するAnthropicレスポンス形式で返す（互換性維持）
    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    console.error('api/chat error:', err);
    return res.status(500).json({ error: err.message });
  }
}
