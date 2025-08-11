// hooks
import { useState, useCallback } from 'react';
import useAuth, { useAuthActions } from '@/features/auth/hooks/useAuth';
import { makeStyles, useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useUsers from '@/features/users/hooks/useUsers';
import { useDispatch } from 'react-redux';

// Mui components
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Hidden from '@mui/material/Hidden';
import Typography from '@mui/material/Typography';
import ClickAwayListener from '@mui/material/ClickAwayListener';

// components
import { Link } from 'react-router-dom';
import NavbarDrawer from './NavbarDrawer';
import HideOnScroll from '@/components/shared/HideOnScroll';
import { InnerColumn } from '@/components/shared/PageComponents';
import Tooltip from '@/components/shared/Tooltip';
import NavbarCheckboxes from './NavbarCheckboxes';
import NavbarDropdowns from './NavbarDropdowns';
import UserSearchBar from './UserSearchBar';
import NotificationsButton from './NotificationsButton';
import MessengerButton from '@/features/messenger/components/MessengerButton';

// icons
import KeyIcon from '@mui/icons-material/VpnKey';
import MenuIcon from '@mui/icons-material/Menu'; // burger icon
import SchoolIcon from '@mui/icons-material/School';

const useStyles = makeStyles((theme) => ({
  offset: {
    ...theme.mixins.toolbar,
    minHeight: '48px',
  },
  toolbarDistance: {
    minHeight: '20px',
  },

  toolbar: {
    paddingTop: '8px',
    paddingBottom: '8px',
    minHeight: '48px !important',
  },
}));

export default function Navbar({
  showDropdowns,
  showLess,
  showCheckboxes,
  noLogin = false,
  noSpacer = false,
  noGuide = false,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessengerDropdownOpen, setIsMessengerDropdownOpen] = useState(false);

  const classes = useStyles();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { usersLoaded, usersSearchValue } = useUsers();
  const { currentUser } = useAuth();
  const { handleLogin } = useAuthActions();
  const dispatch = useDispatch();

  const openMessengerDropdown = useCallback(() => {
    setIsMessengerDropdownOpen((prevState) => !prevState);
  }, []);

  return (
    <>
      <HideOnScroll>
        <AppBar 
          position="sticky"
          sx={{
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(33, 150, 243, 0.1)',
          }}
        >
          <Toolbar 
            className={classes.toolbar}
            sx={{ minHeight: '64px !important' }}
          >
            <InnerColumn>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 2,
                }}
              >
                {/* Left Section - Logo & Search */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Link
                    to="/"
                    className="link-2"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src="/reluminate-logo.png"
                      style={{
                        width: '36px',
                        height: 'auto',
                      }}
                      alt="Reluminate.gg"
                    />
                    <Hidden mdDown>
                      <Typography
                        component="h1"
                        sx={{
                          fontSize: '1.3rem',
                          fontWeight: 700,
                          color: '#2196F3',
                          whiteSpace: 'nowrap',
                          background: 'linear-gradient(135deg, #2196F3, #64B5F6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        RELUMINATE.GG
                      </Typography>
                    </Hidden>
                  </Link>

                  {/* Search Bar */}
                  {usersLoaded && currentUser?.uid && (
                    <ClickAwayListener
                      onClickAway={() => {
                        if (isSearchOpen) setIsSearchOpen(false);
                        if (usersSearchValue) {
                          dispatch({ type: 'users/setSearch', payload: '' });
                        }
                      }}
                    >
                      <Box
                        onClick={() => setIsSearchOpen(true)}
                        sx={{ minWidth: 120, maxWidth: 240 }}
                      >
                        <UserSearchBar
                          setIsSearchOpen={setIsSearchOpen}
                          isSearchOpen={isSearchOpen}
                        />
                      </Box>
                    </ClickAwayListener>
                  )}
                </Box>

                {/* Center Section - Controls (when expanded) */}
                {!showLess && (
                  <Hidden lgDown>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      {showCheckboxes && <NavbarCheckboxes compact />}
                      {showDropdowns && <NavbarDropdowns compact />}
                    </Box>
                  </Hidden>
                )}

                {/* Right Section - User Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!currentUser?.uid && !noGuide && (
                    <Button
                      component={Link}
                      to="/guide"
                      variant="outlined"
                      size="small"
                      startIcon={<SchoolIcon />}
                      sx={{
                        borderColor: 'rgba(33, 150, 243, 0.3)',
                        color: '#2196F3',
                        '&:hover': {
                          borderColor: '#2196F3',
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        },
                      }}
                    >
                      <Hidden smDown>Guide</Hidden>
                    </Button>
                  )}

                  {!currentUser?.uid && !noLogin && (
                    <Button
                      onClick={handleLogin}
                      variant="contained"
                      size="small"
                      startIcon={<KeyIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #64B5F6, #2196F3)',
                        },
                      }}
                    >
                      Log In
                    </Button>
                  )}

                  {currentUser?.uid && (
                    <>
                      <MessengerButton
                        isMessengerDropdownOpen={isMessengerDropdownOpen}
                        setIsMessengerDropdownOpen={setIsMessengerDropdownOpen}
                        isScrim={false}
                        onClick={openMessengerDropdown}
                      />
                      <NotificationsButton />
                      <Tooltip title="More options">
                        <IconButton
                          size="small"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setIsDrawerOpen(true)}
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                        >
                          <MenuIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </InnerColumn>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <NavbarDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        showCheckboxes={showCheckboxes}
        showDropdowns={showDropdowns}
        showLess={showLess}
      />

      <div className={classes.offset} />
      {!noSpacer && <div className={classes.toolbarDistance} />}
    </>
  );
}
