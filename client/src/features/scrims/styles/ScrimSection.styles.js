import { makeStyles } from '@mui/styles';
import BgGIF from '@/assets/images/backgrounds/vi_background.gif';
import HappyTeam from '@/assets/images/backgrounds/happy_team.jpg';

export const useScrimSectionStyles = makeStyles((theme) => ({
  scrimBox: {
    display: 'block',
    width: '98%',
    maxWidth: '1100px',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginBottom: '30px', // Add space for the button
    position: 'relative',

    backgroundImage: ({ scrim }) =>
      scrim?.teamWon
        ? `url(${scrim.postGameImage?.location || HappyTeam})`
        : `url(${BgGIF})`,

    transition: 'all 0.3s ease',

    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    border: '1px solid rgba(33, 150, 243, 0.3)',
    borderRadius: theme.spacing(1),
    overflow: 'visible', // Allow button to show outside
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },

  scrimBoxInner: {
    overflow: 'hidden', // Content overflow hidden here
    borderRadius: theme.spacing(1),
    paddingBottom: ({ isBoxExpanded }) => (isBoxExpanded ? '20px' : 'inherit'),
  },

  scrimSectionHeader: {
    background: 'rgba(18, 24, 38, 0.9)',
    backgroundColor: 'rgba(18, 24, 38, 0.9) !important',
    padding: '16px',

    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(33, 150, 243, 0.3)',

    minHeight: '250px',
  },

  iconButton: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '30%',
    right: '4px',
  },

  infoIcon: {
    color: theme.primary,
    cursor: 'pointer',
    position: 'absolute',
    top: '10%',
    right: '13px',
  },

  teamsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gridGap: '20px',
    padding: '10px',

    '@media screen and (max-width: 630px)': {
      gridTemplateColumns: 'inherit',
      gridTemplateRows: '1fr 1fr 1fr',
    },
  },

  teamListHeader: {
    color: '#fff !important',
    background: 'rgba(33, 150, 243, 0.15)',
    backgroundColor: 'rgba(33, 150, 243, 0.15) !important',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(33, 150, 243, 0.3)',
  },

  teamList: {
    width: '100%',
    maxWidth: '36ch',
    background: 'rgba(18, 24, 38, 0.85)',
    backgroundColor: 'rgba(18, 24, 38, 0.85) !important',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(33, 150, 243, 0.2)',
    borderRadius: theme.spacing(1),

    transition: 'all 0.3s ease',
    paddingBottom: '0 !important', // defaults to 8px

    '&:hover': {
      backgroundColor: 'rgba(18, 24, 38, 0.95) !important',
      border: '1px solid rgba(33, 150, 243, 0.4)',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
    },
    '@media screen and (max-width: 630px)': {
      maxWidth: '100%',
    },
  },

  teamListItem: {
    minHeight: '120px',
    maxHeight: '120px',
    [theme.breakpoints.down('md')]: {
      minHeight: '130px',
      maxHeight: '130px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none',
      },

      '-ms-overflow-style': 'none' /* IE 11 */,
      scrollbarWidth: 'none' /* Firefox 64 */,
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: '150px',
      maxHeight: '150px',
    },
  },

  inline: {
    display: 'inline',
  },

  onlineCircle: {
    marginRight: '10px',
    borderRadius: '50%',
    height: '10px',
    width: '10px',
  },
}));
