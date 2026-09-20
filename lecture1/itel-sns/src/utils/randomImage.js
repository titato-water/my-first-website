const UNSPLASH_RANDOM_PHOTOS_URL = 'https://api.unsplash.com/photos/random';

/**
 * getRandomImageOptions
 *
 * @param {number} count - 후보 이미지 개수 [Optional, 기본값: 6]
 * @returns {Promise<Array<{ id: string, url: string }>>} Unsplash 랜덤 이미지 후보 목록
 *
 * Example usage:
 * const options = await getRandomImageOptions();
 */
export async function getRandomImageOptions(count = 6) {
  const params = new URLSearchParams({
    count: String(count),
    query: 'technology gadget',
    client_id: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
  });

  const response = await fetch(`${UNSPLASH_RANDOM_PHOTOS_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Unsplash 이미지를 불러오지 못했습니다.');
  }

  const photos = await response.json();
  return photos.map((photo) => ({ id: photo.id, url: photo.urls.regular }));
}
