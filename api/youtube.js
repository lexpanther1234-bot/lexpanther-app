// api/youtube.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = (process.env.YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY || '').trim().replace(/[^\x20-\x7E]/g, '');
  if (!apiKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY is not set' });

  // --- GET: マルチクエリ or ブランド別 ---
  if (req.method === 'GET') {
    const { brand, pageToken } = req.query;

    // Firestoreのbrand一覧に基づくクエリ（16ブランド）
    const BRAND_QUERIES = [
      'Samsung Galaxy review 2026',
      'iPhone Apple review 2026',
      'Xiaomi review 2026',
      'OnePlus review 2026',
      'Google Pixel review 2026',
      'OPPO Find review 2026',
      'Sony Xperia review 2026',
      'Nothing Phone review 2026',
      'Motorola review 2026',
      'Realme review 2026',
      'Honor review 2026',
      'ASUS ROG Phone review 2026',
      'Nubia RedMagic review 2026',
      'Sharp AQUOS review 2026',
      'ZTE review 2026',
      'Lenovo Legion Phone review 2026',
    ];

    try {
      // 単一ブランド指定の場合
      if (brand && brand !== 'all') {
        const query = encodeURIComponent(`${brand} smartphone review 2026`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&order=date&maxResults=20&relevanceLanguage=en&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data });
        return res.status(200).json(data);
      }

      // マルチクエリ：複数ブランドを並列取得（クォータ節約のため10クエリ×5件）
      const queries = BRAND_QUERIES.slice(0, 10);
      const results = await Promise.allSettled(
        queries.map(async (q) => {
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&order=date&maxResults=5&relevanceLanguage=en&key=${apiKey}`;
          const response = await fetch(url);
          if (!response.ok) return [];
          const data = await response.json();
          return data.items || [];
        })
      );

      // 結果をまとめて重複除去・日付順ソート
      const seen = new Set();
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .filter(item => {
          const vid = item.id?.videoId;
          if (!vid || seen.has(vid)) return false;
          seen.add(vid);
          return true;
        })
        .sort((a, b) =>
          new Date(b.snippet?.publishedAt) - new Date(a.snippet?.publishedAt)
        );

      return res.status(200).json({ items: allItems, kind: 'multi-query' });
    } catch (err) {
      console.error('YouTube API error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // --- POST: 既存の汎用プロキシ（後方互換） ---
  if (req.method === 'POST') {
    const { path, params } = req.body;
    if (!path) return res.status(400).json({ error: 'path is required' });

    const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
    Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
    url.searchParams.set('key', apiKey);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data });
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
