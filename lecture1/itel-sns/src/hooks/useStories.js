import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useStories
 *
 * @returns {{ stories: Array, addStory: function }}
 *
 * Example usage:
 * const { stories, addStory } = useStories();
 */
export function useStories() {
  const { session } = useSession();
  const [stories, setStories] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('it_stories')
      .select('*, it_users(username, display_name, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    setStories(data ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addStory = useCallback(
    async (mediaUrl) => {
      if (!session?.user?.id) return;
      await supabase.from('it_stories').insert({ user_id: session.user.id, media_url: mediaUrl });
      refresh();
    },
    [refresh, session],
  );

  return { stories, addStory };
}
