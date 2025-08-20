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
import Tooltip from '@/components/shared/Tooltip';
import {
  PersonAdd as PersonAddIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';

// Store
import useScrimStore from '@/features/scrims/stores/scrimStore';

// Hooks
import useUsers from '@/features/users/hooks/useUsers';
import useAuth from '@/features/auth/hooks/useAuth';
import useAlerts from '@/hooks/useAlerts';

// Utils
import { getRankImage } from '@/utils/getRankImage';

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const TEAMS = [
  { value: 'teamOne', label: 'Team One (Blue)' },
  { value: 'teamTwo', label: 'Team Two (Red)' },
];

export default function AdminPlayerControls({ scrim }) {
  const { isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { allUsers } = useUsers();
  const { adminAssignPlayer, adminFillRandom } = useScrimStore();

  // State for manual assignment dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [fillLoading, setFillLoading] = useState(false);

  // Filter users for autocomplete
  const filteredUsers = useMemo(() => {
    if (!searchValue || searchValue.length < 2) return [];

    return allUsers
      .filter((user) => {
        // Must be same region
        if (user.region !== scrim.region) return false;

        // Check if input contains # for Riot ID search
        if (searchValue.includes('#')) {
          const [searchName, searchTagline] = searchValue.split('#');
          const nameMatch = user.name
            .toLowerCase()
            .includes(searchName.toLowerCase());
          const taglineMatch = searchTagline
            ? user.summonerTagline
                ?.toLowerCase()
                .includes(searchTagline.toLowerCase())
            : true;
          return nameMatch && taglineMatch;
        }

        // Otherwise search by name or tagline separately
        const nameMatch = user.name
          .toLowerCase()
          .includes(searchValue.toLowerCase());
        const taglineMatch = user.summonerTagline
          ?.toLowerCase()
          .includes(searchValue.toLowerCase());
        return nameMatch || taglineMatch;
      })
      .slice(0, 10); // Limit results
  }, [allUsers, searchValue, scrim.region]);

  if (!isCurrentUserAdmin) return null;

  const handleAssignPlayer = async () => {
    if (!selectedUser || !selectedTeam || !selectedRole) {
      setCurrentAlert({
        type: 'Error',
        message: 'Please select a user, team, and role',
      });
      return;
    }

    setAssignLoading(true);

    try {
      const updatedScrim = await adminAssignPlayer(
        scrim._id,
        selectedUser._id,
        selectedTeam,
        selectedRole,
        setCurrentAlert
      );

      if (updatedScrim) {
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
    const teamOneFilledRoles = scrim.teamOne.map((player) => player.role);
    const teamTwoFilledRoles = scrim.teamTwo.map((player) => player.role);
    const emptyCount =
      5 - teamOneFilledRoles.length + (5 - teamTwoFilledRoles.length);

    if (emptyCount === 0) {
      setCurrentAlert({
        type: 'Info',
        message: 'No empty positions to fill',
      });
      return;
    }

    setFillLoading(true);

    try {
      await adminFillRandom(scrim._id, scrim.region, setCurrentAlert);
    } catch (error) {
      console.error('Error filling random positions:', error);
    } finally {
      setFillLoading(false);
    }
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedUser(null);
    setSelectedTeam('');
    setSelectedRole('');
    setSearchValue('');
  };

  const handleOpenAssignDialog = () => {
    setSelectedTeam('');
    setSelectedRole('');
    setAssignDialogOpen(true);
  };

  const getEmptyPositionsCount = () => {
    const teamOneFilledRoles = scrim.teamOne.map((player) => player.role);
    const teamTwoFilledRoles = scrim.teamTwo.map((player) => player.role);
    return 5 - teamOneFilledRoles.length + (5 - teamTwoFilledRoles.length);
  };

  const emptyPositionsCount = getEmptyPositionsCount();

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAssignDialog}
          size="small">
          Assign Player
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={
            fillLoading ? <CircularProgress size={20} /> : <ShuffleIcon />
          }
          onClick={handleFillRandom}
          disabled={fillLoading || emptyPositionsCount === 0}
          size="small">
          {fillLoading ? 'Filling...' : `Fill Random (${emptyPositionsCount})`}
        </Button>
      </Box>

      {/* Assignment Dialog for general assignment */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Assign Player to Scrim</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* User Search */}
            <Autocomplete
              options={filteredUsers}
              getOptionLabel={(option) => {
                const tagline = option.summonerTagline
                  ? `#${option.summonerTagline}`
                  : '';
                return `${option.name}${tagline} (${option.region}) - ${
                  option.rank || 'Unranked'
                }`;
              }}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              inputValue={searchValue}
              onInputChange={(event, newInputValue) =>
                setSearchValue(newInputValue)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Users"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  placeholder="Type player name or GameName#Tagline..."
                  fullWidth
                  margin="normal"
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option._id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  ? 'Type at least 2 characters to search'
                  : 'No users found'
              }
            />

            {/* Team Selection */}
            <TextField
              select
              fullWidth
              margin="normal"
              label="Select Team"
              InputLabelProps={{
                shrink: true,
              }}
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              SelectProps={{ native: true }}>
              <option value="">Choose a team...</option>
              {TEAMS.map((team) => (
                <option key={team.value} value={team.value}>
                  {team.label}
                </option>
              ))}
            </TextField>

            {/* Role Selection */}
            <TextField
              select
              fullWidth
              margin="normal"
              label="Select Role"
              InputLabelProps={{
                shrink: true,
              }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              SelectProps={{ native: true }}>
              <option value="">Choose a role...</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </TextField>

            {/* Selected User Preview */}
            {selectedUser && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Player:
                </Typography>
                <Typography variant="body2">
                  <strong>
                    {selectedUser.name}
                    {selectedUser.summonerTagline && (
                      <span style={{ color: '#666', fontWeight: 'normal' }}>
                        #{selectedUser.summonerTagline}
                      </span>
                    )}
                  </strong>{' '}
                  ({selectedUser.region}) - {selectedUser.rank || 'Unranked'}
                  {selectedUser.discord && ` • ${selectedUser.discord}`}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={handleAssignPlayer}
            variant="contained"
            disabled={
              assignLoading || !selectedUser || !selectedTeam || !selectedRole
            }>
            {assignLoading ? 'Assigning...' : 'Assign Player'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
