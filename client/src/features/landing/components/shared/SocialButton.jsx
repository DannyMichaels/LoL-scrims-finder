import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const SocialButton = styled(Button)(({ theme }) => ({
  background: 'rgba(33, 150, 243, 0.1)',
  border: '2px solid rgba(33, 150, 243, 0.3)',
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#fff',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  backdropFilter: 'blur(4px)',
  '&:hover': {
    background: 'rgba(33, 150, 243, 0.2)',
    border: '2px solid rgba(33, 150, 243, 0.5)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(33, 150, 243, 0.25)',
  },
}));

export default SocialButton;
