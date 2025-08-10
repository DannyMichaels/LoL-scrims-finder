import React from 'react';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

const StyledGlassPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
}));

export default function GlassPanel({ children, sx, ...props }) {
  return (
    <StyledGlassPanel sx={sx} elevation={0} {...props}>
      {children}
    </StyledGlassPanel>
  );
}