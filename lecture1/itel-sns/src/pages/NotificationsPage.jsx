import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useNotifications } from '../hooks/useNotifications.js';

const TYPE_LABEL = {
  like: '님이 회원님의 게시물을 좋아합니다.',
  comment: '님이 댓글을 남겼습니다.',
  follow: '님이 회원님을 팔로우합니다.',
  recommend: '님이 회원님의 게시물을 추천했습니다.',
};

/**
 * NotificationsPage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/notifications" element={<NotificationsPage />} />
 */
function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications();

  if (notifications.length === 0) {
    return <Typography sx={{ color: 'text.secondary' }}>알림이 없습니다.</Typography>;
  }

  return (
    <Box>
      <List>
        {notifications.map((notification) => (
          <ListItemButton
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            sx={{ opacity: notification.is_read ? 0.5 : 1 }}
          >
            <ListItemAvatar>
              <Avatar src={notification.actor?.avatar_url}>{notification.actor?.display_name?.[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={`${notification.actor?.display_name}${TYPE_LABEL[notification.type]}`} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default NotificationsPage;
