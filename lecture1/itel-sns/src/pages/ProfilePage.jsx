import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from '../lib/supabase.js';
import { useSession } from '../hooks/useSession.js';
import { useFollow } from '../hooks/useFollow.js';

/**
 * ProfilePage
 *
 * Props: 없음 (라우트 파라미터 `username` 사용, 없으면 로그인한 본인)
 *
 * Example usage:
 * <Route path="/profile/:username" element={<ProfilePage />} />
 */
function ProfilePage() {
  const { username } = useParams();
  const { profile: myProfile } = useSession();
  const navigate = useNavigate();
  const [targetProfile, setTargetProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lookupUsername = username ?? myProfile?.username;
    if (!lookupUsername) return;
    setLoading(true);
    supabase
      .from('it_users')
      .select('*')
      .eq('username', lookupUsername)
      .single()
      .then(async ({ data }) => {
        setTargetProfile(data);
        if (data) {
          const { data: postRows } = await supabase
            .from('it_posts')
            .select('id, image_url')
            .eq('user_id', data.id)
            .order('created_at', { ascending: false });
          setPosts(postRows ?? []);
        }
        setLoading(false);
      });
  }, [username, myProfile]);

  const { isFollowing, followerCount, followingCount, toggleFollow } = useFollow(targetProfile?.id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!targetProfile) {
    return <Typography>사용자를 찾을 수 없습니다.</Typography>;
  }

  const isMyProfile = targetProfile.id === myProfile?.id;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={targetProfile.avatar_url} sx={{ width: 72, height: 72 }}>
          {targetProfile.display_name?.[0]}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>{targetProfile.display_name}</Typography>
          <Typography sx={{ color: 'text.secondary' }}>@{targetProfile.username}</Typography>
        </Box>
      </Box>

      {targetProfile.bio && <Typography sx={{ mb: 2 }}>{targetProfile.bio}</Typography>}

      <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
        <Typography>게시물 {posts.length}</Typography>
        <Typography>팔로워 {followerCount}</Typography>
        <Typography>팔로잉 {followingCount}</Typography>
      </Box>

      {!isMyProfile && (
        <Button variant={isFollowing ? 'outlined' : 'contained'} onClick={toggleFollow} sx={{ mb: 2, minHeight: 44 }}>
          {isFollowing ? '팔로잉' : '팔로우'}
        </Button>
      )}

      <Grid container spacing={0.5}>
        {posts.map((post) => (
          <Grid size={{ xs: 4 }} key={post.id}>
            <Box
              component="img"
              src={post.image_url}
              alt="게시물"
              onClick={() => navigate(`/posts/${post.id}`)}
              sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', cursor: 'pointer' }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ProfilePage;
