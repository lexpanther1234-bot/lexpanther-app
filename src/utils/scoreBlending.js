/**
 * ユーザーレビュー平均をベーススコアにブレンドする
 *
 * - reviewCountが少ない場合はベーススコアを重視
 * - reviewCountがREVIEW_THRESHOLDに達すると最大BLEND_RATIOの影響
 * - ユーザーレビュー(1-5) → 0-100に正規化して混合
 */

const REVIEW_THRESHOLD = 10; // この件数でフル影響
const BLEND_RATIO = 0.2;     // 最大20%の影響

/**
 * ベーススコアとユーザーレビュー平均をブレンド
 * @param {number} baseScore - 0-100のベーススコア
 * @param {number} userAvg - 1-5のユーザー平均評価
 * @param {number} reviewCount - レビュー件数
 * @returns {number} ブレンド後のスコア(0-100)
 */
export const blendScore = (baseScore, userAvg, reviewCount) => {
  if (!reviewCount || !userAvg || baseScore === 0) return baseScore;

  const weight = Math.min(reviewCount / REVIEW_THRESHOLD, 1.0);
  const normalizedUser = (userAvg / 5) * 100;
  const blendWeight = weight * BLEND_RATIO;

  return Math.round(baseScore * (1 - blendWeight) + normalizedUser * blendWeight);
};

/**
 * レビューカテゴリとスコアタイプのマッピング
 * review.performance → scores.fps
 * review.camera → scores.camera
 * review.battery → scores.battery
 */
export const SCORE_REVIEW_MAP = {
  fps: 'performance',
  camera: 'camera',
  battery: 'battery',
  overall: null, // overallはperformance + camera + batteryの平均を使う
};

/**
 * 全カテゴリのユーザーレビュー平均を計算
 * @param {Array} reviews - レビュー配列
 * @returns {Object} { camera, design, battery, performance, cospa, count }
 */
export const computeReviewAvg = (reviews) => {
  if (!reviews || reviews.length === 0) return null;

  const categories = ['camera', 'design', 'battery', 'performance', 'cospa'];
  const sums = {};
  categories.forEach(c => { sums[c] = 0; });

  reviews.forEach(r => {
    categories.forEach(c => { sums[c] += (r[c] || 0); });
  });

  const avg = {};
  categories.forEach(c => {
    avg[c] = +(sums[c] / reviews.length).toFixed(1);
  });
  avg.count = reviews.length;

  return avg;
};
