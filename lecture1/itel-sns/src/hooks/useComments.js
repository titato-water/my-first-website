import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useComments
 *
 * @param {number} postId - 댓글을 조회할 게시물 id [Required]
 * @returns {{ comments: Array, addComment: function }} addComment는 { data } 또는 { error }를 반환합니다.
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

  /** it_posts.comments_count 증감과 'comment' 알림 생성은 DB 트리거가 처리합니다. */
  const addComment = useCallback(
    async (content) => {
      if (!session?.user?.id || !content.trim()) {
        return { error: new Error('로그인이 필요하거나 댓글 내용이 비어 있습니다.') };
      }
      const { data, error } = await supabase
        .from('it_comments')
        .insert({ post_id: postId, user_id: session.user.id, content })
        .select('*, it_users(username, display_name, avatar_url)')
        .single();
      if (error) {
        return { error };
      }
      setComments((prev) => [...prev, data]);
      return { data };
    },
    [postId, session],
  );

  return { comments, addComment };
}
