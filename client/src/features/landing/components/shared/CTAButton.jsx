import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const CTAButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  '&.MuiButton-contained': {
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#2196F3',
    color: '#2196F3',
    '&:hover': {
      borderColor: '#1976D2',
      background: 'rgba(33, 150, 243, 0.1)',
    },
  },
}));

export default CTAButton;
