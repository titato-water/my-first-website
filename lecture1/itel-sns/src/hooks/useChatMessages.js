import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useChatMessages
 *
 * @param {number} roomId - 채팅방 id [Required, 값이 없으면 조회/구독하지 않음]
 * @returns {{ messages: Array, sendMessage: function }}
 *
 * Example usage:
 * const { messages, sendMessage } = useChatMessages(roomId);
 */
export function useChatMessages(roomId) {
  const { session } = useSession();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    supabase
      .from('it_messages')
      .select('*, it_users(username, display_name, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'it_messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const { data: sender } = await supabase
            .from('it_users')
            .select('username, display_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();
          setMessages((prev) => [...prev, { ...payload.new, it_users: sender }]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (content, messageType = 'text') => {
      if (!roomId || !session?.user?.id || !content) return;
      await supabase.from('it_messages').insert({
        room_id: roomId,
        sender_id: session.user.id,
        content,
        message_type: messageType,
      });
    },
    [roomId, session],
  );

  return { messages, sendMessage };
}
