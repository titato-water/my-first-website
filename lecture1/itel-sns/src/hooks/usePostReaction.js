import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * usePostReaction
 *
 * @param {object} post - it_posts 행 [Required]
 * @returns {{ myReaction: string|null, recommendCount: number, notRecommendCount: number, setReaction: function }}
 *
 * Example usage:
 * const { myReaction, setReaction } = usePostReaction(post);
 */
export function usePostReaction(post) {
  const { session } = useSession();
  const [myReaction, setMyReaction] = useState(null);
  const [recommendCount, setRecommendCount] = useState(post.recommend_count);
  const [notRecommendCount, setNotRecommendCount] = useState(post.not_recommend_count);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('it_post_reactions')
      .select('reaction')
      .eq('post_id', post.id)
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setMyReaction(data?.reaction ?? null));
  }, [post.id, session]);

  const setReaction = useCallback(
    async (reaction) => {
      if (!session?.user?.id) return;
      const previous = myReaction;

      if (previous === reaction) {
        await supabase.from('it_post_reactions').delete().eq('post_id', post.id).eq('user_id', session.user.id);
        setMyReaction(null);
      } else {
        await supabase
          .from('it_post_reactions')
          .upsert({ post_id: post.id, user_id: session.user.id, reaction });
        setMyReaction(reaction);
      }

      const nextRecommend =
        recommendCount + (reaction === 'recommend' ? 1 : 0) - (previous === 'recommend' ? 1 : 0);
      const nextNotRecommend =
        notRecommendCount + (reaction === 'not_recommend' ? 1 : 0) - (previous === 'not_recommend' ? 1 : 0);

      setRecommendCount(nextRecommend);
      setNotRecommendCount(nextNotRecommend);
      await supabase
        .from('it_posts')
        .update({ recommend_count: nextRecommend, not_recommend_count: nextNotRecommend })
        .eq('id', post.id);
    },
    [myReaction, notRecommendCount, post.id, recommendCount, session],
  );

  return { myReaction, recommendCount, notRecommendCount, setReaction };
}
