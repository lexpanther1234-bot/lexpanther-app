export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'YOUTUBE_API_KEY is not set' });
  }
  const cleanKey = apiKey.trim().replace(/[^\x20-\x7E]/g, '');

  const { path, params } = req.body;
  if (!path) {
    return res.status(400).json({ error: 'path is required' });
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', cleanKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data, usedKey: cleanKey.slice(0, 10) + '...', keyLength: cleanKey.length });
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
