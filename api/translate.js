export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });

  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const textToTranslate = description
    ? `タイトル: ${title}\n\n本文: ${description.slice(0, 1000)}`
    : `タイトル: ${title}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: '英語のニュース記事を自然な日本語に翻訳してください。JSON形式で返してください: {"title":"翻訳されたタイトル","description":"翻訳された本文"}。翻訳以外の文章は一切出力しないでください。',
          },
          { role: 'user', content: textToTranslate },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Groq translate error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Translation failed' });
    }

    const text = data.choices?.[0]?.message?.content || '';

    // JSONパース試行
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.status(200).json({
          title: parsed.title || title,
          description: parsed.description || description || '',
        });
      }
    } catch (parseErr) {
      // JSONパース失敗時はテキスト全体を返す
    }

    return res.status(200).json({ title: text, description: '' });
  } catch (err) {
    console.error('Translate error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
