import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoginPage from './pages/LoginPage.jsx';
import WritePage from './pages/WritePage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ChatListPage from './pages/ChatListPage.jsx';
import ChatRoomPage from './pages/ChatRoomPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AppLayout from './components/common/AppLayout.jsx';
import { useSession } from './hooks/useSession.js';

/**
 * RedirectToMyProfile
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/me" element={<RedirectToMyProfile />} />
 */
function RedirectToMyProfile() {
  const { profile, loading } = useSession();

  if (loading) return null;

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography>프로필 정보를 불러올 수 없습니다. 다시 로그인해 주세요.</Typography>
      </Box>
    );
  }

  return <Navigate to={`/profile/${profile.username}`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FeedPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/write"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WritePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PostDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ExplorePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatRoomPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/me"
        element={
          <ProtectedRoute>
            <RedirectToMyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
