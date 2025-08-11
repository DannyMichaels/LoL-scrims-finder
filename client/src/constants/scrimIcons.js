// icons
import HistoryIcon from '@mui/icons-material/History';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Centralized mapping of scrim types to their corresponding icons and colors
 * Use this throughout the app to maintain consistency
 */
export const SCRIM_ICONS = {
  PREVIOUS: {
    icon: HistoryIcon,
    color: '#9E9E9E',
    colorHover: '#BDBDBD',
    backgroundColor: 'rgba(158, 158, 158, 0.15)',
    backgroundColorHover: 'rgba(158, 158, 158, 0.25)',
    label: 'Previous Scrims',
    description: 'Completed or finished scrims',
  },
  UPCOMING: {
    icon: ScheduleIcon,
    color: '#2196F3',
    colorHover: '#64B5F6',
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    backgroundColorHover: 'rgba(33, 150, 243, 0.25)',
    label: 'Upcoming Scrims',
    description: 'Scheduled scrims that haven\'t started yet',
  },
  CURRENT: {
    icon: WhatshotIcon,
    color: '#ff6b35',
    colorHover: '#ff8a65',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    backgroundColorHover: 'rgba(255, 107, 53, 0.25)',
    label: 'Current Scrims',
    description: 'Active scrims currently in progress',
  },
  REFRESH: {
    icon: RefreshIcon,
    color: 'rgba(255, 255, 255, 0.7)',
    colorHover: '#2196F3',
    backgroundColor: 'transparent',
    backgroundColorHover: 'rgba(33, 150, 243, 0.1)',
    label: 'Refresh',
    description: 'Refresh scrims data',
  },
};

/**
 * Scrim type enumeration for type safety
 */
export const SCRIM_TYPES = {
  PREVIOUS: 'PREVIOUS',
  UPCOMING: 'UPCOMING', 
  CURRENT: 'CURRENT',
  REFRESH: 'REFRESH',
};

/**
 * Map scrim filter names to scrim types
 */
export const SCRIM_FILTER_MAP = {
  showPreviousScrims: SCRIM_TYPES.PREVIOUS,
  showUpcomingScrims: SCRIM_TYPES.UPCOMING,
  showCurrentScrims: SCRIM_TYPES.CURRENT,
};

/**
 * Get scrim icon configuration by type
 * @param {string} scrimType - One of SCRIM_TYPES values
 * @returns {Object} Icon configuration object
 */
export const getScrimIcon = (scrimType) => {
  return SCRIM_ICONS[scrimType] || null;
};

/**
 * Get scrim icon configuration by filter name
 * @param {string} filterName - Filter name like 'showPreviousScrims'
 * @returns {Object} Icon configuration object
 */
export const getScrimIconByFilter = (filterName) => {
  const scrimType = SCRIM_FILTER_MAP[filterName];
  return getScrimIcon(scrimType);
};

/**
 * Available regions configuration
 */
export const REGIONS = ['NA', 'EUW', 'EUNE', 'LAN', 'OCE'];

/**
 * Get regions with user's region first (if available)
 * @param {string} userRegion - User's preferred region
 * @returns {Array} Array of regions with user's region first
 */
export const getRegionConfig = (userRegion) => {
  if (!userRegion || !REGIONS.includes(userRegion)) {
    return REGIONS;
  }
  return [userRegion, ...REGIONS.filter((r) => r !== userRegion)];
};