export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, params } = req.body;
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', process.env.YOUTUBE_API_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();
  res.status(response.status).json(data);
}
