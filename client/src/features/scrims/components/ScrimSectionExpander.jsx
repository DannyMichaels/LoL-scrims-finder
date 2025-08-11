// hooks
import { useState, useCallback } from 'react';

// components
import Tooltip from '@/components/shared/Tooltip';

// utils
import styled from '@emotion/styled'; // decided to use styled components because this is too much css

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

  const scrollToScrimBox = useCallback((isExpanding) => {
    if (scrimBoxRef.current) {
      // Use scrollIntoView for better control
      setTimeout(() => {
        scrimBoxRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        // Add a small offset for the navbar
        window.scrollBy({
          top: -100,
          behavior: 'smooth'
        });
      }, 100); // Small delay to ensure DOM updates
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
              scrollToScrimBox();
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

const StyledDivider = styled.div`
  position: relative;
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
  box-shadow: none;
  margin: auto;
  box-sizing: inherit;
  z-index: 10;
  &.collapsed {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    height: 6em;
    margin-top: -6em;
    background-image: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.6) 20%,
      rgba(0, 0, 0, 0.3) 40%,
      transparent 70%
    );
    border-radius: 0 0 8px 8px;
  }

  .scrim__expand--expandButton {
    position: absolute;
    bottom: 0;
    min-width: 36px;
    min-height: 36px;
    max-width: 46px;
    max-height: 46px;
    background: #2196f3;
    backdrop-filter: blur(10px);
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    border: 1px solid #1976d2;
    transform: translateY(50%);
    align-items: center;
    appearance: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    opacity: 1;
    padding: 0.8rem;
    user-select: none;
    border-radius: 50%;
    transition: all 0.3s ease;
    z-index: 11;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
    }

    &:hover {
      background: #1976d2;
      border: 1px solid #1565c0;
      transform: translateY(50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }

    .modal__expandIcon {
      color: #ffffff;
    }
  }
`;
