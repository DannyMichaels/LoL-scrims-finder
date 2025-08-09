import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import useScrimStore from '../../../stores/scrimStore';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import moment from 'moment';

// components
import Grid from '@mui/material/Grid';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Hidden from '@mui/material/Hidden';

// utils
import DatePicker from './../DatePicker';

// the region and date filters
export default function NavbarDropdowns() {
  const { currentUser } = useSelector(({ auth }) => auth);
  const { scrimsDate, scrimsRegion, setScrimsDate, setScrimsRegion } = useScrimStore();

  const theme = useTheme();

  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN', 'OCE'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const onSelectRegion = (e) => {
    const region = e.target.value;
    setScrimsRegion(region);
  };

  const onSelectDate = useCallback(
    (newDateValue) => {
      setScrimsDate(newDateValue);
    },
    [] // setScrimsDate is stable from zustand
  );

  return (
    <Grid
      item
      container
      xs={6}
      sm={6}
      md={4}
      alignItems={matchesSm ? 'flex-start' : 'center'}
      justifyContent="flex-end"
      direction={matchesSm ? 'column' : 'row'}
      id="nav__selects--container">
      {/* date regions and filters */}
      <Grid item xs={6}>
        <DatePicker
          label="Scrims Date"
          name="scrimsDate"
          InputLabelProps={{
            shrink: true,
            style: { color: '#fff' },
          }}
          variant="standard"
          value={moment(scrimsDate)}
          onChange={onSelectDate}
        />
        <FormHelperText className="text-white">
          Filter&nbsp;
          <Hidden lgDown>scrims&nbsp;</Hidden>by date
        </FormHelperText>
      </Grid>

      <Box marginRight={4} />

      <Hidden mdUp>
        <Box marginTop={2} />
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
          Filter&nbsp;
          <Hidden lgDown>scrims&nbsp;</Hidden>by region
        </FormHelperText>
      </Grid>
    </Grid>
  );
}
