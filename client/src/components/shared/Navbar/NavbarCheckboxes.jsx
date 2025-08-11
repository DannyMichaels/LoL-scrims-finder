import { useEffect, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/styles/useTheme';
import useScrimStore from '@/features/scrims/stores/scrimStore';
import { isPastDate as isDateInPast } from '@/utils/timezone';

// components
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@/components/shared/Tooltip';
import RefreshScrimsButton from '@/features/scrims/components/RefreshScrimsButton';
import { getScrimIconByFilter } from '@/constants/scrimIcons';

/* Show scrims (current, previous, upcoming) buttons */

export default function NavbarCheckboxes({ compact = false }) {
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'));

  const {
    showPreviousScrims,
    showCurrentScrims,
    showUpcomingScrims,
    setShowPreviousScrims,
    setShowCurrentScrims,
    setShowUpcomingScrims,
    scrimsDate,
  } = useScrimStore();

  // Check if the selected date is in the past (using timezone-aware logic)
  const isPastDate = useMemo(() => {
    return isDateInPast(scrimsDate);
  }, [scrimsDate]);

  // Auto-toggle upcoming scrims based on date
  useEffect(() => {
    if (isPastDate && showUpcomingScrims) {
      // Turn off upcoming scrims for past dates
      setShowUpcomingScrims(false);
    } else if (!isPastDate && !showUpcomingScrims) {
      // Turn on upcoming scrims when returning to current/future dates
      setShowUpcomingScrims(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPastDate, scrimsDate]); // Removed showUpcomingScrims from deps to prevent infinite loop

  const toggleShowScrims = (e) => {
    const { name, checked } = e.target;
    if (name === 'showPreviousScrims') {
      setShowPreviousScrims(checked);
    } else if (name === 'showCurrentScrims') {
      setShowCurrentScrims(checked);
    } else if (name === 'showUpcomingScrims') {
      setShowUpcomingScrims(checked);
    }
  };

  if (compact) {
    const checkboxConfigs = [
      {
        filterName: 'showPreviousScrims',
        checked: showPreviousScrims,
        disabled: false,
        tooltipActive: 'Hide previous scrims',
        tooltipInactive: 'Show previous scrims',
      },
      {
        filterName: 'showUpcomingScrims', 
        checked: showUpcomingScrims,
        disabled: isPastDate,
        tooltipActive: 'Hide upcoming scrims',
        tooltipInactive: 'Show upcoming scrims',
        tooltipDisabled: 'No upcoming scrims for past dates',
      },
      {
        filterName: 'showCurrentScrims',
        checked: showCurrentScrims,
        disabled: false, 
        tooltipActive: 'Hide current scrims',
        tooltipInactive: 'Show current scrims',
      },
    ];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <RefreshScrimsButton compact />
        
        {checkboxConfigs.map((config) => {
          const iconConfig = getScrimIconByFilter(config.filterName);
          if (!iconConfig) return null;
          
          const IconComponent = iconConfig.icon;
          const isActive = config.checked;
          
          const tooltipTitle = config.disabled 
            ? config.tooltipDisabled
            : isActive 
              ? config.tooltipActive 
              : config.tooltipInactive;

          return (
            <Tooltip key={config.filterName} title={tooltipTitle}>
              <IconButton
                size="small"
                disabled={config.disabled}
                onClick={(e) => toggleShowScrims({
                  target: {
                    name: config.filterName, 
                    checked: !config.checked
                  }
                })}
                sx={{
                  p: 0.5,
                  color: isActive ? iconConfig.color : 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: isActive ? iconConfig.backgroundColor : 'transparent',
                  '&:hover': {
                    color: isActive ? iconConfig.colorHover : 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: isActive 
                      ? iconConfig.backgroundColorHover 
                      : 'rgba(255, 255, 255, 0.05)',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'transparent',
                  },
                  transition: 'all 0.2s ease',
                  opacity: config.disabled ? 0.3 : 1,
                }}
              >
                <IconComponent fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        })}
      </Box>
    );
  }

  return (
    <Grid
      item
      alignItems="center"
      container
      justifyContent="flex-start"
      direction={matchesXs ? 'column' : 'row'}
      xs={6}
      sm={4}
      md={8}>
      <FormGroup
        row={!matchesSm}
        className="text-white"
        style={{
          justifyContent: !matchesMd ? 'flex-start' : 'center',
          alignItems: 'flex-end',
        }}>
        <RefreshScrimsButton />

        <Tooltip
          title={
            showPreviousScrims ? 'Hide previous scrims' : 'Show previous scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={showPreviousScrims}
                onChange={toggleShowScrims}
                name="showPreviousScrims"
              />
            }
            label="Previous scrims"
            labelPlacement="bottom"
          />
        </Tooltip>

        <Tooltip
          title={
            isPastDate
              ? 'No upcoming scrims for past dates'
              : showUpcomingScrims
              ? 'Hide upcoming scrims'
              : 'Show upcoming scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                checked={showUpcomingScrims}
                color="primary"
                onChange={toggleShowScrims}
                name="showUpcomingScrims"
                disabled={isPastDate}
              />
            }
            label="Upcoming scrims"
            labelPlacement="bottom"
            sx={isPastDate ? { opacity: 0.5 } : {}}
          />
        </Tooltip>

        <Tooltip
          title={
            showCurrentScrims ? 'Hide current scrims' : 'Show current scrims'
          }>
          <FormControlLabel
            control={
              <Checkbox
                checked={showCurrentScrims}
                color="primary"
                onChange={toggleShowScrims}
                name="showCurrentScrims"
              />
            }
            label="Current scrims"
            labelPlacement="bottom"
          />
        </Tooltip>
      </FormGroup>
    </Grid>
  );
}
