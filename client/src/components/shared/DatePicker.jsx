import { memo } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';

// utils
import { isMobile } from './../../utils/navigator';

function DatePicker({ value, onChange, variant, fullWidth, ...rest }) {
  const isMobileDevice = isMobile();

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {!isMobileDevice ? (
        <DesktopDatePicker
          inputFormat="MM/DD/yyyy"
          value={value}
          {...rest}
          onChange={onChange}
          renderInput={(params) => (
            <TextField fullWidth={fullWidth} variant={variant} {...params} />
          )}
        />
      ) : (
        <MobileDatePicker
          inputFormat="MM/DD/yyyy"
          value={value}
          onChange={onChange}
          {...rest}
          renderInput={(params) => (
            <TextField fullWidth={fullWidth} variant={variant} {...params} />
          )}
        />
      )}
    </LocalizationProvider>
  );
}

export default memo(DatePicker);
