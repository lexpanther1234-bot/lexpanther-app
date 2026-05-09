export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter "q"' });

  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q + ' review')}&sort=relevance&limit=10&restrict_sr=false`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LexPanther/1.0' },
    });
    const data = await response.json();
    const posts = (data?.data?.children || [])
      .filter(c => c.data && !c.data.over_18)
      .map(c => ({
        id: c.data.id,
        title: c.data.title,
        subreddit: c.data.subreddit_name_prefixed,
        score: c.data.score,
        numComments: c.data.num_comments,
        url: `https://www.reddit.com${c.data.permalink}`,
        selftext: (c.data.selftext || '').slice(0, 300),
        created: c.data.created_utc,
      }));
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Reddit API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
