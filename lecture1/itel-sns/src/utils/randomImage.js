/**
 * getRandomImageOptions
 *
 * @param {number} count - 후보 이미지 개수 [Optional, 기본값: 6]
 * @returns {Array<{ seed: string, url: string }>} 랜덤 이미지 후보 목록
 *
 * Example usage:
 * const options = getRandomImageOptions();
 */
export function getRandomImageOptions(count = 6) {
  return Array.from({ length: count }, () => {
    const seed = Math.random().toString(36).slice(2, 10);
    return { seed, url: `https://picsum.photos/seed/${seed}/600/600` };
  });
}
