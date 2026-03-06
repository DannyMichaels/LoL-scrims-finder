import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import CancelIcon from '@mui/icons-material/Cancel';
import useBranding from '@/hooks/useBranding';
import useDraftStore from '../stores/draftStore';

const listItemSx = {
  py: 1,
  '&:hover': { background: 'rgba(200,155,60,0.06)' },
};
const iconSx = { color: '#5b5a56', fontSize: '1.1rem' };
const textSx = {
  '& .MuiListItemText-primary': {
    fontFamily: '"Spiegel", sans-serif',
    fontSize: '0.82rem',
    color: '#a09b8c',
  },
};

const DraftDrawer = ({ emitCancel }) => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const history = useHistory();
  const { brandName, logoUrl } = useBranding();
  const draft = useDraftStore((s) => s.draft);

  const showCancel =
    draft &&
    draft.status !== 'completed' &&
    draft.status !== 'cancelled';

  const handleCancel = () => {
    setConfirmOpen(false);
    setOpen(false);
    emitCancel?.();
  };

  const nav = (path) => {
    setOpen(false);
    setTimeout(() => history.push(path), 80);
  };

  return (
    <>
      {/* Menu button — fixed top-left */}
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 50,
          color: '#5b5a56',
          background: 'rgba(1,10,19,0.6)',
          border: '1px solid #1e2328',
          borderRadius: '4px',
          width: 34,
          height: 34,
          '&:hover': {
            color: '#c8aa6e',
            borderColor: '#463714',
            background: 'rgba(1,10,19,0.8)',
          },
        }}
      >
        <MenuIcon sx={{ fontSize: '1rem' }} />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            background: 'linear-gradient(180deg, #0c1018 0%, #0a0e13 100%)',
            borderRight: '1px solid #1e2328',
          },
        }}
      >
        {/* Brand header */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #1e2328',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {logoUrl && (
            <Box
              component="img"
              src={logoUrl}
              alt={brandName}
              sx={{ height: 30, width: 'auto' }}
            />
          )}
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#c8aa6e',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {brandName}
          </Typography>
        </Box>

        {/* Draft info */}
        {draft && (
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: '1px solid #1e2328',
              background: 'rgba(200,155,60,0.03)',
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.6rem',
                color: '#5b5a56',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                mb: 0.5,
              }}
            >
              Current Draft
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.78rem',
                color: '#a09b8c',
              }}
            >
              <Box component="span" sx={{ color: '#0ac8b9' }}>
                {draft.blueTeam.name}
              </Box>
              {' vs '}
              <Box component="span" sx={{ color: '#e84057' }}>
                {draft.redTeam.name}
              </Box>
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Spiegel", sans-serif',
                fontSize: '0.65rem',
                color: '#3c3c41',
                mt: 0.3,
              }}
            >
              {draft.bestOf > 1 ? `Best of ${draft.bestOf} · Game ${draft.gameNumber}` : 'Single Game'}
              {draft.fearlessMode !== 'off' &&
                ` · Fearless (${draft.fearlessMode})`}
            </Typography>
          </Box>
        )}

        {/* Nav links */}
        <List sx={{ pt: 1 }}>
          <ListItem button sx={listItemSx} onClick={() => nav('/scrims')}>
            <ListItemIcon><HomeIcon sx={iconSx} /></ListItemIcon>
            <ListItemText primary="Back to Scrims" sx={textSx} />
          </ListItem>

          <ListItem button sx={listItemSx} onClick={() => nav('/draft/new')}>
            <ListItemIcon><AddCircleOutlineIcon sx={iconSx} /></ListItemIcon>
            <ListItemText primary="New Draft" sx={textSx} />
          </ListItem>

          <Divider sx={{ borderColor: '#1e2328', my: 1 }} />

          <ListItem button sx={listItemSx} onClick={() => nav('/settings')}>
            <ListItemIcon><SettingsIcon sx={iconSx} /></ListItemIcon>
            <ListItemText primary="Settings" sx={textSx} />
          </ListItem>

          {showCancel && (
            <>
              <Divider sx={{ borderColor: '#1e2328', my: 1 }} />
              <ListItem
                button
                sx={{
                  ...listItemSx,
                  '&:hover': { background: 'rgba(232,64,87,0.06)' },
                }}
                onClick={() => setConfirmOpen(true)}
              >
                <ListItemIcon><CancelIcon sx={{ color: '#5b5a56', fontSize: '1.1rem' }} /></ListItemIcon>
                <ListItemText
                  primary="Cancel Draft"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontFamily: '"Spiegel", sans-serif',
                      fontSize: '0.82rem',
                      color: '#5b5a56',
                    },
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Cancel confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0c1018 0%, #0a0e13 100%)',
            border: '1px solid #1e2328',
            borderRadius: '4px',
            minWidth: 320,
          },
        }}
      >
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Beaufort for LOL", serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#f0e6d2',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textAlign: 'center',
              mb: 1,
            }}
          >
            Cancel Draft?
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.8rem',
              color: '#5b5a56',
              textAlign: 'center',
            }}
          >
            This will end the draft for all participants.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{
              px: 3,
              py: 0.7,
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: '2px',
              color: '#a09b8c',
              border: '1px solid #1e2328',
              '&:hover': { background: 'rgba(255,255,255,0.03)', borderColor: '#463714' },
            }}
          >
            Go Back
          </Button>
          <Button
            onClick={handleCancel}
            sx={{
              px: 3,
              py: 0.7,
              fontFamily: '"Spiegel", sans-serif',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              borderRadius: '2px',
              color: '#e84057',
              border: '1px solid rgba(232,64,87,0.3)',
              background: 'rgba(232,64,87,0.08)',
              '&:hover': { background: 'rgba(232,64,87,0.15)', borderColor: 'rgba(232,64,87,0.5)' },
            }}
          >
            Cancel Draft
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DraftDrawer;
