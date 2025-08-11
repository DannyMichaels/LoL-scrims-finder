import React from 'react';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

const glassmorphicStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(33, 150, 243, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2196F3',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&.Mui-focused': {
      color: '#2196F3',
    },
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
};

const selectStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    color: '#fff',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(33, 150, 243, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2196F3',
    },
  },
  '& .MuiSelect-icon': {
    color: '#fff',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&.Mui-focused': {
      color: '#2196F3',
    },
  },
};

export function GlassTextField({ helperText, icon, ...props }) {
  return (
    <>
      <TextField
        variant="outlined"
        fullWidth
        sx={glassmorphicStyles}
        {...props}
      />
      {helperText && (
        <FormHelperText sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {icon && <span>{icon}</span>}
          {helperText}
        </FormHelperText>
      )}
    </>
  );
}

export function GlassSelect({ helperText, icon, children, ...props }) {
  return (
    <>
      <Select
        variant="outlined"
        fullWidth
        sx={selectStyles}
        {...props}
      >
        {children}
      </Select>
      {helperText && (
        <FormHelperText sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {icon && <span>{icon}</span>}
          {helperText}
        </FormHelperText>
      )}
    </>
  );
}