export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const messages = req.body.messages || [];
    const system = req.body.system || '';

    const bodyStr = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: system,
      messages: messages,
    });

    // 特殊Unicode文字を除去（ByteStringエラー対策）
    const sanitized = bodyStr
      .replace(/\u2028/g, ' ')   // LINE SEPARATOR
      .replace(/\u2029/g, ' ')   // PARAGRAPH SEPARATOR
      .replace(/\u2026/g, '...') // HORIZONTAL ELLIPSIS
      .replace(/[\u2000-\u200F]/g, ' ') // 各種特殊スペース・制御文字
      .replace(/[\uFFF0-\uFFFF]/g, ''); // 特殊用途文字

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: sanitized,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
