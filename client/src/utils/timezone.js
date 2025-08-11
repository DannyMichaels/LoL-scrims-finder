import moment from 'moment-timezone';

/**
 * Timezone utility functions for consistent date handling across the app
 */

/**
 * Get the user's timezone
 * @returns {string} User's timezone (e.g., 'America/New_York')
 */
export const getUserTimezone = () => {
  return moment.tz.guess();
};

/**
 * Get the user's timezone abbreviation (e.g., 'EST', 'PST')
 * @returns {string} Timezone abbreviation
 */
export const getUserTimezoneAbbr = () => {
  return moment.tz(getUserTimezone()).format('z');
};

/**
 * Convert a date to UTC for API calls
 * Takes user input and converts it to UTC to send to backend
 * @param {string|moment|Date} date - Date in user's timezone
 * @returns {string} ISO string in UTC
 */
export const dateToUTC = (date) => {
  return moment.tz(date, getUserTimezone()).utc().toISOString();
};

/**
 * Convert a date from UTC to user's timezone for display
 * @param {string|moment|Date} utcDate - UTC date
 * @returns {moment} Moment object in user's timezone
 */
export const dateFromUTC = (utcDate) => {
  return moment.utc(utcDate).tz(getUserTimezone());
};

/**
 * Get start and end of day in user's timezone, converted to UTC
 * This is crucial for date filtering - we want the full day in user's timezone
 * @param {string|moment|Date} date - Date to get day bounds for
 * @returns {Object} { startOfDay: string, endOfDay: string } in UTC ISO format
 */
export const getDayBoundsInUTC = (date) => {
  const userTz = getUserTimezone();
  const startOfDay = moment.tz(date, userTz).startOf('day').utc().toISOString();
  const endOfDay = moment.tz(date, userTz).endOf('day').utc().toISOString();
  
  return { startOfDay, endOfDay };
};

/**
 * Format a date for API query parameters
 * Converts user's date selection to proper UTC range for backend filtering
 * @param {string|moment|Date} date - User's selected date
 * @returns {Object} { startDate: string, endDate: string } for API params
 */
export const formatDateForAPI = (date) => {
  const { startOfDay, endOfDay } = getDayBoundsInUTC(date);
  return {
    startDate: startOfDay,
    endDate: endOfDay
  };
};

/**
 * Check if a date is today in user's timezone
 * @param {string|moment|Date} date 
 * @returns {boolean}
 */
export const isToday = (date) => {
  const userTz = getUserTimezone();
  const today = moment.tz(userTz).startOf('day');
  const checkDate = moment.tz(date, userTz).startOf('day');
  return today.isSame(checkDate);
};

/**
 * Check if a date is in the past in user's timezone
 * @param {string|moment|Date} date 
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  const userTz = getUserTimezone();
  const today = moment.tz(userTz).startOf('day');
  const checkDate = moment.tz(date, userTz).startOf('day');
  return checkDate.isBefore(today);
};

/**
 * Format a date with timezone for display
 * @param {string|moment|Date} date 
 * @param {string} format - Moment format string
 * @returns {string}
 */
export const formatDateWithTimezone = (date, format = 'MMM DD, YYYY [at] h:mm A z') => {
  return dateFromUTC(date).format(format);
};