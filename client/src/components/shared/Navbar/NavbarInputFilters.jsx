import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import moment from 'moment';
import 'moment-timezone';

import { useSelector, useDispatch } from 'react-redux';
import { useScrimsActions } from './../../../hooks/useScrims';

export default function NavbarInputFilters() {
  const [{ currentUser }, { scrimsDate, scrimsRegion }] = useSelector(
    ({ auth, scrims }) => [auth, scrims]
  );

  const { fetchScrims } = useScrimsActions();

  const dispatch = useDispatch();

  let allRegions = ['NA', 'EUW', 'EUNE', 'LAN'];

  let selectRegions = [
    currentUser?.region,
    ...allRegions.filter((r) => r !== currentUser?.region),
  ];

  const onSelectRegion = (e) => {
    const region = e.target.value;
    dispatch({ type: 'scrims/setScrimsRegion', payload: region });
    fetchScrims(); // not necessary, trying to ping the server.
  };

  const onSelectDate = (e) => {
    const newDateValue = moment(e.target.value);
    dispatch({ type: 'scrims/setScrimsDate', payload: newDateValue });
    fetchScrims();
  };

  return (
    <Grid
      item
      container
      md={12}
      lg={4}
      justifyContent="flex-end"
      alignItems="center"
      id="nav__selects--container">
      {/* date regions and filters */}
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

      <Box marginRight={4} />

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
  );
}
