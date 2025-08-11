import { useState, useEffect, useMemo } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import useScrimStore from '@/features/scrims/stores/scrimStore';
import useAlerts from '@/hooks/useAlerts';
import useAuth from '@/features/auth/hooks/useAuth';
import moment from 'moment';

// components
import Navbar from '@/components/shared/Navbar/Navbar';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GlassPanel from '@/components/shared/GlassPanel';
import SectionHeader from '@/components/shared/SectionHeader';
import { GlassTextField, GlassSelect } from '@/components/shared/GlassInput';
import {
  PageContent,
  PageSection,
  InnerColumn,
} from '@/components/shared/PageComponents';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@/components/shared/Tooltip';
import Loading from '@/components/shared/Loading';
import DatePicker from '@/components/shared/DatePicker';
import TimePicker from '@/components/shared/TimePicker';

// icons
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

// utils
import devLog from '@/utils/devLog';
import {
  getScrimById,
  deleteScrim,
  regenerateTournamentCode,
} from '@/features/scrims/services/scrims.services';
import { sample } from '@/utils/sample';
import withAdminRoute from '@/features/admin/utils/withAdminRoute';

const RANDOM_HOST_CODE = '_$random'; // because input doesn't want value to be null, if lobbyhost is equal to this, send it as null in the back end

