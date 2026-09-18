import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useComments
 *
 * @param {number} postId - 댓글을 조회할 게시물 id [Required]
 * @returns {{ comments: Array, addComment: function }}
 *
 * Example usage:
 * const { comments, addComment } = useComments(post.id);
 */
export function useComments(postId) {
  const { session } = useSession();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    supabase
      .from('it_comments')
      .select('*, it_users(username, display_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setComments(data ?? []));
  }, [postId]);

  const addComment = useCallback(
    async (content) => {
      if (!session?.user?.id || !content.trim()) return;
      const { data, error } = await supabase
        .from('it_comments')
        .insert({ post_id: postId, user_id: session.user.id, content })
        .select('*, it_users(username, display_name, avatar_url)')
        .single();
      if (!error) {
        setComments((prev) => [...prev, data]);
        await supabase
          .from('it_posts')
          .update({ comments_count: comments.length + 1 })
          .eq('id', postId);
      }
    },
    [comments.length, postId, session],
  );

  return { comments, addComment };
}
