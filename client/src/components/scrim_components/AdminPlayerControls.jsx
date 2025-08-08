import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import Tooltip from '../shared/Tooltip';
import {
  PersonAdd as PersonAddIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';

// Services
import { adminAssignPlayer, adminFillRandomPositions } from '../../services/scrims.services';
import useUsers from '../../hooks/useUsers';

// Hooks
import useAuth from '../../hooks/useAuth';
import useAlerts from '../../hooks/useAlerts';

// Utils
import { getRankImage } from '../../utils/getRankImage';

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const TEAMS = [
  { value: 'teamOne', label: 'Team One (Blue)' },
  { value: 'teamTwo', label: 'Team Two (Red)' }
];

export default function AdminPlayerControls({ 
  scrim, 
  setScrim, 
  socket,
  specificRole = null,
  specificTeam = null 
}) {
  const { isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { allUsers } = useUsers();

  // State for manual assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(specificTeam || '');
  const [selectedRole, setSelectedRole] = useState(specificRole || '');
  const [searchValue, setSearchValue] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [fillLoading, setFillLoading] = useState(false);

  // Filter users for autocomplete
  const filteredUsers = useMemo(() => {
    if (!searchValue || searchValue.length < 2) return [];
    
    return allUsers
      .filter(user => 
        user.name.toLowerCase().includes(searchValue.toLowerCase()) &&
        user.region === scrim.region // Filter by same region
      )
      .slice(0, 10); // Limit results
  }, [allUsers, searchValue, scrim.region]);

  if (!isCurrentUserAdmin) return null;

  const handleAssignPlayer = async () => {
    if (!selectedUser || !selectedTeam || !selectedRole) {
      setCurrentAlert({
        type: 'Error',
        message: 'Please select a user, team, and role'
      });
      return;
    }

    setAssignLoading(true);

    try {
      const updatedScrim = await adminAssignPlayer({
        scrimId: scrim._id,
        userId: selectedUser._id,
        teamName: selectedTeam,
        role: selectedRole,
        setAlert: setCurrentAlert,
        setButtonsDisabled: () => {},
        setScrim,
      });

      if (updatedScrim) {
        socket?.emit('sendScrimTransaction', updatedScrim);
        handleCloseAssignDialog();
      }
    } catch (error) {
      console.error('Error assigning player:', error);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFillRandom = async () => {
    // Count empty positions correctly
    const teamOneFilledRoles = scrim.teamOne.map(player => player.role);
    const teamTwoFilledRoles = scrim.teamTwo.map(player => player.role);
    const emptyCount = (5 - teamOneFilledRoles.length) + (5 - teamTwoFilledRoles.length);

    if (emptyCount === 0) {
      setCurrentAlert({
        type: 'Info',
        message: 'No empty positions to fill'
      });
      return;
    }

    setFillLoading(true);

    try {
      const result = await adminFillRandomPositions({
        scrimId: scrim._id,
        region: scrim.region,
        setAlert: setCurrentAlert,
        setButtonsDisabled: () => {},
        setScrim,
      });

      if (result && result.scrim) {
        // Make sure to update the local state with the returned scrim
        setScrim(result.scrim);
        socket?.emit('sendScrimTransaction', result.scrim);
      }
    } catch (error) {
      console.error('Error filling random positions:', error);
    } finally {
      setFillLoading(false);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedUser(null);
    setSelectedTeam(specificTeam || '');
    setSelectedRole(specificRole || '');
    setSearchValue('');
  };

  const handleOpenAssignDialog = () => {
    setSelectedTeam(specificTeam || '');
    setSelectedRole(specificRole || '');
    setAssignDialogOpen(true);
  };

  const getEmptyPositionsCount = () => {
    const teamOneFilledRoles = scrim.teamOne.map(player => player.role);
    const teamTwoFilledRoles = scrim.teamTwo.map(player => player.role);
    return (5 - teamOneFilledRoles.length) + (5 - teamTwoFilledRoles.length);
  };

  const emptyPositionsCount = getEmptyPositionsCount();

  // If this is for a specific position, show icon button like the door icons
  if (specificRole && specificTeam) {
    return (
      <>
        <Tooltip title={`Assign player to ${specificTeam === 'teamOne' ? 'Team One' : 'Team Two'} - ${specificRole}`}>
          <span>
            <IconButton
              onClick={handleOpenAssignDialog}
              size="small"
            >
              <PersonAddIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* Assignment Dialog */}
        <Dialog 
          open={assignDialogOpen} 
          onClose={handleCloseAssignDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Assign Player to {selectedTeam === 'teamOne' ? 'Team One' : 'Team Two'} - {selectedRole}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              {/* User Search */}
              <Autocomplete
                options={filteredUsers}
                getOptionLabel={(option) => `${option.name} (${option.region}) - ${option.rank || 'Unranked'}`}
                value={selectedUser}
                onChange={(event, newValue) => setSelectedUser(newValue)}
                inputValue={searchValue}
                onInputChange={(event, newInputValue) => setSearchValue(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Users"
                    placeholder="Type player name..."
                    fullWidth
                    margin="normal"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <img
                      src={getRankImage(option)}
                      width="20px"
                      alt={option.rank || 'Unranked'}
                    />
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.region} • {option.rank || 'Unranked'}
                        {option.discord && ` • ${option.discord}`}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText={
                  searchValue.length < 2 
                    ? "Type at least 2 characters to search" 
                    : "No users found"
                }
              />

              {/* Selected User Preview */}
              {selectedUser && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Player:
                  </Typography>
                  <Typography variant="body2">
                    <strong>{selectedUser.name}</strong> ({selectedUser.region}) - {selectedUser.rank || 'Unranked'}
                    {selectedUser.discord && ` • ${selectedUser.discord}`}
                  </Typography>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAssignDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignPlayer}
              variant="contained"
              disabled={!selectedUser || assignLoading}
              startIcon={assignLoading ? <CircularProgress size={20} /> : null}
            >
              {assignLoading ? 'Assigning...' : 'Assign Player'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Main admin controls (shown in header)
  return (
    <Button
      variant="contained"
      color="primary" 
      startIcon={fillLoading ? <CircularProgress size={20} /> : <ShuffleIcon />}
      onClick={handleFillRandom}
      disabled={fillLoading || emptyPositionsCount === 0}
      size="small"
    >
      {fillLoading ? 'Filling...' : `Fill Random (${emptyPositionsCount})`}
    </Button>
  );
}