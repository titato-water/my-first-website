import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useChatRooms
 *
 * @returns {{ rooms: Array, createRoom: function }}
 *
 * Example usage:
 * const { rooms, createRoom } = useChatRooms();
 */
export function useChatRooms() {
  const { session } = useSession();
  const [rooms, setRooms] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from('it_chat_rooms').select('*').order('created_at', { ascending: false });
    setRooms(data ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createRoom = useCallback(
    async (name) => {
      if (!session?.user?.id || !name.trim()) return;
      const { data, error } = await supabase.from('it_chat_rooms').insert({ name }).select('*').single();
      if (!error) {
        await supabase.from('it_chat_room_members').insert({ room_id: data.id, user_id: session.user.id });
        refresh();
      }
    },
    [refresh, session],
  );

  return { rooms, createRoom };
}
