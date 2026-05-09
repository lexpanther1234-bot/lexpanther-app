export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  const RELEVANT_SUBS = [
    'android', 'iphone', 'samsung', 'galaxys', 'samsunggalaxy',
    'pixel', 'googlepixel', 'smartphones', 'mobile', 'apple',
    'xiaomi', 'oneplus', 'motorola', 'sony', 'huawei',
    'phonearena', 'pickanandroidforme', 'technology',
  ];

  try {
    // スマホ関連キーワードを追加して検索精度を上げる
    const searchQuery = `${q} (review OR phone OR smartphone OR camera OR battery)`;
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(searchQuery)}&sort=relevance&limit=25&t=all`;
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
        // スマホ関連サブレディットを優先、または本文にphone/reviewを含む
        const isRelevantSub = RELEVANT_SUBS.some(s => sub.includes(s));
        const title = c.data.title.toLowerCase();
        const text = (c.data.selftext || '').toLowerCase();
        const hasPhoneKeyword = [
          'phone', 'smartphone', 'review', 'camera', 'battery',
          'screen', 'display', 'chip', 'processor', 'flagship',
        ].some(kw => title.includes(kw) || text.includes(kw));
        return isRelevantSub || hasPhoneKeyword;
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
