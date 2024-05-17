export const scrollbarStyles = {
  '&::-webkit-scrollbar': {
    width: '0.4em',
    // make it cooler
    // backgroundColor: 'rgba(255,255,255, .08)',
    borderRadius: '16px',
  },

  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(255,255,255, 0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    outline: '#323232 solid 0.5px',
  },
};
