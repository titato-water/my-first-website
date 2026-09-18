import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useComments } from '../../hooks/useComments.js';

/**
 * CommentSection
 *
 * @param {number} postId - 게시물 id [Required]
 *
 * Example usage:
 * <CommentSection postId={post.id} />
 */
function CommentSection({ postId }) {
  const { comments, addComment } = useComments(postId);
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    const { error } = await addComment(draft);
    if (error) {
      setErrorMessage('댓글 등록에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    setDraft('');
  };

  return (
    <Box sx={{ mt: 2 }}>
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.9rem' }}>
            <strong>{comment.it_users?.display_name}</strong> {comment.content}
          </Typography>
        </Box>
      ))}

      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="댓글을 입력하세요"
          size="small"
          fullWidth
        />
        <Button onClick={handleSubmit} variant="contained">
          등록
        </Button>
      </Box>
    </Box>
  );
}

export default CommentSection;
