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

    const sanitized = Buffer.from(bodyStr, 'utf8').toString('utf8');

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
