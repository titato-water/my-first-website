import { Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useSession } from '../../hooks/useSession.js';

/**
 * ProtectedRoute
 *
 * @param {node} children - 로그인 시에만 보여줄 컨텐츠 [Required]
 *
 * Example usage:
 * <ProtectedRoute><FeedPage /></ProtectedRoute>
 */
function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
