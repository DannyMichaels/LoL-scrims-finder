import { createTheme, alpha, lighten, darken } from '@mui/material/styles';

export const COLORS = {
  // Primary blues from Reluminate.gg (defaults)
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

// Returns '#000000' or '#FFFFFF' based on the luminance of the given hex color
function getContrastText(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // W3C relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function createBrandTheme(colors = {}) {
  const primary = colors.primaryMain || COLORS.PRIMARY_BLUE;
  const primaryLight = colors.primaryLight || lighten(primary, 0.2);
  const primaryDark = colors.primaryDark || darken(primary, 0.2);
  const bgDefault = colors.backgroundDefault || COLORS.DARK_BG;
  const bgPaper = colors.backgroundPaper || COLORS.DARK_SURFACE;
  const primaryContrastText = getContrastText(primary);

  return createTheme({
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
        main: primary,
        light: primaryLight,
        dark: primaryDark,
        contrastText: primaryContrastText,
      },

      secondary: {
        main: primaryLight,
        light: lighten(primaryLight, 0.2),
        dark: primary,
        contrastText: getContrastText(primaryLight),
      },

      background: {
        default: bgDefault,
        paper: bgPaper,
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
              boxShadow: `0 4px 12px ${alpha(primary, 0.3)}`,
            },
          },
          contained: {
            boxShadow: `0 2px 8px ${alpha(primary, 0.2)}`,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primary} 0%, ${primaryDark} 100%)`,
            color: primaryContrastText,
            '&:hover': {
              background: `linear-gradient(135deg, ${primaryLight} 0%, ${primary} 100%)`,
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.3)',
              boxShadow: 'none',
            },
          },
          containedSecondary: {
            color: getContrastText(primaryLight),
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: bgPaper,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: alpha(bgPaper, 0.95),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          },
          arrow: {
            color: alpha(bgPaper, 0.95),
            '&::before': {
              border: `1px solid ${alpha(primary, 0.3)}`,
              backgroundColor: alpha(bgPaper, 0.95),
            },
          },
        },
      },

      MuiStepper: {
        styleOverrides: {
          root: {
            backgroundColor: bgPaper,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${alpha(primary, 0.2)}`,
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            top: '0',
            zIndex: '5',
            borderBottom: `1px solid ${alpha(primary, 0.2)}`,
            background: 'transparent',
            backgroundColor: alpha(bgPaper, 0.7),
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: primary,
            '&.Mui-checked': {
              color: primary,
            },
          },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: alpha(primary, 0.3),
              },
              '&:hover fieldset': {
                borderColor: primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: primary,
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

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(bgPaper, 0.85),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(primary, 0.1),
            borderBottom: `1px solid ${alpha(primary, 0.2)}`,
            color: COLORS.TEXT_PRIMARY,
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            color: COLORS.TEXT_PRIMARY,
          },
          dividers: {
            borderTop: `1px solid ${alpha(primary, 0.2)}`,
            borderBottom: `1px solid ${alpha(primary, 0.2)}`,
          },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(primary, 0.05),
            borderTop: `1px solid ${alpha(primary, 0.2)}`,
            padding: '16px',
          },
        },
      },

      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
          },
        },
      },

      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiSnackbarContent-root': {
              backgroundColor: alpha(bgPaper, 0.9),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(primary, 0.3)}`,
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(bgPaper, 0.9),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            borderRadius: '8px',
            color: COLORS.TEXT_PRIMARY,
          },
          standardSuccess: {
            backgroundColor: 'rgba(76, 175, 80, 0.15)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          },
          standardError: {
            backgroundColor: 'rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          },
          standardWarning: {
            backgroundColor: 'rgba(255, 152, 0, 0.15)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
          },
          standardInfo: {
            backgroundColor: alpha(primary, 0.15),
            border: `1px solid ${alpha(primary, 0.3)}`,
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(bgPaper, 0.9),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: alpha(primary, 0.1),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(primary, 0.15),
              '&:hover': {
                backgroundColor: alpha(primary, 0.2),
              },
            },
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          select: {
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
        },
      },

      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(bgPaper, 0.9),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          },
        },
      },

      MuiPopper: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              backgroundColor: alpha(bgPaper, 0.9),
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(primary, 0.3)}`,
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },

      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(bgPaper, 0.9),
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(primary, 0.3)}`,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          },
          listbox: {
            '& .MuiAutocomplete-option': {
              '&:hover': {
                backgroundColor: alpha(primary, 0.1),
              },
              '&[aria-selected="true"]': {
                backgroundColor: alpha(primary, 0.15),
              },
            },
          },
        },
      },
    },
  });
}

// Backward-compatible default export
export const appTheme = createBrandTheme();
