export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Groq API key not configured' });

  try {
    const { system, messages } = req.body;

    // Groq (OpenAI互換API)
    const groqMessages = [];
    if (system) {
      groqMessages.push({ role: 'system', content: system });
    }
    (messages || []).forEach(m => {
      groqMessages.push({ role: m.role, content: m.content });
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', JSON.stringify(data));
      return res.status(response.status).json({ error: data.error?.message || 'Groq API error' });
    }

    // Claude互換のレスポンス形式に変換
    const text = data.choices?.[0]?.message?.content || 'レビューを生成できませんでした。';
    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
