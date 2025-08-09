import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useScrimStore from '../../stores/scrimStore';
import useAlerts from '../../hooks/useAlerts';
import useAuth from '../../hooks/useAuth';
import moment from 'moment';

// components
import Navbar from '../../components/shared/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Hidden from '@mui/material/Hidden';
import Tooltip from '../../components/shared/Tooltip';
import {
  InnerColumn,
  PageContent,
  PageSection,
} from '../../components/shared/PageComponents';
import Loading from '../../components/shared/Loading';
import DatePicker from '../../components/shared/DatePicker';
import TimePicker from '../../components/shared/TimePicker';

// utils
import devLog from '../../utils/devLog';
import withAdminRoute from '../../utils/withAdminRoute';

function ScrimCreate() {
  const history = useHistory();
  const { createScrim } = useScrimStore();
  const { currentUser } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const [scrimData, setScrimData] = useState({
    gameStartTime: moment(),
    lobbyHost: 'random',
    region: currentUser?.region,
    createdBy: currentUser,
    title: '',
    isPrivate: false,
    isWithCasters: false,
    maxCastersAllowedCount: 2,
    lobbyName: '',
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
            <Grid
              onSubmit={handleSubmit}
              style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto' }}
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              component="form"
              spacing={4}>
              <Grid
                item
                container
                sm={12}
                justifyContent="center"
                alignItems="center"
                direction="row"
                spacing={2}>
                <Grid item>
                  <Tooltip title="The title for the scrim (everyone can see this)">
                    <FormHelperText className="text-white">
                      Scrim Title {`(example: ${currentUser?.name}'s Scrim)`}
                    </FormHelperText>
                  </Tooltip>
                  <TextField
                    variant="standard"
                    onChange={handleChange}
                    required
                    name="title"
                    placeholder="Scrim title"
                    value={scrimData.title}
                  />
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
                          onChange={() => {
                            setScrimData((prevState) => ({
                              ...prevState,
                              isWithCasters: !prevState.isWithCasters,
                            }));
                          }}
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

              <Grid
                item
                container
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={2}>
                <Grid item xs={12} sm={3}>
                  <DatePicker
                    fullWidth
                    label={<span className="text-white">Game Start Date</span>}
                    variant="standard"
                    name="gameStartDate"
                    value={scrimData.gameStartTime}
                    onChange={handleChangeDate}
                    required
                  />
                </Grid>

                <Hidden xsDown>
                  <Box marginRight={3} />
                </Hidden>

                <Grid item xs={12} sm={3}>
                  <TimePicker
                    fullWidth
                    label={<span className="text-white">Game Start Time</span>}
                    variant="standard"
                    onChange={handleChangeTime}
                    required
                    name="gameStartTime"
                    value={scrimData.gameStartTime}
                  />
                </Grid>
              </Grid>

              <Grid
                item
                container
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={2}>
                <Grid item sx={{ marginRight: 4 }} xs={12} sm={3}>
                  <Select
                    variant="standard"
                    label="region"
                    name="region"
                    value={scrimData.region}
                    className="text-white"
                    onChange={handleChange}
                    fullWidth>
                    {['NA', 'EUW', 'EUNE', 'LAN', 'OCE'].map((region, key) => (
                      <MenuItem value={region} key={key}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText className="text-white">
                    Scrim region
                  </FormHelperText>
                </Grid>

                <Grid item md={3}>
                  <Select
                    fullWidth
                    variant="standard"
                    name="lobbyHost"
                    onChange={(e) =>
                      setScrimData((prevState) => ({
                        ...prevState,
                        lobbyHost: e.target.value,
                      }))
                    }
                    value={scrimData.lobbyHost}>
                    {['random', currentUser?._id].map((value, key) => (
                      <MenuItem value={value} key={key}>
                        {value === currentUser._id
                          ? 'I will host the lobby'
                          : 'Random host!'}
                      </MenuItem>
                    ))}
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
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ marginLeft: 'auto', marginRight: 'auto', marginTop: 2 }}
                xs={12}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    variant="standard"
                    name="lobbyName"
                    label="Lobby Name"
                    value={scrimData.lobbyName || ''}
                    onChange={handleChange}
                    placeholder="Enter custom lobby name"
                    required
                  />
                </Grid>
              </Grid>

              <Grid item>
                <div className="page-break" />
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </InnerColumn>
        </PageSection>
      </PageContent>
    </>
  );
}

export default withAdminRoute(ScrimCreate);
