import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useChatMessages } from '../hooks/useChatMessages.js';
import { getRandomImageOptions } from '../utils/randomImage.js';

/**
 * ChatRoomPage
 *
 * Props: 없음 (라우트 파라미터 `roomId` 사용)
 *
 * Example usage:
 * <Route path="/chat/:roomId" element={<ChatRoomPage />} />
 */
function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { messages, sendMessage } = useChatMessages(roomId);
  const [draft, setDraft] = useState('');

  const handleSendText = async () => {
    await sendMessage(draft, 'text');
    setDraft('');
  };

  const handleSendPhoto = async () => {
    const [option] = getRandomImageOptions(1);
    await sendMessage(option.url, 'image');
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      sendMessage(`${latitude},${longitude}`, 'location');
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <IconButton onClick={() => navigate('/chat')} sx={{ alignSelf: 'flex-start', mb: 1 }}>
        <ArrowBackIcon />
      </IconButton>

      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} onGoToProfile={() => navigate(`/profile/${message.it_users?.username}`)} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <IconButton onClick={handleSendPhoto} sx={{ minWidth: 44, minHeight: 44 }}>
          <PhotoCameraIcon />
        </IconButton>
        <IconButton onClick={handleShareLocation} sx={{ minWidth: 44, minHeight: 44 }}>
          <LocationOnIcon />
        </IconButton>
        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="메시지를 입력하세요"
          size="small"
          fullWidth
        />
        <IconButton onClick={handleSendText} color="primary" sx={{ minWidth: 44, minHeight: 44 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

function ChatMessageItem({ message, onGoToProfile }) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Avatar
        src={message.it_users?.avatar_url}
        onClick={onGoToProfile}
        sx={{ width: 32, height: 32, cursor: 'pointer' }}
      >
        {message.it_users?.display_name?.[0]}
      </Avatar>
      <Box>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{message.it_users?.display_name}</Typography>
        {message.message_type === 'image' && (
          <Box component="img" src={message.content} alt="채팅 이미지" sx={{ maxWidth: 160, borderRadius: 1 }} />
        )}
        {message.message_type === 'location' && (
          <Typography sx={{ fontSize: '0.9rem' }}>위치 공유: {message.content}</Typography>
        )}
        {message.message_type === 'text' && <Typography sx={{ fontSize: '0.9rem' }}>{message.content}</Typography>}
      </Box>
    </Box>
  );
}

export default ChatRoomPage;
