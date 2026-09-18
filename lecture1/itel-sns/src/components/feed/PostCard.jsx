import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { usePostLike } from '../../hooks/usePostLike.js';

/** 더블탭으로 인정할 두 번째 탭까지의 최대 간격 (ms) */
const DOUBLE_TAP_THRESHOLD_MS = 300;

/**
 * PostCard
 *
 * @param {object} post - it_posts 행 + it_users 조인 데이터 [Required]
 *
 * Example usage:
 * <PostCard post={post} />
 */
function PostCard({ post }) {
  const navigate = useNavigate();
  const author = post.it_users;
  const { isLiked, likesCount, toggleLike } = usePostLike(post);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  /**
   * 이미지 탭 처리
   * 브라우저는 더블클릭 시 click 이벤트를 먼저 두 번 발생시키므로,
   * onDoubleClick 대신 탭 간격을 직접 재서 단일 탭(상세 이동)과 더블 탭(좋아요)을 구분합니다.
   */
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_THRESHOLD_MS) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      lastTapRef.current = 0;
      toggleLike();
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        navigate(`/posts/${post.id}`);
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_THRESHOLD_MS);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={<Avatar src={author?.avatar_url} alt={author?.display_name}>{author?.display_name?.[0]}</Avatar>}
        title={author?.display_name}
        subheader={'@' + author?.username}
        onClick={() => navigate(`/profile/${author?.username}`)}
        sx={{ cursor: 'pointer' }}
      />
      <CardMedia
        component="img"
        image={post.image_url}
        alt={post.caption ?? '게시물 이미지'}
        onClick={handleImageTap}
        sx={{ aspectRatio: '1 / 1', objectFit: 'cover', cursor: 'pointer' }}
      />
      <CardContent>
        <Typography sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>{post.caption}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <IconButton onClick={toggleLike} size="small" sx={{ minWidth: 44, minHeight: 44 }}>
            {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{likesCount}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>댓글 {post.comments_count}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>공유 {post.shares_count}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PostCard;
