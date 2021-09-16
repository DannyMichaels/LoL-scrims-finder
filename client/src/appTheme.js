import { createTheme } from '@mui/material/styles';

export const COLORS = {
  DK_BLUE: '#101820',
  DK_BLUE_TRANSPARENT: 'rgba(0, 0, 0, 0.61)', // dark filter to darken bg image
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
      main: '#FBC02D',
      contrastText: '#000',
    },

    secondary: {
      main: '#f44336',
      constrastText: '#fff',
    },

    background: {
      default: '#303030',
      paper: '#424242',
      // default: 'rgba(18,25,35)',
      // paper: 'rgba(18,25,35)',
    },

    // secondary: {},
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['Montserrat', 'sans-serif'].join(','),

    h1: {
      color: '#fff',
      fontSize: '2em',
      fontWeight: 'bold',
      marginTop: '0.67em',
      marginBottom: '0.67em',
      marginLeft: 0,
      marginRight: 0,
    },

    h2: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      marginBlockStart: '0.83em',
      marginBlockEnd: '0.83em',
      color: '#fff',
    },

    span: {
      color: '#fff',
    },
    h3: {
      display: 'block',
      fontSize: '1.17em',
      marginTop: '1em',
      marginBottom: '1em',
      marginLeft: 0,
      marginRight: 0,
      fontWeight: 'bold',
    },

    h5: {
      fontSize: '0.83em',
      fontWeight: 'bold',
      lineHeight: '1.4',
      color: '#000',
    },

    p: {
      color: 'green',
      fontWeight: 600,
      display: 'block',
      marginBlockStart: '1em',
      marginBlockEnd: '1em',
      marginInlineStart: '0px',
      marginInlineEnd: '0px',
      fontSize: '22px',
    },
  },

  defaultTheme: {
    pallete: {
      common: {
        white: '#fff',
      },
    },
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: COLORS.DK_BLUE,
        color: COLORS.DK_BLUE,
      },
    },
  },
});
