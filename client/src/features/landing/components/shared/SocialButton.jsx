import Button from '@mui/material/Button';
import { styled, alpha } from '@mui/material/styles';

const SocialButton = styled(Button)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '14px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backdropFilter: 'blur(4px)',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.2),
    border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    transform: 'translateY(-2px)',
    boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
  },
}));

export default SocialButton;
