import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { usePosts } from '../hooks/usePosts.js';
import PostCard from '../components/feed/PostCard.jsx';
import StoryBar from '../components/feed/StoryBar.jsx';

/**
 * FeedPage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/" element={<FeedPage />} />
 */
function FeedPage() {
  const { posts, loading, hasMore, loadMore } = usePosts();
  const sentinelRef = useRef(null);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <Box>
      <StoryBar />

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {hasMore && <Box ref={sentinelRef} sx={{ height: 1 }} />}
    </Box>
  );
}

export default FeedPage;
