import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import useProfileAccountDetails from '../../hooks/useProfileAccountDetails';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';
import Tooltip from './../shared/Tooltip';
import AdminArea from '../shared/AdminArea';
import IconButton from '@mui/material/IconButton';

// icons
import EditIcon from '@mui/icons-material/Edit';
import EditUserModal from './../modals/EditUserModal';

export default function ProfileAccountDetails({
  user,
  setUser,
  userParticipatedScrims,
  stats,
}) {
  const history = useHistory();
  const userStats = useProfileAccountDetails(
    userParticipatedScrims,
    user,
    stats
  );

  const [openModal, setOpenModal] = useState(null);

  const dispatch = useDispatch();

  const onViewMoreClick = () => {
    dispatch({
      type: 'general/openFriendsModal',
      payload: { user },
    });
  };

  const handleModalOpen = (modalName) => {
    setOpenModal(modalName);
  };

  const handleModalClose = () => {
    setOpenModal(null);
  };

  const handleUserUpdate = (updatedUser, fieldType) => {
    // Update the user state first
    setUser((prevState) => ({
      ...prevState,
      ...updatedUser,
    }));

    // If summoner name or tagline was changed, update the URL
    if (fieldType === 'summonerName' || fieldType === 'tagline') {
      const newName = updatedUser.name || user.name;
      const newTagline = updatedUser.summonerTagline || user.summonerTagline;
      const region = user.region;

      // Build new URL path
      let newPath = `/users/${encodeURIComponent(newName)}?region=${region}`;
      if (newTagline) {
        newPath += `&tagline=${encodeURIComponent(newTagline)}`;
      }

      // Replace the current URL to update the address bar
      history.replace(newPath);
    }
  };

  if (!user?._id) return null;

  return (
    <>
      <Grid
        style={{ padding: 0, margin: 0 }}
        container
        direction="column"
        component="ul"
        spacing={1}>
        <Grid item spacing={1} container component="li" alignItems="center">
          <Grid item>
            <strong>Level:</strong>&nbsp;{userStats.userLevel}
            {userStats.expProgressPercent !== undefined && (
              <>
                &nbsp;|&nbsp;
                <span style={{ fontSize: '0.9em', color: '#888' }}>
                  {userStats.expProgressPercent}%
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    width: '100px',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    position: 'relative',
                    marginLeft: '8px',
                    verticalAlign: 'middle',
                  }}>
                  <span
                    style={{
                      display: 'block',
                      width: `${userStats.expProgressPercent}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </span>
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '0.9em',
                    color: '#888',
                  }}>
                  100%
                </span>
              </>
            )}
          </Grid>
        </Grid>

        <Grid item spacing={1} container component="li" alignItems="center">
          <Grid item>
            <strong>Friends:</strong>&nbsp;{user.friends.length}{' '}
            {user.friends.length > 0 ? (
              <>
                |&nbsp;
                <Tooltip title={`View ${user?.name}'s friends`}>
                  <span style={{ cursor: 'pointer' }} onClick={onViewMoreClick}>
                    <b>View more</b>
                  </span>
                </Tooltip>
              </>
            ) : null}
          </Grid>
        </Grid>

        <Grid item spacing={1} container component="li" alignItems="center">
          <Grid item>
            <strong>Games Played:</strong>&nbsp;{userStats.userGamesPlayedCount}
          </Grid>

          <Grid item>
            | <strong>Win Ratio:</strong>&nbsp;{userStats.userWinrate}%
          </Grid>
        </Grid>

        {userStats.userGamesCastedCount > 0 ? (
          <Grid item container component="li" alignItems="center">
            <strong>Games Casted:</strong>&nbsp;{userStats.userGamesCastedCount}
          </Grid>
        ) : null}

        <Grid item container component="li" alignItems="center" spacing={2}>
          <Grid item>
            <strong>Summoner Name:</strong>&nbsp;{user.name}
          </Grid>

          <AdminArea>
            <Grid item>
              <Tooltip title="Edit summoner name">
                <IconButton size="small" onClick={() => handleModalOpen('summonerName')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </AdminArea>
        </Grid>

        <Grid item container component="li" alignItems="center" spacing={2}>
          <Grid item>
            <strong>Tagline:</strong>&nbsp;{user.summonerTagline || 'Not set'}
          </Grid>

          <AdminArea>
            <Grid item>
              <Tooltip title="Edit tagline">
                <IconButton size="small" onClick={() => handleModalOpen('tagline')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </AdminArea>
        </Grid>

        <Grid item container component="li" alignItems="center">
          <strong>Discord:</strong>&nbsp;{user.discord}
        </Grid>

        <Grid item container component="li" alignItems="center">
          <strong>Region:</strong>&nbsp;{user.region}
        </Grid>

        <Grid item container component="li" alignItems="center" spacing={2}>
          <Grid item>
            <strong>Rank:</strong>&nbsp;{user.rank}
          </Grid>

          <AdminArea>
            <Grid item>
              <Tooltip title="Edit rank">
                <IconButton size="small" onClick={() => handleModalOpen('rank')}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>
          </AdminArea>
        </Grid>

        <Grid item container component="li" alignItems="center">
          <strong>Joined:</strong>&nbsp;
          <Moment format="MM/DD/yyyy">{user.createdAt}</Moment>
        </Grid>
      </Grid>

      <EditUserModal
        modalTitle={`Edit ${user?.name}'s Rank`}
        isOpen={openModal === 'rank'}
        openModal={openModal}
        onClose={handleModalClose}
        user={user}
        setUser={setUser}
        onUserUpdate={handleUserUpdate}
      />

      <EditUserModal
        modalTitle={`Edit ${user?.name}'s Summoner Name`}
        isOpen={openModal === 'summonerName'}
        openModal={openModal}
        onClose={handleModalClose}
        user={user}
        setUser={setUser}
        fieldToEdit="summonerName"
        onUserUpdate={handleUserUpdate}
      />

      <EditUserModal
        modalTitle={`Edit ${user?.name}'s Tagline`}
        isOpen={openModal === 'tagline'}
        openModal={openModal}
        onClose={handleModalClose}
        user={user}
        setUser={setUser}
        fieldToEdit="tagline"
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
}
