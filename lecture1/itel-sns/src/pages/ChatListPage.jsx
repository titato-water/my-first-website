import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useChatRooms } from '../hooks/useChatRooms.js';

/**
 * ChatListPage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/chat" element={<ChatListPage />} />
 */
function ChatListPage() {
  const navigate = useNavigate();
  const { rooms, createRoom } = useChatRooms();
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreate = async () => {
    await createRoom(newRoomName);
    setNewRoomName('');
  };

  return (
    <Box>
      <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 700, mb: 2 }}>채팅방</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          placeholder="채팅방 이름"
          value={newRoomName}
          onChange={(event) => setNewRoomName(event.target.value)}
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate}>
          만들기
        </Button>
      </Box>

      <List>
        {rooms.map((room) => (
          <ListItemButton key={room.id} onClick={() => navigate(`/chat/${room.id}`)}>
            <ListItemText primary={room.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default ChatListPage;
