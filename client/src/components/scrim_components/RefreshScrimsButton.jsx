import { useDispatch } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '../shared/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';

// button to re-fetch scrims that are visible in the page (see useScrims @ useScrimInterval)
export default function RefreshScrimsButton() {
  const dispatch = useDispatch();

  return (
    <Tooltip title="Refresh scrims">
      <FormControlLabel
        control={
          <IconButton onClick={() => dispatch({ type: 'scrims/toggleFetch' })}>
            <RefreshIcon fontSize="large" />
          </IconButton>
        }
        label="Refresh scrims"
        labelPlacement="bottom"
      />
    </Tooltip>
  );
}
