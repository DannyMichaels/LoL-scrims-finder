import { createTheme } from '@mui/material/styles';

export const COLORS = {
  // Primary blues from Reluminate.gg
  PRIMARY_BLUE: '#2196F3',
  LIGHT_BLUE: '#64B5F6',
  DARK_BLUE: '#1976D2',
  DARKER_BLUE: '#0D47A1',
  
  // Dark backgrounds
  DARK_BG: '#0a0e1a',
  DARK_SURFACE: '#121826',
  DARK_ELEVATED: '#1a2234',
  
  // Glass effects for dark theme
  GLASS_DARK: 'rgba(255, 255, 255, 0.05)',
  GLASS_DARK_HOVER: 'rgba(255, 255, 255, 0.08)',
  GLASS_BLUE: 'rgba(33, 150, 243, 0.1)',
  GLASS_BLUE_HOVER: 'rgba(33, 150, 243, 0.15)',
  
  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
  TEXT_DISABLED: 'rgba(255, 255, 255, 0.5)',
  
  // Legacy colors (for gradual migration)
  DARK: '#101820',
  DK_BLUE_TRANSPARENT: 'rgba(18,25,35,.85)',
  EGGSHELL_WHITE: '#d1dcde',
  BROWN: '#573625',
  GREY_DEFAULT: '#0a0e1a',
  GREY_PAPER: '#121826',
};

export const appTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  palette: {
    mode: 'dark',

    primary: {
      main: COLORS.PRIMARY_BLUE,
      light: COLORS.LIGHT_BLUE,
      dark: COLORS.DARK_BLUE,
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: COLORS.LIGHT_BLUE,
      light: '#90CAF9',
      dark: COLORS.PRIMARY_BLUE,
      contrastText: '#FFFFFF',
    },

    background: {
      default: COLORS.DARK_BG,
      paper: COLORS.DARK_SURFACE,
    },

    text: {
      primary: COLORS.TEXT_PRIMARY,
      secondary: COLORS.TEXT_SECONDARY,
    },

    error: {
      main: '#f44336',
    },

    success: {
      main: '#4CAF50',
    },
  },

  typography: {
    fontFamily: ['Montserrat', 'sans-serif'].join(','),

    h1: {
      color: COLORS.TEXT_PRIMARY,
      fontSize: '2.5rem',
      fontWeight: 700,
      marginTop: '0.67em',
      marginBottom: '0.67em',
      marginLeft: 0,
      marginRight: 0,
    },

    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBlockStart: '0.83em',
      marginBlockEnd: '0.83em',
      color: COLORS.TEXT_PRIMARY,
    },

    span: {
      color: COLORS.TEXT_PRIMARY,
    },

    h3: {
      display: 'block',
      fontSize: '1.5rem',
      marginTop: '1em',
      marginBottom: '1em',
      marginLeft: 0,
      marginRight: 0,
      fontWeight: 600,
      color: COLORS.TEXT_PRIMARY,
    },

    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: '1.4',
      color: COLORS.TEXT_PRIMARY,
    },

    p: {
      color: COLORS.TEXT_PRIMARY,
      fontWeight: 400,
      display: 'block',
      marginBlockStart: '1em',
      marginBlockEnd: '1em',
      marginInlineStart: '0px',
      marginInlineEnd: '0px',
      fontSize: '1rem',
    },

    body1: {
      color: COLORS.TEXT_PRIMARY,
    },

    body2: {
      color: COLORS.TEXT_SECONDARY,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: '8px',
          textTransform: 'none',
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${COLORS.PRIMARY_BLUE} 0%, ${COLORS.DARK_BLUE} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${COLORS.LIGHT_BLUE} 0%, ${COLORS.PRIMARY_BLUE} 100%)`,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: COLORS.DARK_SURFACE,
        },
      },
    },

    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.DARK_SURFACE,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(33, 150, 243, 0.2)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          top: '0',
          zIndex: '5',
          borderBottom: '1px solid rgba(33, 150, 243, 0.2)',
          background: 'transparent',
          backgroundColor: 'rgba(18, 24, 38, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: COLORS.PRIMARY_BLUE,
          '&.Mui-checked': {
            color: COLORS.PRIMARY_BLUE,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(33, 150, 243, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: COLORS.PRIMARY_BLUE,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.PRIMARY_BLUE,
            },
          },
          '& .MuiInputBase-input': {
            color: COLORS.TEXT_PRIMARY,
          },
          '& .MuiInputLabel-root': {
            color: COLORS.TEXT_SECONDARY,
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLORS.DARK_ELEVATED,
          border: '1px solid rgba(33, 150, 243, 0.2)',
          color: COLORS.TEXT_PRIMARY,
        },
      },
    },
  },
});