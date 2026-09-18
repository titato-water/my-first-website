import { useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useSession } from './useSession.js';

/**
 * useReportBlock
 *
 * @returns {{ submitReport: function, blockUser: function }}
 *
 * Example usage:
 * const { submitReport, blockUser } = useReportBlock();
 */
export function useReportBlock() {
  const { session } = useSession();

  const submitReport = useCallback(
    async ({ targetType, targetId, reason }) => {
      if (!session?.user?.id) return { error: new Error('로그인이 필요합니다.') };
      return supabase
        .from('it_reports')
        .insert({ reporter_id: session.user.id, target_type: targetType, target_id: String(targetId), reason });
    },
    [session],
  );

  const blockUser = useCallback(
    async (blockedId) => {
      if (!session?.user?.id) return { error: new Error('로그인이 필요합니다.') };
      return supabase.from('it_blocks').insert({ blocker_id: session.user.id, blocked_id: blockedId });
    },
    [session],
  );

  return { submitReport, blockUser };
}
