import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { usePosts } from '../hooks/usePosts.js';
import { getRandomImageOptions } from '../utils/randomImage.js';

/**
 * WritePage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/write" element={<WritePage />} />
 */
function WritePage() {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const [imageOptions, setImageOptions] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [deviceRating, setDeviceRating] = useState(0);
  const [location, setLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSelection = useMemo(() => Boolean(selectedUrl), [selectedUrl]);

  const handleRefreshImages = async () => {
    setIsLoadingImages(true);
    setErrorMessage('');
    try {
      const options = await getRandomImageOptions();
      setImageOptions(options);
      setSelectedUrl('');
    } catch (error) {
      setErrorMessage('이미지를 불러오지 못했습니다: ' + error.message);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    handleRefreshImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!hasSelection) {
      setErrorMessage('이미지를 선택해 주세요.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await createPost({ caption, imageUrl: selectedUrl, deviceRating, location });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage('게시물 작성에 실패했습니다: ' + error.message);
      return;
    }
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 700 }}>게시물 작성</Typography>

      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}

      {isLoadingImages ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Grid container spacing={1}>
          {imageOptions.map((option) => (
            <Grid size={{ xs: 4 }} key={option.id}>
              <Box
                component="img"
                src={option.url}
                alt="후보 이미지"
                onClick={() => setSelectedUrl(option.url)}
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  outline: selectedUrl === option.url ? '3px solid' : 'none',
                  outlineColor: 'primary.main',
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        onClick={handleRefreshImages}
        disabled={isLoadingImages}
        sx={{ alignSelf: 'flex-start', minHeight: 44 }}
      >
        다른 이미지 보기
      </Button>

      <TextField
        label="캡션"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        multiline
        minRows={3}
        fullWidth
      />

      <Box>
        <Typography sx={{ fontSize: '0.9rem', mb: 0.5 }}>내 IT기기 별점</Typography>
        <Rating value={deviceRating} onChange={(_event, value) => setDeviceRating(value ?? 0)} />
      </Box>

      <TextField
        label="추천 장소 (선택)"
        placeholder="예: 저렴하게 살 수 있는 곳"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        fullWidth
      />

      <Button variant="contained" size="large" disabled={isSubmitting} onClick={handleSubmit} sx={{ minHeight: 48 }}>
        게시하기
      </Button>
    </Box>
  );
}

export default WritePage;
