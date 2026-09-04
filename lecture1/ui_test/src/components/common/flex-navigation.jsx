import Box from '@mui/material/Box';

/**
 * FlexNavigation 컴포넌트
 *
 * Props:
 * @param {string} logoText - 왼쪽에 표시할 로고 텍스트 [Optional, 기본값: 'MyWebsite']
 * @param {string[]} menuItems - 오른쪽에 표시할 메뉴 항목 목록 [Optional, 기본값: ['홈', '소개', '상품', '연락처', '설정']]
 *
 * Example usage:
 * <FlexNavigation />
 */
function FlexNavigation({
  logoText = 'MyWebsite',
  menuItems = ['홈', '소개', '상품', '연락처', '설정'],
}) {
  return (
    <Box
      component="nav"
      sx={{
        width: '100%',
        height: '60px',
        bgcolor: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '20px',
        }}
      >
        {logoText}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '15px',
        }}
      >
        {menuItems.map((item) => (
          <Box
            key={item}
            component="span"
            sx={{
              color: '#a0aec0',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: '#ffffff',
              },
            }}
          >
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default FlexNavigation;
