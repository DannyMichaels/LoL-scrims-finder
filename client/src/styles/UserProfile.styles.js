import { makeStyles } from '@mui/styles';
import { scrollbarStyles } from './scrollbar.styles';

export const useProfileStyles = makeStyles((theme) => ({
  myCreatedScrimsList: {
    ...scrollbarStyles,
    padding: 0,
    margin: 0,
    maxHeight: '300px',
    overflowY: 'auto',
    listStyle: 'inside',

    '& > li': {
      marginBottom: '10px',
    },
  },

  sortByBox: {
    marginLeft: '20px',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
    },
  },
}));
