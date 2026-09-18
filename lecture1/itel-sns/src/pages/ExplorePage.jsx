import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import { supabase } from '../lib/supabase.js';

/**
 * ExplorePage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/explore" element={<ExplorePage />} />
 */
function ExplorePage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(3);
  const [keyword, setKeyword] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const run = async () => {
      let query = supabase
        .from('it_posts')
        .select('id, image_url, caption, it_users!inner(username)')
        .eq('is_story', false)
        .order('created_at', { ascending: false })
        .limit(60);

      if (keyword.trim()) {
        query = query.or(`caption.ilike.%${keyword}%,it_users.username.ilike.%${keyword}%`);
      }

      const { data } = await query;
      setPosts(data ?? []);
    };
    run();
  }, [keyword]);

  return (
    <Box>
      <TextField
        placeholder="닉네임, 아이디, 게시물 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <ToggleButtonGroup
        value={columns}
        exclusive
        onChange={(_event, value) => value && setColumns(value)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value={2}>
          <ViewComfyIcon />
        </ToggleButton>
        <ToggleButton value={3}>
          <GridViewIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      {posts.length === 0 && <Typography sx={{ color: 'text.secondary' }}>검색 결과가 없습니다</Typography>}

      <Grid container spacing={0.5}>
        {posts.map((post) => (
          <Grid size={{ xs: 12 / columns }} key={post.id}>
            <Box
              component="img"
              src={post.image_url}
              alt={post.caption ?? '게시물'}
              onClick={() => navigate(`/posts/${post.id}`)}
              sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', cursor: 'pointer' }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ExplorePage;
