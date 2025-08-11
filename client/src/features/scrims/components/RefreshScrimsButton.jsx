import { useState, useCallback } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@/components/shared/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import useTimeout from '@/hooks/useTimeout';
import { useFetchScrims } from '@/features/scrims/hooks/useScrimsZustand';

// this button is used in the navbar to re-fetch the scrims
export default function RefreshScrimsButton({ compact = false }) {
  const { fetchScrims } = useFetchScrims();

  const [disabled, setDisabled] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(1);
  const [disableMS, setDisableMS] = useState(3000);

  const handleRefresh = useCallback(async () => {
    setRefreshCounter((prevState) => (prevState += 1));

    // fetch all existing scrims on the back-end.
    fetchScrims();

    // if refresh counter num is even, disable the button
    if (refreshCounter % 2 === 0) {
      setDisableMS(10000);
    } else {
      setDisableMS(5000);
    }

    setDisabled(true);
  }, [refreshCounter, fetchScrims]);

  useTimeout(
    () => {
      setDisabled(false);
    },
    disabled ? disableMS : null
  );

  if (compact) {
    return (
      <Tooltip title="Refresh scrims">
        <IconButton 
          disabled={disabled} 
          onClick={handleRefresh}
          size="small"
          sx={{
            p: 0.5,
            color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              color: disabled ? 'rgba(255, 255, 255, 0.3)' : '#2196F3',
            },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Refresh scrims">
      <FormControlLabel
        control={
          <IconButton disabled={disabled} onClick={handleRefresh}>
            <RefreshIcon fontSize="large" />
          </IconButton>
        }
        label="Refresh scrims"
        labelPlacement="bottom"
      />
    </Tooltip>
  );
}
