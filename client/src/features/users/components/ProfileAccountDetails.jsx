import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import useProfileAccountDetails from '@/features/users/hooks/useProfileAccountDetails';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';
import Tooltip from '@/components/shared/Tooltip';
import AdminArea from '@/features/admin/components/AdminArea';
import IconButton from '@mui/material/IconButton';

// icons
import EditIcon from '@mui/icons-material/Edit';
import EditUserModal from '@/features/admin/modals/EditUserModal';

export default function ProfileAccountDetails({
  user,
  setUser,
  userParticipatedScrims,
  stats,
  isOnline,
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
      <Grid container style={{ padding: 0, margin: 0 }} spacing={1}>
        {/* Level Bar - Full Width */}
        <Grid item xs={12} style={{ marginBottom: '8px' }}>
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            <strong>Level {userStats.userLevel}</strong>
            {userStats.expProgressPercent !== undefined && (
              <div style={{ marginTop: '4px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <span style={{ fontSize: '0.8em', color: '#888' }}>
                    {userStats.expProgressPercent}%
                  </span>
                  <div style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: '#333',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${userStats.expProgressPercent}%`,
                      height: '100%',
                      backgroundColor: '#4CAF50',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8em', color: '#888' }}>
                    100%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Grid>

        {/* Two Column Layout for Other Stats */}
        <Grid item xs={6} style={{ paddingRight: '8px' }}>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Summoner:</strong> {user.name}
              <AdminArea>
                <Tooltip title="Edit summoner name">
                  <IconButton
                    size="small"
                    onClick={() => handleModalOpen('summonerName')}
                    style={{ padding: '2px', marginLeft: '4px' }}>
                    <EditIcon style={{ fontSize: '14px' }} />
                  </IconButton>
                </Tooltip>
              </AdminArea>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Rank:</strong> {user.rank}
              <AdminArea>
                <Tooltip title="Edit rank">
                  <IconButton
                    size="small"
                    onClick={() => handleModalOpen('rank')}
                    style={{ padding: '2px', marginLeft: '4px' }}>
                    <EditIcon style={{ fontSize: '14px' }} />
                  </IconButton>
                </Tooltip>
              </AdminArea>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Region:</strong> {user.region}
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Games:</strong> {userStats.userGamesPlayedCount} ({userStats.userWinrate}% WR)
            </div>
          </div>
        </Grid>

        <Grid item xs={6}>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Tagline:</strong> {user.summonerTagline || 'Not set'}
              <AdminArea>
                <Tooltip title="Edit tagline">
                  <IconButton
                    size="small"
                    onClick={() => handleModalOpen('tagline')}
                    style={{ padding: '2px', marginLeft: '4px' }}>
                    <EditIcon style={{ fontSize: '14px' }} />
                  </IconButton>
                </Tooltip>
              </AdminArea>
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Discord:</strong> {user.discord}
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Friends:</strong> {user.friends.length}
              {user.friends.length > 0 && (
                <Tooltip title={`View ${user?.name}'s friends`}>
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      color: '#2196F3',
                      marginLeft: '8px',
                      fontSize: '0.85em'
                    }} 
                    onClick={onViewMoreClick}>
                    View
                  </span>
                </Tooltip>
              )}
            </div>
            
            <div style={{ marginBottom: '4px' }}>
              <strong>Joined:</strong> <Moment format="MM/DD/YY">{user.createdAt}</Moment>
            </div>
          </div>
        </Grid>

        {userStats.userGamesCastedCount > 0 && (
          <Grid item xs={12} style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Games Casted:</strong> {userStats.userGamesCastedCount}
            </div>
          </Grid>
        )}
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
