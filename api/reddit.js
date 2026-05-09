export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    // old.reddit.com はBot/データセンターIPからのアクセスをブロックしない
    const url = `https://old.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexPanther/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ posts: [] });
    }

    const data = await response.json();
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
    console.error('Reddit search error:', err.message);
    return res.status(200).json({ posts: [] });
  }
}