function ScrimEdit() {
  const { currentUser } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { updateScrimFromAPI } = useScrimStore();

  const [scrimData, setScrimData] = useState({
    teamWon: '',
    region: '',
    title: '',
    casters: [],
    teamOne: [],
    teamTwo: [],
    gameStartTime: moment(),
    lobbyName: '',
    lobbyPassword: '',
    lobbyHost: null,
    createdBy: null,
    previousLobbyHost: null,
    isPrivate: false,
    _lobbyHost: RANDOM_HOST_CODE, // _id
    isWithCasters: false,
    maxCastersAllowedCount: 0,
    riotTournament: null,
  });

  const { id } = useParams();
  const history = useHistory();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setUpdated] = useState(false);

  useEffect(() => {
    const prefillFormData = async () => {
      try {
        const oneScrim = await getScrimById(id);

        const {
          region,
          lobbyName,
          lobbyPassword,
          gameStartTime,
          teamOne,
          teamTwo,
        } = oneScrim;

        setScrimData({
          region,
          title: oneScrim?.title ?? `${oneScrim.createdBy.name}'s Scrim`, // default to this if no title exists in scrim
          lobbyName: oneScrim?.riotTournament?.tournamentCode || lobbyName,
          lobbyPassword,
          teamWon: oneScrim?.teamWon ?? null,
          gameStartTime: moment(gameStartTime),
          teamOne,
          teamTwo,
          previousLobbyHost: oneScrim?.lobbyHost ?? null,
          createdBy: oneScrim?.createdBy,
          casters: oneScrim?.casters,
          isPrivate: oneScrim?.isPrivate ?? false,
          _lobbyHost: oneScrim?.lobbyHost?._id ?? RANDOM_HOST_CODE,
          isWithCasters: oneScrim?.isWithCasters ?? false, // didn't exist in db in older versions
          maxCastersAllowedCount: oneScrim?.maxCastersAllowedCount ?? 2, // didn't exist in db in older versions
          riotTournament: oneScrim?.riotTournament ?? null,
          useTournamentCode: oneScrim?.useTournamentCode ?? true, // Default to true for backward compatibility
        });
      } catch (error) {
        history.push('/');

        setCurrentAlert({
          type: 'Error',
          message: 'Error finding scrim, returning to home page',
        });
      }
    };
    prefillFormData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'isWithCasters' && value) {
      setScrimData((prevState) => {
        const newIsWithCastersState = !prevState.isWithCasters;
        // if is with casters enabled, set it to 2 so user doesn't see 0.
        return {
          ...prevState,
          isWithCasters: newIsWithCastersState,
          maxCastersAllowedCount: newIsWithCastersState ? 2 : 0,
        };
      });

      return;
    }

    setScrimData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeDate = (newDateValue) => {
    if (newDateValue && moment.isMoment(newDateValue)) {
      setScrimData((prevState) => ({
        ...prevState,
        gameStartTime: newDateValue,
      }));
    }
  };

  const handleChangeTime = (newTimeValue) => {
    if (newTimeValue && moment.isMoment(newTimeValue)) {
      setScrimData((prevState) => {
        // Keep the current date but update the time
        const currentDate = moment.isMoment(prevState.gameStartTime)
          ? prevState.gameStartTime
          : moment();

        const updatedDateTime = currentDate
          .clone()
          .hour(newTimeValue.hour())
          .minute(newTimeValue.minute())
          .second(0)
          .millisecond(0);

        return {
          ...prevState,
          gameStartTime: updatedDateTime,
        };
      });
    }
  };

  let usersArr = useMemo(() => {
    let teamOne = scrimData?.teamOne.map((player) => player?._user);
    let teamTwo = scrimData?.teamTwo.map((player) => player?._user);
    let casters = scrimData?.casters.map((player) => player);

    let result = [
      ...teamOne,
      ...teamTwo,
      ...casters,
      scrimData.createdBy,
      currentUser,
    ];

    // unique values, currentUser can be createdBy and can be a caster or player.
    return [...new Set([...result])];
  }, [
    scrimData?.teamOne,
    scrimData?.casters,
    scrimData?.teamTwo,
    currentUser,
    scrimData.createdBy,
  ]);

  let idsArr = useMemo(() => {
    let teamOne = scrimData?.teamOne.map((player) => player?._user?._id);
    let teamTwo = scrimData?.teamTwo.map((player) => player?._user?._id);

    let casters = scrimData?.casters.map((player) => player?._id);

    let result = [
      ...teamOne,
      ...teamTwo,
      ...casters,
      scrimData.createdBy?._id,
      currentUser?._id,
    ];

    // unique values, currentUser can be createdBy and can be a caster or player.
    return [...new Set([...result])];
  }, [
    scrimData?.teamOne,
    scrimData?.casters,
    scrimData?.teamTwo,
    currentUser?._id,
    scrimData.createdBy?._id,
  ]);

  const getLobbyHost = async () => {
    const { teamOne, teamTwo } = scrimData;

    // if he didn't change values.
    if (scrimData._lobbyHost === scrimData.previousLobbyHost?._id) {
      devLog('previous lobby host');
      return scrimData?.previousLobbyHost;
    } else if (scrimData._lobbyHost === currentUser?._id) {
      //  if lobby host is current User
      devLog('current user');
      return currentUser;

      // if admin chose random
    } else if (scrimData._lobbyHost === RANDOM_HOST_CODE) {
      // if the lobby is full get a random player from the lobby to be the host.
      if ([...teamOne, ...teamTwo].length === 10) {
        devLog('getting random user to host');
        return sample([...teamOne, ...teamTwo])._user;
      } else {
        devLog("team size isn't 10, returning null (lobbyHost)");
        // if lobby isn't full return null so it will generate a host on the backend.
        return null;
      }
    }
    // if scrimData._lobbyHost has a value and it's not the previous host or currentUser.
    return usersArr.find((user) => user._id === scrimData._lobbyHost);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let yes = window.confirm('are you sure you want to update this scrim?');
      if (!yes) {
        setIsUpdating(false);
        return;
      }

      const dataSending = {
        ...scrimData,
        gameStartTime: moment(scrimData.gameStartTime).toISOString(),
        lobbyHost: await getLobbyHost(),
        lobbyName: scrimData.lobbyName || scrimData.title, // Default to title if lobby name not provided
        // if user selected N//A send null for teamWon, else send the actual value and result to null if undefined
        teamWon:
          scrimData?.teamWon === 'N/A' ? null : scrimData?.teamWon ?? null,
        maxCastersAllowedCount: scrimData.isWithCasters
          ? scrimData?.maxCastersAllowedCount
          : 0,
      };

      const updatedScrim = await updateScrimFromAPI(
        id,
        dataSending,
        setCurrentAlert
      );

      if (updatedScrim) {
        // Check if we need to generate a tournament code
        // (when enabling tournament code for scrims with full teams where game already started)
        if (
          dataSending.useTournamentCode && 
          !updatedScrim.riotTournament?.tournamentCode &&
          updatedScrim.teamOne?.length === 5 && 
          updatedScrim.teamTwo?.length === 5
        ) {
          // Check if game has already started
          const gameStartTime = moment(updatedScrim.gameStartTime);
          const now = moment();
          const gameHasStarted = now.isAfter(gameStartTime);
          
          if (gameHasStarted) {
            // For games that have already started with full teams,
            // we need to wait for the backend to generate the code via WebSocket
            setCurrentAlert({
              type: 'Info',
              message: 'Scrim updated! Tournament code is being generated. Please refresh the page in a few seconds.',
            });
            
            // Force a refresh of the scrim data after a short delay
            setTimeout(async () => {
              try {
                const refreshedScrim = await getScrimById(id);
                if (refreshedScrim?.riotTournament?.tournamentCode) {
                  setScrimData((prev) => ({
                    ...prev,
                    riotTournament: refreshedScrim.riotTournament,
                    lobbyName: refreshedScrim.riotTournament.tournamentCode,
                  }));
                  setCurrentAlert({
                    type: 'Success',
                    message: `Tournament code generated: ${refreshedScrim.riotTournament.tournamentCode}`,
                  });
                }
              } catch (error) {
                console.error('Error refreshing scrim data:', error);
              }
            }, 3000);
          } else {
            setCurrentAlert({
              type: 'Success',
              message: 'Scrim updated! Tournament code will be generated when the game starts.',
            });
          }
        } else {
          setCurrentAlert({
            type: 'Success',
            message: 'Scrim updated successfully!',
          });
        }
        setUpdated(true);
        setIsUpdating(false);
        return;
      } else {
        // This shouldn't happen if API returned 200, but let's log it
        console.error(
          'updateScrim returned falsy value despite success:',
          updatedScrim
        );
        setCurrentAlert({
          type: 'Error',
          message: 'Error updating Scrim - No data returned',
        });
        setIsUpdating(false);
        return;
      }
    } catch (error) {
      console.error('Error updating scrim:', error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        'Error updating Scrim';
      setCurrentAlert({
        type: 'Error',
        message: errorMsg,
      });
      setIsUpdating(false);

      return;
    }
  };

  const handleDeleteScrim = async () => {
    try {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this scrim? This action cannot be undone.'
      );
      if (!confirmDelete) return;

      await deleteScrim(id);
      setCurrentAlert({
        type: 'Success',
        message: 'Scrim deleted successfully!',
      });

      // Redirect to scrims page after successful deletion
      history.push('/');
    } catch (error) {
      console.error('Error deleting scrim:', error);
      setCurrentAlert({
        type: 'Error',
        message: 'Error deleting scrim',
      });
    }
  };

  const handleRegenerateTournamentCode = async () => {
    try {
      const confirmRegenerate = window.confirm(
        'Are you sure you want to regenerate the tournament code? The old code will no longer work.'
      );
      if (!confirmRegenerate) return;

      const response = await regenerateTournamentCode(id);

      if (response?.riotTournament?.tournamentCode) {
        setScrimData((prev) => ({
          ...prev,
          riotTournament: response.riotTournament,
          lobbyName: response.riotTournament.tournamentCode,
        }));

        setCurrentAlert({
          type: 'Success',
          message: `New tournament code generated: ${response.riotTournament.tournamentCode}`,
        });
      } else {
        setCurrentAlert({
          type: 'Error',
          message: 'Failed to generate new tournament code',
        });
      }
    } catch (error) {
      console.error('Error regenerating tournament code:', error);
      setCurrentAlert({
        type: 'Error',
        message:
          error?.response?.data?.error || 'Error regenerating tournament code',
      });
    }
  };

  if (isUpdated) {
    return <Redirect to={`/scrims/${id}`} />;
  }

  // if scrim isn't loaded, return loading component
  if (!scrimData?.createdBy || isUpdating) {
    return <Loading text={isUpdating ? 'Updating scrim' : 'Loading'} />;
  }

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <PageSection>
          <InnerColumn>
            <Typography
              variant="h1"
              align="center"
              sx={{ mb: 2, color: '#fff', fontWeight: 'bold', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              ⚙️ Edit Scrim
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: '100%', maxWidth: 1200 }}>
              <Grid container spacing={2}>
                {/* Date & Time Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="blue">
                    <SectionHeader icon="⏰">Schedule</SectionHeader>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          fullWidth
                          label={
                            <span style={{ color: '#fff' }}>
                              Game Start Date
                            </span>
                          }
                          variant="outlined"
                          onChange={handleChangeDate}
                          required
                          name="gameStartDate"
                          value={scrimData.gameStartTime}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(33, 150, 243, 0.5)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#fff',
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.8)',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TimePicker
                          fullWidth
                          label={
                            <span style={{ color: '#fff' }}>
                              Game Start Time
                            </span>
                          }
                          variant="outlined"
                          onChange={handleChangeTime}
                          required
                          name="gameStartTime"
                          value={scrimData?.gameStartTime}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(33, 150, 243, 0.5)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#fff',
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.8)',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </GlassPanel>
                </Grid>

                {/* Basic Information Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="elevated">
                    <SectionHeader icon="📝">Basic Information</SectionHeader>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <GlassTextField
                          onChange={handleChange}
                          required
                          name="title"
                          label="Scrim Title"
                          value={scrimData.title}
                          helperText={`📢 Example: ${scrimData?.createdBy?.name}'s Scrim`}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <GlassTextField
                          onChange={handleChange}
                          required
                          name="lobbyPassword"
                          label="Lobby Password"
                          value={scrimData.lobbyPassword}
                          helperText="🔑 Fallback password for manual lobby creation"
                          InputProps={{
                            endAdornment: (
                              <Tooltip title="This password is used for manual lobby creation if tournament code generation fails">
                                <InfoIcon
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'help',
                                  }}
                                />
                              </Tooltip>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>
                  </GlassPanel>
                </Grid>

                {/* Tournament Settings Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="elevated">
                    <SectionHeader icon="🏆">Tournament Settings</SectionHeader>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={scrimData.useTournamentCode !== false}
                          onChange={async (e) => {
                            const useTournament = e.target.checked;
                            
                            // If enabling tournament code and no code exists
                            if (useTournament && !scrimData.riotTournament?.tournamentCode) {
                              // Check if teams are full (countdown finished scenario)
                              const teamsFull = scrimData.teamOne.length === 5 && scrimData.teamTwo.length === 5;
                              
                              if (teamsFull) {
                                // Need to save the scrim first with useTournamentCode: true
                                // to create tournament data on the backend
                                setCurrentAlert({
                                  type: 'Info',
                                  message: 'Please save the scrim to generate a tournament code for full teams.',
                                });
                              }
                            }
                            
                            // Update state
                            setScrimData((prev) => ({
                              ...prev,
                              useTournamentCode: useTournament,
                              riotTournament: useTournament
                                ? prev.riotTournament
                                : null,
                              lobbyName: useTournament
                                ? prev.riotTournament?.tournamentCode ||
                                  prev.lobbyName ||
                                  prev.title
                                : prev.lobbyName || prev.title,
                            }));
                          }}
                          color="primary"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        />
                      }
                      label={
                        <Typography sx={{ color: '#fff', fontSize: '1rem' }}>
                          🎯 Use Riot Tournament Code (Auto-generated lobby)
                        </Typography>
                      }
                      sx={{ mb: 2 }}
                    />

                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                      {scrimData.useTournamentCode !== false
                        ? scrimData.riotTournament?.tournamentCode 
                          ? '✅ Tournament code is active and ready'
                          : scrimData.teamOne.length === 5 && scrimData.teamTwo.length === 5
                            ? '⚠️ Teams are full - save changes to generate tournament code'
                            : '✅ Tournament code will be auto-generated when the game starts with full teams'
                        : '⚠️ Players will need to manually create a custom lobby using the lobby name and password'}
                    </Typography>

                    {/* Only show lobby name field if NOT using tournament code */}
                    {!scrimData.useTournamentCode && (
                      <Box>
                        <Typography
                          variant="h3"
                          sx={{ mb: 2, color: '#fff', fontSize: '1.2rem' }}>
                          Custom Lobby Settings
                        </Typography>
                        <GlassTextField
                          name="lobbyName"
                          label="Lobby Name (Optional)"
                          value={scrimData.lobbyName || ''}
                          onChange={handleChange}
                          placeholder={`Defaults to "${
                            scrimData.title || 'Scrim Title'
                          }" if empty`}
                          helperText="💡 Leave empty to use scrim title as lobby name"
                          InputProps={{
                            endAdornment: (
                              <Tooltip title="Manual lobby name for custom game creation. If left empty, it will default to the scrim title">
                                <InfoIcon
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'help',
                                  }}
                                />
                              </Tooltip>
                            ),
                          }}
                        />
                      </Box>
                    )}

                    {/* Show tournament code info if using tournament code and code exists */}
                    {scrimData.useTournamentCode &&
                      scrimData.riotTournament?.tournamentCode && (
                        <Box>
                          <Typography
                            variant="h3"
                            sx={{ mb: 2, color: '#fff', fontSize: '1.2rem' }}>
                            Tournament Code
                          </Typography>
                          <Grid container alignItems="flex-end" spacing={2}>
                            <Grid item style={{ flex: 1 }}>
                              <GlassTextField
                                value={scrimData.riotTournament.tournamentCode}
                                disabled
                                label="Active Tournament Code"
                                InputProps={{
                                  style: {
                                    color: '#2196F3',
                                    fontWeight: 'bold',
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item>
                              <Tooltip title="Generate a new tournament code">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={handleRegenerateTournamentCode}
                                  sx={{
                                    borderColor: 'rgba(33, 150, 243, 0.5)',
                                    color: '#2196F3',
                                    '&:hover': {
                                      borderColor: '#2196F3',
                                      backgroundColor:
                                        'rgba(33, 150, 243, 0.1)',
                                    },
                                  }}>
                                  🔄 Regenerate
                                </Button>
                              </Tooltip>
                            </Grid>
                          </Grid>
                          <FormHelperText
                            sx={{
                              color: '#2196F3',
                              fontSize: '0.8rem',
                              mt: 1,
                            }}>
                            ✨ Tournament code auto-generated
                          </FormHelperText>
                        </Box>
                      )}
                  </GlassPanel>
                </Grid>

                {/* Game Configuration Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="default">
                    <SectionHeader icon="⚙️">Game Configuration</SectionHeader>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <GlassSelect
                          name="region"
                          value={scrimData.region}
                          onChange={handleChange}
                          helperText="🌍 Scrim Region">
                          {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map(
                            (region, key) => (
                              <MenuItem value={region} key={key}>
                                {region}
                              </MenuItem>
                            )
                          )}
                        </GlassSelect>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <GlassSelect
                          name="_lobbyHost"
                          onChange={handleChange}
                          value={scrimData._lobbyHost || RANDOM_HOST_CODE}
                          helperText="👤 Lobby Host">
                          {[RANDOM_HOST_CODE, ...idsArr].map((id, key) => {
                            if (id === RANDOM_HOST_CODE)
                              return (
                                <MenuItem
                                  value={RANDOM_HOST_CODE}
                                  key={RANDOM_HOST_CODE}>
                                  🎲 Random Host!
                                </MenuItem>
                              );

                            if (id === currentUser?._id) {
                              return (
                                <MenuItem value={id} key={key}>
                                  🎮 I will host!
                                </MenuItem>
                              );
                            }

                            return (
                              <MenuItem value={id} key={key}>
                                👤{' '}
                                {
                                  usersArr.find((user) => user?._id === id)
                                    ?.name
                                }
                              </MenuItem>
                            );
                          })}
                        </GlassSelect>
                      </Grid>

                      {scrimData.isWithCasters && (
                        <Grid item xs={12} sm={4}>
                          <GlassSelect
                            name="maxCastersAllowedCount"
                            value={scrimData.maxCastersAllowedCount}
                            onChange={handleChange}
                            helperText="🎤 Max Casters">
                            {[1, 2].map((value, key) => (
                              <MenuItem value={value} key={key}>
                                {value} Caster{value > 1 ? 's' : ''}
                              </MenuItem>
                            ))}
                          </GlassSelect>
                        </Grid>
                      )}
                    </Grid>
                  </GlassPanel>
                </Grid>

                {/* Game Results & Settings Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="default">
                    <SectionHeader icon="🏁">
                      Game Results & Settings
                    </SectionHeader>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <GlassSelect
                          name="teamWon"
                          value={scrimData.teamWon || 'N/A'}
                          onChange={handleChange}
                          helperText="🏆 Winner">
                          {['teamOne', 'teamTwo', 'N/A'].map((team, key) => {
                            const teamAliases = {
                              teamOne: '🔵 Team 1 (Blue Side)',
                              teamTwo: '🔴 Team 2 (Red Side)',
                              'N/A': '❓ N/A',
                            };
                            return (
                              <MenuItem value={team} key={key}>
                                {teamAliases[team]}
                              </MenuItem>
                            );
                          })}
                        </GlassSelect>
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            mt: 1,
                          }}>
                          <FormControlLabel
                            control={
                              <Tooltip
                                title="Is the scrim private?"
                                placement="top">
                                <Checkbox
                                  color="primary"
                                  checked={scrimData.isPrivate}
                                  onChange={() => {
                                    setScrimData((prevState) => ({
                                      ...prevState,
                                      isPrivate: !prevState.isPrivate,
                                    }));
                                  }}
                                  name="isPrivate"
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                />
                              </Tooltip>
                            }
                            label={
                              <Typography
                                sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                🔒 Private
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            control={
                              <Tooltip
                                title={
                                  scrimData.isWithCasters
                                    ? 'Disallow casting'
                                    : 'Allow casting'
                                }
                                placement="top">
                                <Checkbox
                                  color="primary"
                                  checked={scrimData.isWithCasters}
                                  onChange={handleChange}
                                  name="isWithCasters"
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                />
                              </Tooltip>
                            }
                            label={
                              <Typography
                                sx={{ color: '#fff', fontSize: '0.9rem' }}>
                                🎤 With Casters
                              </Typography>
                            }
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </GlassPanel>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <GlassPanel variant="blue" sx={{ textAlign: 'center' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          startIcon={<SaveIcon />}
                          fullWidth
                          size="large"
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderRadius: 2,
                            background:
                              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 20px rgba(33, 150, 243, 0.4)',
                            '&:hover': {
                              background:
                                'linear-gradient(45deg, #1976D2 30%, #03A9F4 90%)',
                              boxShadow: '0 5px 30px rgba(33, 150, 243, 0.6)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}>
                          💾 Save Changes
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          fullWidth
                          size="large"
                          onClick={handleDeleteScrim}
                          sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderRadius: 2,
                            background:
                              'linear-gradient(45deg, #f44336 30%, #e91e63 90%)',
                            boxShadow: '0 3px 20px rgba(244, 67, 54, 0.4)',
                            '&:hover': {
                              background:
                                'linear-gradient(45deg, #d32f2f 30%, #c2185b 90%)',
                              boxShadow: '0 5px 30px rgba(244, 67, 54, 0.6)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}>
                          🗑️ Delete Scrim
                        </Button>
                      </Grid>
                    </Grid>
                  </GlassPanel>
                </Grid>
              </Grid>
            </Box>
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}

export default withAdminRoute(ScrimEdit);
