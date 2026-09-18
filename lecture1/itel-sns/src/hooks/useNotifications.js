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

/**
 * createNotification
 *
 * @param {string} recipientId - 알림 받는 사용자 id [Required]
 * @param {string} actorId - 알림을 발생시킨 사용자 id [Required]
 * @param {string} type - 'like' | 'comment' | 'follow' | 'recommend' [Required]
 * @param {number} targetId - 대상 게시물/댓글 id [Optional]
 *
 * Example usage:
 * createNotification(post.user_id, session.user.id, 'like', post.id);
 */
export async function createNotification(recipientId, actorId, type, targetId) {
  if (recipientId === actorId) return;
  await supabase.from('it_notifications').insert({ recipient_id: recipientId, actor_id: actorId, type, target_id: targetId ?? null });
}
