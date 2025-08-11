import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function SectionHeader({ icon, children, sx, ...props }) {
  return (
    <Typography 
      variant="h2" 
      sx={{ 
        mb: 2, 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.75,
        fontWeight: 600,
        fontSize: '1.2rem',
        ...sx 
      }} 
      {...props}
    >
      {icon && <Box component="span" sx={{ fontSize: '1.1em' }}>{icon}</Box>}
      {children}
    </Typography>
  );
}