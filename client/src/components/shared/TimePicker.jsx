import { memo } from 'react';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';

function TimePicker({ value, onChange, variant, fullWidth, label, ...rest }) {
  // Ensure value is always a valid moment object
  const validValue = moment.isMoment(value) ? value : moment(value);

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <MuiTimePicker
        value={validValue}
        onChange={onChange}
        label={label}
        slotProps={{
          textField: {
            fullWidth: fullWidth,
            variant: variant,
          }
        }}
        {...rest}
      />
    </LocalizationProvider>
  );
}

export default memo(TimePicker);
