export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    // Reddit全体で検索（サブレディット制限なし）
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}+smartphone&sort=top&limit=8&t=all`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LexPanther/1.0 (web review aggregator)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ posts: [] });
    }

    const data = await response.json();
    const posts = (data.data?.children || [])
      .filter(c => {
        const sub = c.data.subreddit.toLowerCase();
        return ['android', 'smartphones', 'iphone', 'galaxy', 'pixel',
                'apple', 'oneplussupport', 'xiaomi', 'samsung'].some(s => sub.includes(s))
               || c.data.score > 10;
      })
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
