import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

const PAGE_SIZE = 10;

/**
 * usePosts
 *
 * @returns {{ posts: Array, loading: boolean, hasMore: boolean, loadMore: function, createPost: function }}
 *
 * Example usage:
 * const { posts, loadMore, createPost } = usePosts();
 */
export function usePosts() {
  const { session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || loading || !hasMore) return;
    isLoadingRef.current = true;
    setLoading(true);
    try {
      const from = posts.length;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('it_posts')
        .select('*, it_users!it_posts_user_id_fkey(username, display_name, avatar_url)')
        .eq('is_story', false)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) return;
      setPosts((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [loading, hasMore, posts.length]);

  const createPost = useCallback(
    async ({ caption, imageUrl, deviceRating, location }) => {
      if (!session?.user?.id) return { error: new Error('로그인이 필요합니다.') };
      const { data, error } = await supabase
        .from('it_posts')
        .insert({
          user_id: session.user.id,
          caption,
          image_url: imageUrl,
          device_rating: deviceRating || null,
          location: location || null,
        })
        .select('*, it_users!it_posts_user_id_fkey(username, display_name, avatar_url)')
        .single();
      if (!error) {
        setPosts((prev) => [data, ...prev]);
      }
      return { data, error };
    },
    [session],
  );

  return { posts, loading, hasMore, loadMore, createPost };
}
