import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { supabase } from '../lib/supabase.js';
import { isAtLeast14YearsOld } from '../utils/ageValidation.js';

/**
 * LoginPage
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/login" element={<LoginPage />} />
 */
function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }
    navigate('/');
  };

  const handleSignup = async () => {
    setErrorMessage('');
    if (!isAtLeast14YearsOld(birthDate)) {
      setErrorMessage('만 14세 미만은 가입할 수 없습니다.');
      return;
    }
    if (!username || !displayName) {
      setErrorMessage('닉네임과 표시 이름을 입력해 주세요.');
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setIsSubmitting(false);
      setErrorMessage(error?.message ?? '회원가입에 실패했습니다.');
      return;
    }

    const { error: profileError } = await supabase.from('it_users').insert({
      id: data.user.id,
      username,
      display_name: displayName,
      birth_date: birthDate,
    });
    setIsSubmitting(false);

    if (profileError) {
      setErrorMessage('프로필 생성에 실패했습니다: ' + profileError.message);
      return;
    }

    if (data.session) {
      navigate('/');
    } else {
      setErrorMessage('가입이 완료되었습니다. 로그인해 주세요.');
      setTab('login');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, textAlign: 'center', mb: 3 }}>
          I'tel
        </Typography>

        <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="로그인" value="login" />
          <Tab label="회원가입" value="signup" />
        </Tabs>

        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
          />

          {tab === 'signup' && (
            <>
              <TextField
                label="닉네임(아이디)"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
              />
              <TextField
                label="표시 이름"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                fullWidth
              />
              <TextField
                label="생년월일"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </>
          )}

          <Button
            variant="contained"
            size="large"
            disabled={isSubmitting}
            onClick={tab === 'login' ? handleLogin : handleSignup}
            sx={{ minHeight: 48 }}
          >
            {tab === 'login' ? '로그인' : '회원가입'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default LoginPage;
