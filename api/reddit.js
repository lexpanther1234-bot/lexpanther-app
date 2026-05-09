export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  const errors = [];

  // Attempt 1: old.reddit.com
  try {
    const url1 = `https://old.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`;
    const r1 = await fetch(url1, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexPanther/1.0)',
        'Accept': 'application/json',
      },
    });
    if (r1.ok) {
      const data = await r1.json();
      const posts = (data.data?.children || []).slice(0, 5).map(c => ({
        id: c.data.id, subreddit: c.data.subreddit, author: c.data.author,
        title: c.data.title, selftext: c.data.selftext || '',
        score: c.data.score, numComments: c.data.num_comments,
      }));
      if (posts.length > 0) return res.status(200).json({ posts, source: 'old.reddit' });
    }
    errors.push(`old.reddit: HTTP ${r1.status}`);
  } catch (e) {
    errors.push(`old.reddit: ${e.message}`);
  }

  // Attempt 2: www.reddit.com with browser UA
  try {
    const url2 = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`;
    const r2 = await fetch(url2, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8',
      },
    });
    if (r2.ok) {
      const data = await r2.json();
      const posts = (data.data?.children || []).slice(0, 5).map(c => ({
        id: c.data.id, subreddit: c.data.subreddit, author: c.data.author,
        title: c.data.title, selftext: c.data.selftext || '',
        score: c.data.score, numComments: c.data.num_comments,
      }));
      if (posts.length > 0) return res.status(200).json({ posts, source: 'www.reddit' });
    }
    errors.push(`www.reddit: HTTP ${r2.status}`);
  } catch (e) {
    errors.push(`www.reddit: ${e.message}`);
  }

  // Return debug info
  return res.status(200).json({ posts: [], debug: errors });
}
