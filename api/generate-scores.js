// チップセット→パフォーマンススコアのマッピング（seedPhones.jsの平均値ベース）
const CHIPSET_PERF = {
  'A19 Pro': 98, 'A18 Pro': 98, 'Snapdragon 8 Gen 2 Leading': 99, 'Snapdragon 8 Gen 3 Leading': 99,
  'SD 8 Elite Gen5': 97, 'A17 Pro': 96, 'Snapdragon 8 Elite': 96, 'Snapdragon 8 Elite 2': 96,
  'Dimensity 9400': 94, 'Snapdragon 8 Gen 3': 94, 'A19': 93, 'A18': 92, 'A16 Bionic': 92,
  'Dimensity 9300+': 92, 'Dimensity 9300': 91, 'Snapdragon 8 Gen 2': 91, 'Exynos 2400': 90,
  'A15 Bionic': 89, 'Dimensity 9200+': 89, 'Snapdragon 8 Gen 1': 89, 'Snapdragon 8+ Gen 1': 89,
  'A14 Bionic': 85, 'Kirin 9020': 88, 'Kirin 9010': 87, 'Dimensity 9200': 87, 'Kirin 9000S': 85,
  'Google Tensor G4': 87, 'Google Tensor G3': 85, 'Google Tensor G2': 82, 'Google Tensor': 80,
  'Dimensity 9000+': 86, 'Dimensity 9000': 84, 'Snapdragon 8+ Gen 1 (4G)': 87, 'Exynos 2100': 84,
  'Snapdragon 888': 82, 'Snapdragon 888+': 83, 'Snapdragon 888 (4G)': 82, 'Snapdragon 870': 80,
  'Snapdragon 865': 79, 'Exynos 990': 78, 'Kirin 9000': 83, 'Kirin 990 5G': 76, 'Kirin 8000': 78,
  'Dimensity 8400': 82, 'Dimensity 8350': 80, 'Dimensity 8300': 78, 'Dimensity 8200': 76,
  'Dimensity 8100': 75, 'Dimensity 8100-Max': 76, 'Dimensity 8020': 73, 'Snapdragon 8s Gen 3': 80,
  'Snapdragon 7+ Gen 3': 79, 'Snapdragon 7+ Gen 2': 76, 'Snapdragon 7 Gen 3': 74,
  'Snapdragon 7 Gen 1': 72, 'Snapdragon 7s Gen 3': 72, 'Snapdragon 7s Gen 2': 70,
  'Snapdragon 6 Gen 3': 68, 'Snapdragon 6 Gen 1': 66, 'Snapdragon 6s Gen 3': 65,
  'Dimensity 7400': 72, 'Dimensity 7350 Pro': 70, 'Dimensity 7300': 68, 'Dimensity 7300 Energy': 67,
  'Dimensity 7300X': 68, 'Dimensity 7200 Pro': 67, 'Dimensity 7200': 66, 'Dimensity 7050': 65,
  'Dimensity 7030': 64, 'Dimensity 7025': 63, 'Dimensity 7020': 62,
  'Snapdragon 778G': 70, 'Snapdragon 778G+': 71, 'Snapdragon 778G (4G)': 69,
  'Snapdragon 782G': 71, 'Snapdragon 780G': 70, 'Snapdragon 765G': 64, 'Snapdragon 750G': 63,
  'Snapdragon 732G': 60, 'Snapdragon 720G': 59, 'Snapdragon 695': 58, 'Snapdragon 685': 55,
  'Snapdragon 680': 54, 'Snapdragon 678': 53, 'Snapdragon 4 Gen 2': 55, 'Snapdragon 4s Gen 2': 53,
  'Snapdragon 480+': 50, 'Snapdragon 480': 48, 'Snapdragon 460': 42,
  'Dimensity 1200': 72, 'Dimensity 1200-Max': 73, 'Dimensity 1100': 70, 'Dimensity 1080': 66,
  'Dimensity 1000+': 67, 'Dimensity 1300': 68, 'Dimensity 930': 62, 'Dimensity 920': 61,
  'Dimensity 900': 60, 'Dimensity 810': 56, 'Dimensity 800U': 57, 'Dimensity 720': 53,
  'Dimensity 6300': 52, 'Dimensity 6080': 50, 'Dimensity 700': 52,
  'Exynos 1480': 68, 'Exynos 1380': 62, 'Exynos 1280': 58, 'Exynos 1080': 65, 'Exynos 9611': 45,
  'Helio G99': 55, 'Helio G99 Ultra': 56, 'Helio G96': 52, 'Helio G95': 50, 'Helio G88': 45,
  'Helio G85': 43, 'Helio G81': 42, 'Helio G37': 35, 'Helio G36': 34, 'Helio A22': 28,
  'JR510': 40, 'UNISOC T606': 38, 'UNISOC T760': 48,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { specs, price, category } = req.body;
  if (!specs) return res.status(400).json({ error: 'specs required' });

  // 1. パフォーマンス(fps): チップセットマップから取得
  let fps = CHIPSET_PERF[specs.cpu] || 50;

  // 2. カメラ: MPとセンサー情報からスコア推定
  let camera = estimateCameraScore(specs.camera, category);

  // 3. バッテリー: mAhと充電速度から推定
  let battery = estimateBatteryScore(specs.battery, category);

  // 4. 総合: 加重平均
  let overall = Math.round(fps * 0.35 + camera * 0.35 + battery * 0.30);

  // カテゴリ補正
  if (category === 'budget') {
    overall = Math.min(overall, 75);
  } else if (category === 'midrange') {
    overall = Math.min(overall, 88);
  }

  return res.status(200).json({
    scores: { overall, fps, camera, battery },
    source: 'auto',
  });
}

function estimateCameraScore(cameraSpec, category) {
  if (!cameraSpec) return category === 'flagship' ? 85 : category === 'midrange' ? 70 : 55;

  const spec = cameraSpec.toLowerCase();
  let score = 70;

  // メガピクセル
  const mpMatch = spec.match(/(\d+)\s*mp/);
  if (mpMatch) {
    const mp = parseInt(mpMatch[1]);
    if (mp >= 200) score = 95;
    else if (mp >= 108) score = 88;
    else if (mp >= 50) score = 82;
    else if (mp >= 48) score = 80;
    else if (mp >= 12) score = 75;
    else score = 65;
  }

  // ブランドセンサー補正
  if (spec.includes('leica')) score = Math.max(score, 93);
  if (spec.includes('hasselblad')) score = Math.max(score, 91);
  if (spec.includes('zeiss')) score = Math.max(score, 90);
  if (spec.includes('xmage')) score = Math.max(score, 88);
  if (spec.includes('1inch') || spec.includes('1"')) score = Math.max(score, 92);

  return Math.min(score, 99);
}

function estimateBatteryScore(batterySpec, category) {
  if (!batterySpec) return category === 'flagship' ? 80 : 70;

  const mahMatch = batterySpec.match(/(\d+)\s*mah/i);
  if (!mahMatch) return 75;

  const mah = parseInt(mahMatch[1]);
  if (mah >= 6000) return 95;
  if (mah >= 5500) return 92;
  if (mah >= 5000) return 88;
  if (mah >= 4500) return 84;
  if (mah >= 4000) return 80;
  if (mah >= 3500) return 75;
  if (mah >= 3000) return 68;
  return 55;
}
