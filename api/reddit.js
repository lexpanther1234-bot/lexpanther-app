export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  const subs = ['Android', 'smartphones', 'iphone'];
  const results = [];

  for (const sub of subs) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(q)}&sort=top&limit=2&restrict_sr=1&t=year`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LexPanther/1.0 (web app; review aggregator)',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const posts = (data.data?.children || []).map(c => ({
        id:          c.data.id,
        subreddit:   c.data.subreddit,
        author:      c.data.author,
        title:       c.data.title,
        selftext:    c.data.selftext || '',
        score:       c.data.score,
        numComments: c.data.num_comments,
        permalink:   c.data.permalink,
      }));
      results.push(...posts);
    } catch (err) {
      console.error(`Reddit fetch error for r/${sub}:`, err.message);
    }
  }

  return res.status(200).json({ posts: results.slice(0, 6) });
}
