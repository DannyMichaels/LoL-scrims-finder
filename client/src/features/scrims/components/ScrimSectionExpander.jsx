// hooks
import { useState, useCallback } from 'react';

// components
import Tooltip from '@/components/shared/Tooltip';

// utils
import { styled, alpha } from '@mui/material/styles';

// icons
import ShowLessIcon from '@mui/icons-material/ExpandLess';
import ShowMoreIcon from '@mui/icons-material/ExpandMore';

// the expand more or less button at the bottom of the scrim box at the home page
export default function ScrimSectionExpander({
  isBoxExpanded,
  setIsBoxExpanded,
  scrimBoxRef,
  scrimId,
}) {
  const [isHover, setIsHover] = useState(false);

  const blinkScrimBox = useCallback(() => {
    // when user clicks the expand more or less button, have an opacity transition to indicate where it is.

    // web animations api
    scrimBoxRef.current.animate(
      [{ opacity: 0, easing: 'ease-in' }, { opacity: 1 }],
      {
        direction: 'alternate',
        duration: 400,
        iterations: 1,
      }
    );
  }, [scrimBoxRef]);

  const scrollToScrimBox = useCallback((isCollapsing = false) => {
    if (scrimBoxRef.current && isCollapsing) {
      // Only scroll when collapsing
      setTimeout(() => {
        scrimBoxRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Use 'nearest' to keep it visible without jumping
          inline: 'nearest'
        });
      }, 150); // Small delay to ensure DOM updates after collapse animation
    }
  }, [scrimBoxRef]);

  return (
    <StyledDivider
      className={`scrim__expand--container ${
        isBoxExpanded ? 'collapsed' : ''
      }`}>
      {/*  I need to do it like this (ternary) to reset the tooltip */}
      {isBoxExpanded ? (
        <Tooltip title={'Show less'} open={isBoxExpanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setIsBoxExpanded(false);
              setIsHover(false);
              scrollToScrimBox(true); // Pass true for collapsing
              blinkScrimBox();
            }}>
            <ShowLessIcon className="modal__expandIcon" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip title={'Show More'} open={!isBoxExpanded && isHover}>
          <button
            onMouseOver={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="scrim__expand--expandButton"
            onClick={() => {
              setIsBoxExpanded(true);
              setIsHover(false);
              // Don't scroll when expanding - keep current position
              blinkScrimBox();
            }}>
            <ShowMoreIcon className="modal__expandIcon" />
          </button>
        </Tooltip>
      )}
    </StyledDivider>
  );
}

const StyledDivider = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '1100px',
  display: 'flex',
  justifyContent: 'center',
  boxShadow: 'none',
  margin: 'auto',
  boxSizing: 'inherit',
  zIndex: 10,
  '&.collapsed': {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    height: '6em',
    marginTop: '-6em',
    backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.3) 40%, transparent 70%)',
    borderRadius: '0 0 8px 8px',
  },
  '& .scrim__expand--expandButton': {
    position: 'absolute',
    bottom: 0,
    minWidth: '36px',
    minHeight: '36px',
    maxWidth: '46px',
    maxHeight: '46px',
    background: theme.palette.primary.main,
    backdropFilter: 'blur(10px)',
    paddingLeft: '0.8rem',
    paddingRight: '0.8rem',
    border: `1px solid ${theme.palette.primary.dark}`,
    transform: 'translateY(50%)',
    alignItems: 'center',
    appearance: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    opacity: 1,
    padding: '0.8rem',
    userSelect: 'none',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    zIndex: 11,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
    '&:hover': {
      background: theme.palette.primary.dark,
      border: `1px solid ${theme.palette.primary.dark}`,
      transform: 'translateY(50%) scale(1.1)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
    },
    '& .modal__expandIcon': {
      color: '#ffffff',
    },
  },
}));
