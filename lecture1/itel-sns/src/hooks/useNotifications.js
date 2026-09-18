import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useNotifications
 *
 * @returns {{ notifications: Array, markAsRead: function }}
 *
 * Example usage:
 * const { notifications, markAsRead } = useNotifications();
 */
export function useNotifications() {
  const { session } = useSession();
  const [notifications, setNotifications] = useState([]);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('it_notifications')
      .select('*, actor:actor_id(username, display_name, avatar_url)')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false });
    setNotifications(data ?? []);
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markAsRead = useCallback(
    async (notificationId) => {
      await supabase.from('it_notifications').update({ is_read: true }).eq('id', notificationId);
      refresh();
    },
    [refresh],
  );

  return { notifications, markAsRead };
}

/*
 * 알림 행 생성(INSERT)은 클라이언트에서 수행하지 않습니다.
 * it_notifications 에는 INSERT 정책이 없으며, 좋아요/댓글/추천/팔로우 알림은
 * SECURITY DEFINER 트리거(it_handle_post_like / it_handle_comment /
 * it_handle_post_reaction / it_handle_follow)가 서버에서 생성합니다.
 */
