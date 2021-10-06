import { useSelector, useDispatch } from 'react-redux';

import Grid from '@mui/material/Grid';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

/* Show scrims (current, previous, upcoming) buttons */

export default function NavbarCheckboxes({ xs }) {
  const dispatch = useDispatch();

  const { showPreviousScrims, showCurrentScrims, showUpcomingScrims } =
    useSelector(({ scrims }) => scrims);

  const toggleShowScrims = (e) => {
    dispatch({ type: 'scrims/toggleHideScrims', payload: e.target.name });
  };

  return (
    <Grid item xs={xs} alignItems="center" container>
      <FormGroup
        row
        className="text-white"
        style={{ justifyContent: 'center' }}>
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
  );
}
