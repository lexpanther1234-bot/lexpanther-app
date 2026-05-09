export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  // Reddit blocks requests without proper User-Agent and may block datacenter IPs.
  // Try multiple approaches: direct fetch, then CORS proxy fallback.

  const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=15&t=all`;

  const tryFetch = async (url, headers) => {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };

  let data = null;

  // Attempt 1: Direct fetch with browser-like User-Agent
  try {
    data = await tryFetch(redditUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
    });
  } catch (e) {
    console.log('Direct fetch failed:', e.message);
  }

  // Attempt 2: Via allorigins proxy
  if (!data || !data.data) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(redditUrl)}`;
      data = await tryFetch(proxyUrl, {
        'Accept': 'application/json',
      });
    } catch (e) {
      console.log('Proxy fetch failed:', e.message);
    }
  }

  if (!data || !data.data) {
    return res.status(200).json({ posts: [] });
  }

  try {
    const posts = (data.data?.children || [])
      .slice(0, 5)
      .map(c => ({
        id:          c.data.id,
        subreddit:   c.data.subreddit,
        author:      c.data.author,
        title:       c.data.title,
        selftext:    c.data.selftext || '',
        score:       c.data.score,
        numComments: c.data.num_comments,
      }));

    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Reddit parse error:', err.message);
    return res.status(200).json({ posts: [] });
  }
}
