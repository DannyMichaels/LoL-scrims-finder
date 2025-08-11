import React from 'react';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const StyledGlassPanel = styled(Paper)(({ theme, variant = 'default' }) => {
  const variants = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.1)',
      },
    },
    blue: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      border: '1px solid rgba(33, 150, 243, 0.3)',
      '&:hover': {
        backgroundColor: 'rgba(33, 150, 243, 0.15)',
        border: '1px solid rgba(33, 150, 243, 0.4)',
        boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
      },
    },
    elevated: {
      backgroundColor: 'rgba(26, 34, 52, 0.8)',
      border: '1px solid rgba(33, 150, 243, 0.2)',
      '&:hover': {
        backgroundColor: 'rgba(26, 34, 52, 0.95)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
      },
    },
  };

  return {
    padding: theme.spacing(1.5),
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    height: '100%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    ...variants[variant],
  };
});

export default function GlassPanel({ children, sx, variant = 'default', ...props }) {
  return (
    <StyledGlassPanel sx={sx} elevation={0} variant={variant} {...props}>
      {children}
    </StyledGlassPanel>
  );
}