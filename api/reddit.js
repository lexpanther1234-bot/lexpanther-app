export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, after, page } = req.query;
  if (!q) return res.status(400).json({ error: 'query required' });

  try {
    // Reddit RSS はJSON APIと違いデータセンターIPをブロックしない
    const count = page ? (parseInt(page, 10) - 1) * 10 : 0;
    let url = `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`;
    if (count > 0) url += `&count=${count}`;
    if (after) url += `&after=${encodeURIComponent(after)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LexPanther/1.0)',
        'Accept': 'application/atom+xml',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ posts: [], error: `HTTP ${response.status}` });
    }

    const xml = await response.text();

    // Simple XML parsing without external dependencies
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const get = (tag) => {
        const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : '';
      };
      const getAttr = (tag, attr) => {
        const m = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>|<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
        return m ? (m[1] || m[2] || '').replace(/&amp;/g, '&') : '';
      };

      const title = get('title');
      const author = get('name');
      const link = getAttr('link', 'href');
      const content = get('content');
      const category = getAttr('category', 'label');
      const updated = get('updated');

      // IDをリンクから生成
      const idMatch = link.match(/comments\/([a-z0-9]+)\//);
      const id = idMatch ? idMatch[1] : title.slice(0, 20);

      // HTMLコンテンツからテキスト抽出
      const textContent = content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500);

      entries.push({
        id,
        subreddit: category.replace('r/', ''),
        author: author.replace('/u/', ''),
        title,
        selftext: textContent,
        score: 0,
        numComments: 0,
        link,
        updated,
      });
    }

    // afterトークンを取得（次ページ用）
    // RSSにはafterがないのでエントリ数で判定
    const hasMore = entries.length >= 10;

    return res.status(200).json({ posts: entries, hasMore });
  } catch (err) {
    console.error('Reddit RSS error:', err.message);
    return res.status(200).json({ posts: [], error: err.message });
  }
}
