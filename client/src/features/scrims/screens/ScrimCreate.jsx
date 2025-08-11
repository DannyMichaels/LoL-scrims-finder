import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useScrimStore from '@/features/scrims/stores/scrimStore';
import useAlerts from '@/hooks/useAlerts';
import useAuth from '@/features/auth/hooks/useAuth';
import moment from 'moment';

// components
import Navbar from '@/components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Tooltip from '@/components/shared/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import GlassPanel from '@/components/shared/GlassPanel';
import SectionHeader from '@/components/shared/SectionHeader';
import {
  GlassTextField,
  GlassSelect,
} from '@/components/shared/GlassInput';
import {
  InnerColumn,
  PageContent,
  PageSection,
} from '@/components/shared/PageComponents';
import Loading from '@/components/shared/Loading';
import DatePicker from '@/components/shared/DatePicker';
import TimePicker from '@/components/shared/TimePicker';

// utils
import devLog from '@/utils/devLog';
import withAdminRoute from '@/features/admin/utils/withAdminRoute';

function ScrimCreate() {
  const history = useHistory();
  const { createScrim } = useScrimStore();
  const { currentUser } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const [scrimData, setScrimData] = useState({
    gameStartTime: moment().add(30, 'minutes'), // Default to 30 minutes from now
    lobbyHost: 'random',
    region: currentUser?.region,
    createdBy: currentUser,
    title: '',
    isPrivate: false,
    isWithCasters: false,
    maxCastersAllowedCount: 2,
    lobbyName: '',
    useTournamentCode: true, // Default to using tournament code
  });

  const [createdScrim, setCreatedScrim] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataSending = {
        ...scrimData,
        gameStartTime: moment(scrimData.gameStartTime).toISOString(),
        createdBy: currentUser?._id || currentUser, // Ensure we send the user or user ID
        adminKey: currentUser?.adminKey ?? '', // to verify if is admin (authorize creation).
        lobbyHost: scrimData.lobbyHost === 'random' ? null : currentUser._id,
        lobbyName: scrimData.lobbyName || scrimData.title, // Default to title if lobby name not provided
        maxCastersAllowedCount: scrimData.isWithCasters
          ? scrimData.maxCastersAllowedCount
          : 0,
      };

      const newlyCreatedScrim = await createScrim(dataSending, setCurrentAlert);

      if (newlyCreatedScrim) {
        devLog('created new scrim!', newlyCreatedScrim);
        setCreatedScrim(newlyCreatedScrim);

        if (newlyCreatedScrim.isPrivate) {
          setCurrentAlert({
            type: 'Success',
            message:
              'Private scrim created, only users with the share link can access it',
          });
        } else {
          setCurrentAlert({
            type: 'Success',
            message: 'scrim created successfully!',
          });
        }
      }

      setIsSubmitting(false);
    } catch (error) {
      const errorMsg = error?.response?.data?.error ?? 'error creating scrim';
      setCurrentAlert({ type: 'Error', message: errorMsg });
      console.error(error);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (createdScrim) {
      history.push(`/scrims/${createdScrim._id}`);
    }

    return () => {
      setCreatedScrim(null);
    };
  }, [createdScrim, history]);

  if (isSubmitting) {
    return <Loading text="Creating new scrim" />;
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
              sx={{ mb: 4, color: '#fff', fontWeight: 'bold' }}>
              🚀 Create New Scrim
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: '100%', maxWidth: 1200 }}>
              <Grid container spacing={3}>
                {/* Basic Information Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="elevated">
                    <SectionHeader icon="📝">Basic Information</SectionHeader>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <GlassTextField
                          onChange={handleChange}
                          required
                          name="title"
                          label="Scrim Title"
                          placeholder={`${currentUser?.name}'s Scrim`}
                          value={scrimData.title}
                          helperText="📢 Everyone can see this title"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
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
                                  onChange={() => {
                                    setScrimData((prevState) => ({
                                      ...prevState,
                                      isWithCasters: !prevState.isWithCasters,
                                    }));
                                  }}
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

                {/* Date & Time Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="blue">
                    <SectionHeader icon="⏰">Schedule</SectionHeader>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          fullWidth
                          label={
                            <span style={{ color: '#fff' }}>
                              Game Start Date
                            </span>
                          }
                          variant="outlined"
                          name="gameStartDate"
                          value={scrimData.gameStartTime}
                          onChange={handleChangeDate}
                          required
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
                    </Grid>
                  </GlassPanel>
                </Grid>

                {/* Game Configuration Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="default">
                    <SectionHeader icon="⚙️">Game Configuration</SectionHeader>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <GlassSelect
                          name="region"
                          value={scrimData.region}
                          onChange={handleChange}
                          displayEmpty
                          helperText="🌍 Scrim Region"
                          icon="🌍">
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
                          name="lobbyHost"
                          onChange={(e) =>
                            setScrimData((prevState) => ({
                              ...prevState,
                              lobbyHost: e.target.value,
                            }))
                          }
                          value={scrimData.lobbyHost}
                          helperText="👤 Lobby Captain"
                          icon="👤">
                          {['random', currentUser?._id].map((value, key) => (
                            <MenuItem value={value} key={key}>
                              {value === currentUser._id
                                ? '🎮 I will host the lobby'
                                : '🎲 Random host!'}
                            </MenuItem>
                          ))}
                        </GlassSelect>
                      </Grid>

                      {scrimData.isWithCasters && (
                        <Grid item xs={12} sm={4}>
                          <GlassSelect
                            name="maxCastersAllowedCount"
                            value={scrimData.maxCastersAllowedCount}
                            onChange={handleChange}
                            helperText="🎤 Max Casters"
                            icon="🎤">
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

                {/* Tournament Settings Section */}
                <Grid item xs={12}>
                  <GlassPanel variant="elevated">
                    <SectionHeader icon="🏆">Tournament Settings</SectionHeader>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={scrimData.useTournamentCode}
                          onChange={(e) => {
                            setScrimData((prev) => ({
                              ...prev,
                              useTournamentCode: e.target.checked,
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
                      {scrimData.useTournamentCode
                        ? '✅ Tournament code will be auto-generated when the game starts with full teams'
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
                              <Tooltip title="This lobby name is used for manual custom lobby creation. If left empty, it will default to the scrim title">
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
                  </GlassPanel>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <GlassPanel variant="blue" sx={{ textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      size="large"
                      sx={{
                        py: 1.5,
                        px: 4,
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
                      🚀 Create Scrim
                    </Button>
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

export default withAdminRoute(ScrimCreate);
