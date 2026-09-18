import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../lib/supabase.js';
import { usePostLike } from '../hooks/usePostLike.js';
import { usePostReaction } from '../hooks/usePostReaction.js';
import CommentSection from '../components/feed/CommentSection.jsx';

/**
 * PostDetailPage
 *
 * Props: 없음 (라우트 파라미터 `id` 사용)
 *
 * Example usage:
 * <Route path="/posts/:id" element={<PostDetailPage />} />
 */
function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('it_posts')
      .select('*, it_users(username, display_name, avatar_url)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return <Typography>게시물을 찾을 수 없습니다.</Typography>;
  }

  return <PostDetailContent post={post} onBack={() => navigate(-1)} />;
}

function PostDetailContent({ post, onBack }) {
  const author = post.it_users;
  const { isLiked, likesCount, toggleLike } = usePostLike(post);
  const { myReaction, recommendCount, notRecommendCount, setReaction } = usePostReaction(post);

  return (
    <Box>
      <IconButton onClick={onBack} sx={{ mb: 1 }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar src={author?.avatar_url}>{author?.display_name?.[0]}</Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{author?.display_name}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>@{author?.username}</Typography>
        </Box>
      </Box>

      <Box
        component="img"
        src={post.image_url}
        alt={post.caption ?? '게시물 이미지'}
        sx={{ width: '100%', borderRadius: 1, mb: 2 }}
      />

      <Typography sx={{ mb: 2 }}>{post.caption}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={toggleLike} sx={{ minWidth: 44, minHeight: 44 }}>
          {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography>{likesCount}</Typography>
      </Box>

      <ToggleButtonGroup
        value={myReaction}
        exclusive
        onChange={(_event, value) => value && setReaction(value)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="recommend">추천 {recommendCount}</ToggleButton>
        <ToggleButton value="not_recommend">비추천 {notRecommendCount}</ToggleButton>
      </ToggleButtonGroup>

      <CommentSection postId={post.id} />
    </Box>
  );
}

export default PostDetailPage;
