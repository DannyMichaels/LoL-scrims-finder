import React, { useRef, useState } from 'react';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiPaper from '@mui/material/Paper';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// utils
import { isMobile } from '@/utils/navigator';
import Tooltip from './Tooltip';

export const styles = (theme) => ({
  title: {
    margin: 0,
    padding: theme.spacing(2),
    fontWeight: 700,
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute !important',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },

  goBackButton: {
    position: 'absolute !important',
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

export const DialogTitle = withStyles(styles)((props) => {
  const {
    children,
    renderBackButton,
    onClickBack,
    classes,
    onClose,
    ...other
  } = props;
  return (
    <>
      {renderBackButton ? (
        <Tooltip title="Go back">
          <IconButton
            aria-label="go back"
            className={classes.goBackButton}
            onClick={onClickBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      <MuiDialogTitle
        className={classes.title}
        component="h1"
        variant="h6"
        {...other}>
        {children}
      </MuiDialogTitle>
      {onClose ? (
        <Tooltip title="Close">
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </>
  );
});

export const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const DraggablePaper = React.forwardRef((props, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const paperRef = useRef(null);

  const handleMouseDown = (e) => {
    // Don't start drag if clicking on input elements or buttons
    const clickedElement = e.target;
    if (
      clickedElement.tagName === 'INPUT' ||
      clickedElement.tagName === 'TEXTAREA' ||
      clickedElement.tagName === 'BUTTON' ||
      clickedElement.closest('._draggable__input') ||
      clickedElement.closest('button')
    ) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <MuiPaper
      {...props}
      ref={paperRef}
      onMouseDown={handleMouseDown}
      style={{
        ...props.style,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    />
  );
});

const DraggableModal = ({ children, ...rest }) => {
  const isMobileDevice = isMobile();

  // if user didn't type anything, it's draggable.
  // if it's not a mobile device, it's draggable
  return !isMobileDevice ? (
    <MuiDialog {...rest} PaperComponent={DraggablePaper}>
      {children}
    </MuiDialog>
  ) : (
    // if device is mobile, don't make dialog draggable
    <MuiDialog {...rest}>{children}</MuiDialog>
  );
};

export const Modal = React.memo(
  ({
    children,
    onClose,
    title,
    open,
    actionButtonProps,
    actionButtonStyle,
    customStyles = null,
    renderBackButton = false,
    onClickBack = null,
    contentClassName = 'modal__content',
    closeBtnTitle = 'Close',
  }) => {
    return (
      <DraggableModal open={open} onClose={onClose}>
        <DialogTitle
          renderBackButton={renderBackButton}
          onClickBack={onClickBack}
          onClose={onClose}>
          {title}
        </DialogTitle>

        <DialogContent
          dividers
          className={contentClassName}
          style={
            customStyles
              ? {
                  ...customStyles,
                }
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '350px',
                  maxHeight: '300px',
                  overflowWrap: 'break-word',
                }
          }>
          {children}
        </DialogContent>

        <DialogActions>
          {actionButtonProps && (
            <Button
              type="primary"
              style={actionButtonStyle ? actionButtonStyle : null}
              onClick={() => actionButtonProps.onClick()}
              variant="contained"
              {...actionButtonProps.appearance}>
              {actionButtonProps.title}
            </Button>
          )}

          <Button color="secondary" onClick={onClose} variant="contained">
            {closeBtnTitle}
          </Button>
        </DialogActions>
      </DraggableModal>
    );
  }
);
