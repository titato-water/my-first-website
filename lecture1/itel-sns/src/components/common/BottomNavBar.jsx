import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEMS = [
  { label: '홈', value: '/', icon: <HomeIcon /> },
  { label: '탐색', value: '/explore', icon: <ExploreIcon /> },
  { label: '글쓰기', value: '/write', icon: <AddBoxIcon /> },
  { label: '채팅', value: '/chat', icon: <ChatIcon /> },
  { label: '알림', value: '/notifications', icon: <NotificationsIcon /> },
  { label: '마이', value: '/me', icon: <PersonIcon /> },
];

/**
 * BottomNavBar
 *
 * Props: 없음
 *
 * Example usage:
 * <BottomNavBar />
 */
function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsVisible(currentY <= lastScrollY.current || currentY < 80);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.25s ease-in-out',
        zIndex: 1200,
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={(_event, value) => navigate(value)}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sx={{ minWidth: 44, minHeight: 44 }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNavBar;
