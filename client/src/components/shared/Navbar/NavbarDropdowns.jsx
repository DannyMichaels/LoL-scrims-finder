import React from 'react';
import { useSelector } from 'react-redux';
import useScrimStore from '@/features/scrims/stores/scrimStore';
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
import { getRegionConfig } from '@/constants/scrimIcons';

// the region and date filters
export default function NavbarDropdowns({ compact = false }) {
  const { currentUser } = useSelector(({ auth }) => auth);
  const { scrimsDate, scrimsRegion, setScrimsDate, setScrimsRegion } =
    useScrimStore();

  const theme = useTheme();

  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));

  const selectRegions = getRegionConfig(currentUser?.region);

  const onSelectRegion = (e) => {
    const region = e.target.value;
    setScrimsRegion(region);
  };

  const onSelectDate = (newDateValue) => {
    // Only update if the date is valid and complete (MM/DD/YYYY format)
    if (newDateValue && newDateValue.isValid && newDateValue.isValid()) {
      setScrimsDate(newDateValue);
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DatePicker
          label="Date"
          name="scrimsDate"
          size="small"
          variant="outlined"
          value={moment(scrimsDate)}
          onChange={onSelectDate}
          slotProps={{
            textField: {
              size: 'small',
              InputLabelProps: {
                shrink: true,
                style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem' },
              },
              sx: {
                '& .MuiOutlinedInput-root': {
                  height: '36px',
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(33, 150, 243, 0.5)',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#fff',
                  padding: '8px 12px',
                },
              },
            },
          }}
        />

        <Select
          variant="outlined"
          value={scrimsRegion}
          size="small"
          onChange={onSelectRegion}
          sx={{
            minWidth: '70px',
            height: '36px',
            fontSize: '0.8rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(33, 150, 243, 0.5)',
            },
            '& .MuiSelect-select': {
              color: '#fff',
              padding: '8px 12px',
            },
            '& .MuiSelect-icon': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          {selectRegions.map((region, key) => (
            <MenuItem value={region} key={key}>
              {region}
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }

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
