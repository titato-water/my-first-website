import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

export const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * @param {node} children - 하위 트리 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('it_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      fetchProfile(data.session?.user?.id).finally(() => setLoading(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      fetchProfile(nextSession?.user?.id);
    });

    return () => subscription.subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshProfile = useCallback(() => fetchProfile(session?.user?.id), [fetchProfile, session]);

  const value = { session, profile, loading, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
