import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import { useReportBlock } from '../../hooks/useReportBlock.js';

const REASONS = [
  { value: 'spam', label: '스팸/광고' },
  { value: 'abuse', label: '욕설/혐오' },
  { value: 'sexual_content', label: '성적인 콘텐츠' },
  { value: 'etc', label: '기타' },
];

/**
 * ReportDialog
 *
 * @param {boolean} isOpen - 다이얼로그 표시 여부 [Required]
 * @param {function} onClose - 닫기 콜백 [Required]
 * @param {string} targetType - 'post' | 'comment' | 'user' [Required]
 * @param {string|number} targetId - 신고 대상 id [Required]
 *
 * Example usage:
 * <ReportDialog isOpen={open} onClose={handleClose} targetType="post" targetId={post.id} />
 */
function ReportDialog({ isOpen, onClose, targetType, targetId }) {
  const { submitReport } = useReportBlock();
  const [reason, setReason] = useState('spam');

  const handleSubmit = async () => {
    await submitReport({ targetType, targetId, reason });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>신고하기</DialogTitle>
      <DialogContent>
        <RadioGroup value={reason} onChange={(event) => setReason(event.target.value)}>
          {REASONS.map((item) => (
            <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSubmit}>
          신고 접수
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportDialog;
