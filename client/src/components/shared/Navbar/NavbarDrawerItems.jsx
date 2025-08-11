import { useState } from 'react';
import { useDispatch } from 'react-redux';
import useAuth, { useAuthActions } from '@/features/auth/hooks/useAuth';
import { useHistory } from 'react-router-dom';
import useSummonerProfile from '@/features/users/hooks/useSummonerProfile';
import { RANK_IMAGES } from '@/utils/imageMaps';

// components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitIcon from '@mui/icons-material/ExitToApp';
import GamesIcon from '@mui/icons-material/Games';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';
import GavelIcon from '@mui/icons-material/Gavel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function NavbarDrawerItems({ showCheckboxes, setIsDrawerOpen }) {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { handleLogout } = useAuthActions();
  const dispatch = useDispatch();
  const history = useHistory();

  // Fetch summoner profile data for avatar
  const { profileData, isLoading: isProfileLoading } = useSummonerProfile(
    currentUser?.summonerName || currentUser?.name,
    currentUser?.summonerTagline,
    currentUser?.region
  );

  console.log('profileData', profileData);
  const [openSections, setOpenSections] = useState({
    gaming: false,
    social: false,
    admin: false,
    help: false,
  });

  const handleSectionClick = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const drawerNavPush = async (path) => {
    setIsDrawerOpen(false);
    await sleep(80);
    history.push(path);
  };

  const handleActionWithClose = (action) => {
    action();
  };

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {/* User Profile Header */}
      {currentUser?._id && (
        <Box
          sx={{
            p: 2,
            background:
              'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
          <ListItem
            button
            onClick={() =>
              drawerNavPush(
                `/users/${currentUser?.name}?region=${currentUser?.region}`
              )
            }
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}>
            <ListItemIcon>
              {isProfileLoading ? (
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                    '&::after': {
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)',
                    },
                  }}
                />
              ) : (
                <Avatar
                  src={profileData?.profileIcon}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontWeight: 'bold',
                  }}>
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </ListItemIcon>
            <Box sx={{ ml: 1, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, color: '#fff' }}>
                  {currentUser?.name}
                </Typography>
                {currentUser?.summonerTagline && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    #{currentUser.summonerTagline}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {currentUser?.rank && RANK_IMAGES[currentUser.rank] && (
                  <img
                    src={RANK_IMAGES[currentUser.rank]}
                    alt={currentUser.rank}
                    style={{ width: '18px', height: '18px' }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {currentUser?.rank} • {currentUser?.region}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        </Box>
      )}

      <List sx={{ pt: 0 }}>
        {/* Quick Actions */}
        <ListItem button onClick={() => drawerNavPush('/')}>
          <ListItemIcon>
            <HomeIcon sx={{ color: '#2196F3' }} />
          </ListItemIcon>
          <ListItemText
            primary="Home"
            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
          />
        </ListItem>

        <Divider sx={{ opacity: 0.2 }} />

        {/* Gaming Section */}
        {currentUser?._id && (
          <>
            <ListItemButton onClick={() => handleSectionClick('gaming')}>
              <ListItemIcon>
                <GamesIcon sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText
                primary="Gaming"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
              {openSections.gaming ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.gaming} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => drawerNavPush('/scrims')}>
                  <ListItemIcon>
                    <EmojiEventsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Browse Scrims"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Social Section */}
        {currentUser?._id && (
          <>
            <ListItemButton onClick={() => handleSectionClick('social')}>
              <ListItemIcon>
                <PeopleIcon sx={{ color: '#E91E63' }} />
              </ListItemIcon>
              <ListItemText
                primary="Social"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
              {currentUser?.friendRequests?.length > 0 && (
                <Chip
                  label={currentUser.friendRequests.length}
                  size="small"
                  color="error"
                  sx={{ mr: 1 }}
                />
              )}
              {openSections.social ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.social} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() =>
                    handleActionWithClose(() => {
                      dispatch({
                        type: 'general/openFriendsModal',
                        payload: { user: currentUser },
                      });
                    })
                  }>
                  <ListItemIcon>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="My Friends"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() =>
                    handleActionWithClose(() => {
                      dispatch({
                        type: 'general/openFriendRequests',
                      });
                    })
                  }>
                  <ListItemIcon>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Friend Requests"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                  {currentUser?.friendRequests?.length > 0 && (
                    <Chip
                      label={currentUser.friendRequests.length}
                      size="small"
                      color="error"
                    />
                  )}
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Admin Section */}
        {isCurrentUserAdmin && (
          <>
            <ListItemButton
              onClick={() => handleSectionClick('admin')}
              sx={{
                background:
                  'linear-gradient(90deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                '&:hover': {
                  background:
                    'linear-gradient(90deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%)',
                },
              }}>
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText
                primary="Admin"
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
              {openSections.admin ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.admin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => drawerNavPush('/admin/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" sx={{ color: '#FF9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Admin Dashboard"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => drawerNavPush('/scrims/new')}>
                  <ListItemIcon>
                    <CreateIcon fontSize="small" sx={{ color: '#FF9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Create Scrim"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem
                  button
                  sx={{ pl: 4 }}
                  onClick={() => drawerNavPush('/admin/bans')}>
                  <ListItemIcon>
                    <GavelIcon fontSize="small" sx={{ color: '#f44336' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ban Management"
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        {/* Help Section */}
        <ListItemButton onClick={() => handleSectionClick('help')}>
          <ListItemIcon>
            <InfoIcon sx={{ color: '#9C27B0' }} />
          </ListItemIcon>
          <ListItemText
            primary="Help & Info"
            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }}
          />
          {openSections.help ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSections.help} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              button
              sx={{ pl: 4 }}
              onClick={() => drawerNavPush('/guide')}>
              <ListItemIcon>
                <SchoolIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="User Guide"
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ my: 1, opacity: 0.2 }} />

        {/* Account Section */}
        {currentUser?._id && (
          <ListItem button onClick={() => drawerNavPush('/settings')}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#607D8B' }} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
            />
          </ListItem>
        )}

        {currentUser?._id && (
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
              },
            }}>
            <ListItemIcon>
              <ExitIcon sx={{ color: '#f44336' }} />
            </ListItemIcon>
            <ListItemText
              primary="Log Out"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#f44336',
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
}
