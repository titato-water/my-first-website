import { useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 80;

/**
 * usePullToRefresh
 *
 * @param {function} onRefresh - 새로고침 시 실행할 콜백 [Required]
 * @returns {{ isRefreshing: boolean }}
 *
 * Example usage:
 * const { isRefreshing } = usePullToRefresh(reloadPosts);
 */
export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (event) => {
      if (window.scrollY === 0) {
        startY.current = event.touches[0].clientY;
      }
    };

    const handleTouchEnd = (event) => {
      if (!startY.current) return;
      const deltaY = event.changedTouches[0].clientY - startY.current;
      if (window.scrollY === 0 && deltaY > PULL_THRESHOLD) {
        setIsRefreshing(true);
        Promise.resolve(onRefresh()).finally(() => setIsRefreshing(false));
      }
      startY.current = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return { isRefreshing };
}
