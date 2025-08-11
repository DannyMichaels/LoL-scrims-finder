import { useState, useEffect, useMemo } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import useScrimStore from '../../stores/scrimStore';
import useAlerts from '../../hooks/useAlerts';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';

// components
import Navbar from '../../components/shared/Navbar/Navbar';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import {
  PageContent,
  PageSection,
  InnerColumn,
} from '../../components/shared/PageComponents';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '../../components/shared/Tooltip';
import Loading from '../../components/shared/Loading';
import DatePicker from '../../components/shared/DatePicker';
import TimePicker from '../../components/shared/TimePicker';

// icons
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
// Removed LobbyNameFieldOld - using simple TextField instead

// utils
import devLog from '../../utils/devLog';
import {
  getScrimById,
  deleteScrim,
  regenerateTournamentCode,
} from '../../services/scrims.services';
import { sample } from '../../utils/sample';
import withAdminRoute from './../../utils/withAdminRoute';

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
        setCurrentAlert({
          type: 'Success',
          message: 'Scrim updated successfully!',
        });
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
            <form
              onSubmit={handleSubmit}
              style={{
                width: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
              <Grid
                mt={2}
                container
                direction="column"
                alignItems="center"
                spacing={4}
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  width: '100%',
                }}>
                <Grid
                  container
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}>
                  <Grid item xs={8} sm={3} md={2}>
                    <DatePicker
                      fullWidth
                      label={
                        <span className="text-white">Game Start Date</span>
                      }
                      variant="standard"
                      onChange={handleChangeDate}
                      required
                      name="gameStartDate"
                      value={scrimData.gameStartTime}
                    />
                  </Grid>
                  <Grid item xs={8} sm={3} md={2}>
                    <TimePicker
                      fullWidth
                      label={
                        <span className="text-white">Game Start Time</span>
                      }
                      onChange={handleChangeTime}
                      required
                      name="gameStartTime"
                      variant="standard"
                      value={scrimData?.gameStartTime}
                    />
                  </Grid>
                </Grid>

                <Grid
                  mt={2}
                  container
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}>
                  <Grid item>
                    <FormHelperText className="text-white">
                      Scrim Title
                    </FormHelperText>
                    <TextField
                      onChange={handleChange}
                      required
                      type="text"
                      name="title"
                      variant="standard"
                      value={scrimData.title}
                      helperText={`Example: ${scrimData?.createdBy?.name}'s Scrim`}
                    />
                  </Grid>

                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <FormHelperText className="text-white">
                          Lobby Password
                        </FormHelperText>
                      </Grid>
                      <Grid item>
                        <Tooltip title="This password is used for manual lobby creation if tournament code generation fails">
                          <InfoIcon style={{ fontSize: 16, color: '#999', cursor: 'help' }} />
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <TextField
                      onChange={handleChange}
                      required
                      type="text"
                      name="lobbyPassword"
                      variant="standard"
                      value={scrimData.lobbyPassword}
                    />
                  </Grid>
                </Grid>

                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={scrimData.useTournamentCode !== false}
                        onChange={(e) => {
                          const useTournament = e.target.checked;
                          setScrimData((prev) => ({
                            ...prev,
                            useTournamentCode: useTournament,
                            // When switching to manual, clear tournament data
                            // When switching back to tournament, keep existing tournament data if any
                            riotTournament: useTournament ? prev.riotTournament : null,
                            // Reset lobbyName appropriately
                            lobbyName: useTournament 
                              ? (prev.riotTournament?.tournamentCode || prev.lobbyName || prev.title)
                              : (prev.lobbyName || prev.title),
                          }));
                        }}
                        color="primary"
                      />
                    }
                    label="Use Riot Tournament Code (Auto-generated lobby)"
                    labelPlacement="end"
                  />
                </Grid>

                {/* Only show lobby name field if NOT using tournament code */}
                {!scrimData.useTournamentCode && (
                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <FormHelperText className="text-white">
                          Lobby Name
                        </FormHelperText>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Manual lobby name for custom game creation. If empty, defaults to scrim title">
                          <InfoIcon style={{ fontSize: 16, color: '#999', cursor: 'help' }} />
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      variant="standard"
                      name="lobbyName"
                      value={scrimData.lobbyName || ''}
                      onChange={handleChange}
                      placeholder={`Enter custom lobby name (defaults to "${scrimData.title || 'Scrim Title'}")`}
                    />
                  </Grid>
                )}

                {/* Show tournament code info if using tournament code and code exists */}
                {scrimData.useTournamentCode && scrimData.riotTournament?.tournamentCode && (
                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <FormHelperText className="text-white">
                          Tournament Code
                        </FormHelperText>
                      </Grid>
                    </Grid>
                    <Grid container alignItems="flex-end" spacing={1}>
                      <Grid item style={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          variant="standard"
                          value={scrimData.riotTournament.tournamentCode}
                          disabled
                          InputProps={{
                            style: { color: '#2196F3' }
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <Tooltip title="Generate a new tournament code">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={handleRegenerateTournamentCode}>
                            Regenerate
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Tooltip title="Clear current tournament code">
                          <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={() => {
                              setScrimData((prev) => ({
                                ...prev,
                                riotTournament: null,
                              }));
                            }}>
                            Clear
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <FormHelperText style={{ color: '#2196F3', fontSize: '0.7rem' }}>
                      Tournament code auto-generated
                    </FormHelperText>
                  </Grid>
                )}

                <Grid
                  item
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}>
                  <Grid item xs={12} sm={2} md={2}>
                    <Select
                      label="region"
                      name="region"
                      value={scrimData.region}
                      className="text-white"
                      onChange={handleChange}
                      fullWidth
                      variant="standard">
                      {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map(
                        (region, key) => (
                          <MenuItem value={region} key={key}>
                            {region}
                          </MenuItem>
                        )
                      )}
                    </Select>

                    <FormHelperText className="text-white">
                      Scrim region
                    </FormHelperText>
                  </Grid>

                  <Grid item>
                    <Select
                      variant="standard"
                      name="_lobbyHost"
                      onChange={handleChange}
                      value={scrimData._lobbyHost || RANDOM_HOST_CODE}>
                      {/* check that names aren't repeating */}
                      {[RANDOM_HOST_CODE, ...idsArr].map((id, key) => {
                        if (id === RANDOM_HOST_CODE)
                          return (
                            <MenuItem
                              value={RANDOM_HOST_CODE}
                              key={RANDOM_HOST_CODE}>
                              Random Host!
                            </MenuItem>
                          );

                        if (id === currentUser?._id) {
                          return (
                            <MenuItem value={id} key={key}>
                              I will host!
                            </MenuItem>
                          );
                        }

                        return (
                          <MenuItem value={id} key={key}>
                            {usersArr.find((user) => user?._id === id)?.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText className="text-white">
                      Lobby host
                    </FormHelperText>
                  </Grid>

                  {scrimData.isWithCasters && (
                    <Grid item xs={12} sm={2} md={2}>
                      <Select
                        variant="standard"
                        label="Max casters allowed"
                        name="maxCastersAllowedCount"
                        value={scrimData.maxCastersAllowedCount}
                        className="text-white"
                        onChange={handleChange}
                        fullWidth>
                        {[1, 2].map((value, key) => (
                          <MenuItem value={value} key={key}>
                            {value}
                          </MenuItem>
                        ))}
                      </Select>

                      <FormHelperText className="text-white">
                        Max casters count
                      </FormHelperText>
                    </Grid>
                  )}
                </Grid>

                <Grid
                  item
                  container
                  alignItems="center"
                  justifyContent="center"
                  spacing={2}
                  direction="row">
                  <Grid item>
                    <FormHelperText className="text-white">
                      Who Won?
                    </FormHelperText>
                    <Select
                      variant="standard"
                      name="teamWon"
                      value={scrimData.teamWon || 'N/A'}
                      onChange={handleChange}>
                      {['teamOne', 'teamTwo', 'N/A'].map((team, key) => {
                        const teamAliases = {
                          teamOne: 'Team 1 (Blue Side)',
                          teamTwo: 'Team 2 (Red Side)',
                          'N/A': 'N/A',
                        };

                        return (
                          <MenuItem value={team} key={key}>
                            {teamAliases[team]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Tooltip title="Is the scrim private?" placement="top">
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
                          />
                        </Tooltip>
                      }
                      label={
                        <p
                          style={{
                            fontSize: '0.75rem',
                            marginBottom: 0,
                            marginTop: '19px',
                          }}>
                          Private
                        </p>
                      }
                      labelPlacement="top"
                    />
                  </Grid>

                  <Grid item>
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
                          />
                        </Tooltip>
                      }
                      label={
                        <p
                          style={{
                            fontSize: '0.75rem',
                            marginBottom: 0,
                            marginTop: '19px',
                          }}>
                          With casters
                        </p>
                      }
                      labelPlacement="top"
                    />
                  </Grid>
                </Grid>

                <Grid item>
                  <div className="page-break" />
                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit"
                        startIcon={<SaveIcon />}
                        fullWidth
                        size="large">
                        Save Changes
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        fullWidth
                        size="large"
                        onClick={handleDeleteScrim}>
                        Delete Scrim
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}

export default withAdminRoute(ScrimEdit);
