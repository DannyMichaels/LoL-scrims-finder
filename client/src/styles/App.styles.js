// utils
import { makeStyles } from '@mui/styles';

export const useAppStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',

    '&::before': {
      background: 'var(--bgImg)', // background image
      transition: 'background 250ms ease-in-out',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      content: '""',
      position: 'fixed', // background scrolls with user (user doesn't notice), absolute: doesn't scroll with user
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      filter: 'var(--bgBlur)', // blurred
      zIndex: -1, // behind page-content z-index
    },

    '&::after': {
      content: '""',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      background: 'rgba(10, 14, 26, 0.6)', // Dark overlay for better readability
      zIndex: -1,
      pointerEvents: 'none',
    },
  },
});
