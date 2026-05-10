// api/bilibili.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { keyword } = req.query;
  const q = keyword || 'スマートフォン レビュー';

  try {
    const url = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(q)}&order=pubdate&page=1&pagesize=10`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });

    if (!response.ok) throw new Error(`Bilibili HTTP ${response.status}`);
    const data = await response.json();

    if (data.code !== 0) {
      return res.status(200).json({ videos: [] });
    }

    const videos = (data.data?.result || []).map(v => ({
      id:        v.bvid,
      title:     v.title.replace(/<[^>]+>/g, ''), // HTMLタグ除去
      author:    v.author,
      thumbnail: v.pic.startsWith('//') ? `https:${v.pic}` : v.pic,
      duration:  v.duration,
      play:      v.play,
      pubdate:   v.pubdate,
      url:       `https://www.bilibili.com/video/${v.bvid}`,
      platform:  'bilibili',
    }));

    return res.status(200).json({ videos });
  } catch (err) {
    console.error('Bilibili API error:', err);
    return res.status(200).json({ videos: [] }); // エラーでも空配列で返す
  }
}
