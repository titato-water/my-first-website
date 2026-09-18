import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * usePostLike
 *
 * @param {object} post - it_posts 행 [Required]
 * @returns {{ isLiked: boolean, likesCount: number, toggleLike: function }}
 *
 * Example usage:
 * const { isLiked, likesCount, toggleLike } = usePostLike(post);
 */
export function usePostLike(post) {
  const { session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('it_post_likes')
      .select('user_id')
      .eq('post_id', post.id)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setIsLiked(Boolean(data)));
  }, [post.id, session]);

  /** it_posts.likes_count 증감과 'like' 알림 생성은 DB 트리거가 처리합니다. */
  const toggleLike = useCallback(async () => {
    if (!session?.user?.id) return;
    if (isLiked) {
      await supabase.from('it_post_likes').delete().eq('post_id', post.id).eq('user_id', session.user.id);
      setIsLiked(false);
      setLikesCount((count) => count - 1);
    } else {
      await supabase.from('it_post_likes').insert({ post_id: post.id, user_id: session.user.id });
      setIsLiked(true);
      setLikesCount((count) => count + 1);
    }
  }, [isLiked, post.id, session]);

  return { isLiked, likesCount, toggleLike };
}
