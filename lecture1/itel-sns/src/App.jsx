import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import WritePage from './pages/WritePage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
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
  const { profile } = useSession();
  if (!profile) return null;
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
