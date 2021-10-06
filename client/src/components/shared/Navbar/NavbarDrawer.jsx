// hooks
import { useMemo } from 'react';
import useOnKeyDown from './../../../hooks/useOnKeyDown';
import { useHistory } from 'react-router-dom';
import useScrims from '../../../hooks/useScrims';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useAuth from './../../../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';

// components
import { InnerColumn } from '../PageComponents';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Hidden from '@mui/material/Hidden';
import AdminArea from '../AdminArea';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import ExitIcon from '@mui/icons-material/ExitToApp';
import CreateIcon from '@mui/icons-material/BorderColor';

// utils
import moment from 'moment';
import clsx from 'clsx';
import { KEYCODES } from '../../../utils/keycodes';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  drawerRoot: {
    background: 'rgba(18,25,35) !important',
  },

  drawerList: {
    width: 250,
  },
  drawerFullList: {
    width: 'auto',
  },
});

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function NavbarDrawer({
  isDrawerOpen,
  setIsDrawerOpen,
  showCheckboxes,
  showDropdowns,
  showLess,
}) {
  const {
    scrimsRegion,
    scrimsDate,
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
  } = useSelector(({ scrims }) => scrims);
  const dispatch = useDispatch();

  const { currentUser, handleLogout } = useAuth();
  const { fetchScrims } = useScrims();

  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesLg = useMediaQuery(theme.breakpoints.down('lg'));

  const drawerAnchor = useMemo(
    () => (matchesLg ? 'top' : 'right'),
    [matchesLg]
  );

  const drawerNavPush = async (path) => {
    setIsDrawerOpen(false);

    // using sleep so the user sees the drawer close before the path gets redirected.
    await sleep(80);
    history.push(path);
  };

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const onSelectRegion = (e) => {
    const region = e.target.value;
    fetchScrims(); // not necessary, trying to ping the server.
    // setScrimsRegion(region); // set the navbar select value to selected region
    dispatch({ type: 'scrims/setScrimsRegion', payload: region });
  };

  const onSelectDate = (e) => {
    const newDateValue = moment(e.target.value);
    dispatch({ type: 'scrims/setScrimsDate', payload: newDateValue });
  };

  const toggleShowScrims = (e) => {
    dispatch({ type: 'scrims/toggleHideScrims', payload: e.target.name });
  };

  useOnKeyDown(
    KEYCODES.ESCAPE,
    () => {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }
    },
    [isDrawerOpen]
  );

  return (
    <Drawer
      anchor={drawerAnchor}
      open={isDrawerOpen}
      classes={{ paper: classes.drawerRoot }}
      onClose={() => setIsDrawerOpen(false)}>
      <InnerColumn>
        <div
          className={clsx(classes.drawerList, {
            [classes.drawerFullList]:
              drawerAnchor === 'top' || drawerAnchor === 'bottom',
          })}>
          <List>
            {/* Settings button */}
            <ListItem button onClick={() => drawerNavPush('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <Divider />

            {/* Create scrim button (admins only) */}
            <AdminArea>
              <ListItem button onClick={() => drawerNavPush('/scrims/new')}>
                <ListItemIcon>
                  <CreateIcon />
                </ListItemIcon>
                <ListItemText primary="Create Scrim" />
              </ListItem>
              <Divider />
            </AdminArea>

            {/* Log out button */}
            {currentUser?.uid && (
              <>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitIcon />
                  </ListItemIcon>
                  <ListItemText primary="Log Out" />
                </ListItem>
              </>
            )}
            {/* don't show divider if there isn't anything else to show below... */}
            {showCheckboxes && <Divider />}
          </List>
        </div>

        {!showLess && (
          // don't show checkboxes and filters at lg screens because they already are on navbar
          <Hidden lgUp>
            <Grid
              container
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              style={{ padding: '15px 10px 10px 10px' }}>
              {showDropdowns && (
                <Grid
                  item
                  container
                  xs={6}
                  md={4}
                  alignItems={matchesSm ? 'flex-start' : 'center'}
                  justifyContent="flex-start"
                  direction={matchesSm ? 'column' : 'row'}
                  id="nav__selects--container">
                  {/* date and regions filters */}
                  <Grid item>
                    <TextField
                      variant="standard"
                      id="date"
                      required
                      label="Scrims Date"
                      type="date"
                      name="scrimsDate"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={
                        moment(new Date(scrimsDate)).format('yyyy-MM-DD') ||
                        moment().format('yyyy-MM-DD')
                      }
                      onChange={onSelectDate}
                    />

                    <FormHelperText className="text-white">
                      Filter scrims by date
                    </FormHelperText>
                  </Grid>

                  <Hidden xsDown>
                    <Box marginRight={4} />
                  </Hidden>

                  <Grid item id="nav__region-filter--container">
                    <InputLabel className="text-white">Region</InputLabel>

                    <Select
                      variant="standard"
                      value={scrimsRegion}
                      className="text-white"
                      onChange={onSelectRegion}>
                      {selectRegions.map((region, key) => (
                        <MenuItem value={region} key={key}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText className="text-white">
                      Filter scrims by region
                    </FormHelperText>
                  </Grid>
                </Grid>
              )}

              {/* Show scrims (current, previous, upcoming) buttons */}
              {showCheckboxes && (
                <Grid
                  item
                  alignItems="center"
                  container
                  justifyContent="flex-end"
                  direction={matchesXs ? 'column' : 'row'}
                  spacing={2}
                  xs={6}
                  md={8}>
                  <FormGroup
                    row
                    className="text-white"
                    style={{
                      justifyContent: 'flex-end',
                    }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showCurrentScrims}
                          color="primary"
                          onChange={toggleShowScrims}
                          name="showCurrentScrims"
                        />
                      }
                      label="Show current scrims"
                      labelPlacement="bottom"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={showPreviousScrims}
                          onChange={toggleShowScrims}
                          name="showPreviousScrims"
                        />
                      }
                      label="Show previous scrims"
                      labelPlacement="bottom"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showUpcomingScrims}
                          color="primary"
                          onChange={toggleShowScrims}
                          name="showUpcomingScrims"
                        />
                      }
                      label="Show upcoming scrims"
                      labelPlacement="bottom"
                    />
                  </FormGroup>
                </Grid>
              )}
            </Grid>
          </Hidden>
        )}
      </InnerColumn>
    </Drawer>
  );
}
