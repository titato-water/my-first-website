import { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase.js';
import { useSession } from '../hooks/useSession.js';
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
  const { session } = useSession();
  const userId = session?.user?.id;
  const [joinedRoomId, setJoinedRoomId] = useState(null);
  const [draft, setDraft] = useState('');

  /**
   * 채팅방 페이지에 들어오면 자동으로 참여 처리합니다.
   * it_messages의 RLS 정책이 it_chat_room_members 소속을 요구하므로,
   * 방을 만든 사람 외에는 이 단계가 없으면 메시지를 보거나 보낼 수 없습니다.
   * 참여가 끝난 뒤에야 메시지를 조회하도록 joinedRoomId 를 통해 순서를 보장합니다.
   */
  useEffect(() => {
    if (!roomId || !userId) return;
    supabase
      .from('it_chat_room_members')
      .upsert({ room_id: roomId, user_id: userId }, { onConflict: 'room_id,user_id', ignoreDuplicates: true })
      .then(({ error }) => {
        if (error) console.error('채팅방 참여 처리 실패:', error.message);
        setJoinedRoomId(roomId);
      });
  }, [roomId, userId]);

  const activeRoomId = joinedRoomId === roomId ? roomId : null;
  const { messages, sendMessage } = useChatMessages(activeRoomId);

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

/**
 * ChatMessageItem
 *
 * Props:
 * @param {object} message - it_users가 조인된 채팅 메시지 row [Required]
 * @param {function} onGoToProfile - 보낸 사람 아바타 클릭 시 실행할 함수 [Required]
 *
 * Example usage:
 * <ChatMessageItem message={message} onGoToProfile={() => navigate('/profile/username')} />
 */
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
