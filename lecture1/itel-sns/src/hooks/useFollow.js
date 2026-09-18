import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useFollow
 *
 * @param {string} targetUserId - 팔로우 대상 사용자 id [Required]
 * @returns {{ isFollowing: boolean, followerCount: number, followingCount: number, toggleFollow: function }}
 *
 * Example usage:
 * const { isFollowing, toggleFollow } = useFollow(profile.id);
 */
export function useFollow(targetUserId) {
  const { session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const refreshCounts = useCallback(async () => {
    if (!targetUserId) return;
    const [{ count: followers }, { count: followings }] = await Promise.all([
      supabase.from('it_follows').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId),
      supabase.from('it_follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId),
    ]);
    setFollowerCount(followers ?? 0);
    setFollowingCount(followings ?? 0);
  }, [targetUserId]);

  useEffect(() => {
    refreshCounts();
    if (session?.user?.id && targetUserId) {
      supabase
        .from('it_follows')
        .select('follower_id')
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId)
        .maybeSingle()
        .then(({ data }) => setIsFollowing(Boolean(data)));
    }
  }, [refreshCounts, session, targetUserId]);

  const toggleFollow = useCallback(async () => {
    if (!session?.user?.id || session.user.id === targetUserId) return;
    if (isFollowing) {
      await supabase.from('it_follows').delete().eq('follower_id', session.user.id).eq('following_id', targetUserId);
    } else {
      await supabase.from('it_follows').insert({ follower_id: session.user.id, following_id: targetUserId });
    }
    setIsFollowing((prev) => !prev);
    refreshCounts();
  }, [isFollowing, refreshCounts, session, targetUserId]);

  return { isFollowing, followerCount, followingCount, toggleFollow };
}
