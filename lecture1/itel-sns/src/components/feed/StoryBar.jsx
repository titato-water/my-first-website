import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useStories } from '../../hooks/useStories.js';
import { getRandomImageOptions } from '../../utils/randomImage.js';

/**
 * StoryBar
 *
 * Props: 없음
 *
 * Example usage:
 * <StoryBar />
 */
function StoryBar() {
  const { stories, addStory } = useStories();

  const handleAddStory = async () => {
    try {
      const [option] = await getRandomImageOptions(1);
      await addStory(option.url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
        <Button onClick={handleAddStory} sx={{ borderRadius: '50%', minWidth: 56, width: 56, height: 56 }}>
          +
        </Button>
        <Typography sx={{ fontSize: '0.75rem' }}>꿀팁 추가</Typography>
      </Box>

      {stories.map((story) => (
        <Box key={story.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
          <Avatar src={story.media_url} sx={{ width: 56, height: 56, border: '2px solid', borderColor: 'secondary.main' }} />
          <Typography sx={{ fontSize: '0.75rem' }}>{story.it_users?.username}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default StoryBar;
