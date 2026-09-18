import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

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
        onDoubleClick={() => navigate(`/posts/${post.id}`)}
        onClick={() => navigate(`/posts/${post.id}`)}
        sx={{ aspectRatio: '1 / 1', objectFit: 'cover', cursor: 'pointer' }}
      />
      <CardContent>
        <Typography sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>{post.caption}</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>좋아요 {post.likes_count}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>댓글 {post.comments_count}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>공유 {post.shares_count}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PostCard;
