import Button from '@mui/material/Button';
import { styled, alpha, darken } from '@mui/material/styles';

const CTAButton = styled(Button)(({ theme }) => ({
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  '&.MuiButton-contained': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${darken(theme.palette.primary.dark, 0.1)} 100%)`,
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
  },
  '&.MuiButton-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.primary.dark,
      background: alpha(theme.palette.primary.main, 0.1),
    },
  },
}));

export default CTAButton;
