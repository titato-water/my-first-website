import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';

/**
 * useSession
 *
 * @returns {{ session: object|null, profile: object|null, loading: boolean, refreshProfile: function }}
 *
 * Example usage:
 * const { session, profile } = useSession();
 */
export function useSession() {
  return useContext(AuthContext);
}
