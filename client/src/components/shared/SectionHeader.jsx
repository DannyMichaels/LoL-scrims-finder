import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function SectionHeader({ icon, children, sx, ...props }) {
  return (
    <Typography 
      variant="h2" 
      sx={{ 
        mb: 3, 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        fontWeight: 600,
        fontSize: '1.5rem',
        ...sx 
      }} 
      {...props}
    >
      {icon && <Box component="span" sx={{ fontSize: '1.2em' }}>{icon}</Box>}
      {children}
    </Typography>
  );
}