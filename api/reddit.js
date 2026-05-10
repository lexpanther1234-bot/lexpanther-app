// Vercel Edge Runtime — Cloudflare Workers同等の分散エッジで実行
// ServerlessとはIP帯域が異なるためRedditブロックを回避できる可能性
export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  if (!q) {
    return Response.json({ error: 'query required' }, { status: 400 });
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // 3つの方法を順に試す
  const attempts = [
    {
      name: 'RSS',
      url: `https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`,
      parse: parseRSS,
    },
    {
      name: 'old.reddit JSON',
      url: `https://old.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`,
      parse: parseJSON,
    },
    {
      name: 'www.reddit JSON',
      url: `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=10&t=all`,
      parse: parseJSON,
    },
  ];

  const errors = [];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': attempt.name === 'RSS'
            ? 'application/atom+xml,application/xml,text/xml'
            : 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) {
        errors.push(`${attempt.name}: HTTP ${res.status}`);
        continue;
      }

      const text = await res.text();
      const posts = attempt.parse(text);

      if (posts.length > 0) {
        return new Response(JSON.stringify({ posts, source: attempt.name }), { headers });
      }
      errors.push(`${attempt.name}: 0 posts parsed`);
    } catch (e) {
      errors.push(`${attempt.name}: ${e.message}`);
    }
  }

  return new Response(JSON.stringify({ posts: [], debug: errors }), { headers });
}

function parseRSS(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const get = (tag) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? decodeEntities(m[1]) : '';
    };
    const getAttr = (tag, attr) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*?${attr}="([^"]*)"[^>]*/?>`));
      return m ? decodeEntities(m[1]) : '';
    };

    const title = get('title');
    const author = get('name');
    const link = getAttr('link', 'href');
    const content = get('content');
    const category = getAttr('category', 'label');

    const idMatch = link.match(/comments\/([a-z0-9]+)\//);
    const id = idMatch ? idMatch[1] : title.slice(0, 20);

    const textContent = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);

    entries.push({
      id,
      subreddit: category.replace('r/', '') || 'reddit',
      author: author.replace('/u/', ''),
      title,
      selftext: textContent,
      score: 0,
      numComments: 0,
    });
  }
  return entries.slice(0, 10);
}

function parseJSON(text) {
  try {
    const data = JSON.parse(text);
    return (data.data?.children || []).slice(0, 10).map(c => ({
      id: c.data.id,
      subreddit: c.data.subreddit,
      author: c.data.author,
      title: c.data.title,
      selftext: c.data.selftext || '',
      score: c.data.score,
      numComments: c.data.num_comments,
    }));
  } catch {
    return [];
  }
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, ' ');
}
