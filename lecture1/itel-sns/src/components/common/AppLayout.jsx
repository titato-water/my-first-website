import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import BottomNavBar from './BottomNavBar.jsx';

/**
 * AppLayout
 *
 * @param {node} children - 페이지 컨텐츠 [Required]
 *
 * Example usage:
 * <AppLayout><FeedPage /></AppLayout>
 */
function AppLayout({ children }) {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: { xs: 8, md: 9 },
      }}
    >
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        {children}
      </Container>
      <BottomNavBar />
    </Box>
  );
}

export default AppLayout;
