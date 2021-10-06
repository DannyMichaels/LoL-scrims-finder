import moment from 'moment';

const initialState = {
  scrims: [],
  scrimsLoaded: false,
  fetch: false,
  scrimsRegion: 'NA',
  scrimsDate: moment(), // the date value to filter the scrims by

  // the hide/unhide toggle buttons on the drawer navbar.
  showPreviousScrims: true,
  showCurrentScrims: true,
  showUpcomingScrims: true,

  dateFilteredScrims: [],
  regionFilteredScrims: [],

  filteredScrims: [], //filtered scrims by date and region
};

export default function scrimsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'scrims/fetchScrims': {
      return {
        ...state,
        scrims: payload,
        scrimsLoaded: true,
      };
    }

    case 'scrims/setScrims': {
      return {
        ...state,
        scrims: payload,
      };
    }

    case 'scrims/deleteScrim': {
      return {
        ...state,
        scrims: state.scrims.filter((scrim) => scrim._id !== payload._id),
      };
    }

    case 'scrims/updateScrim': {
      return {
        ...state,
        scrims: state.scrims.map((scrim) =>
          scrim._id !== payload._id ? scrim : payload
        ),
      };
    }

    case 'scrims/toggleFetch': {
      return {
        ...state,
        fetch: !state.fetch,
      };
    }

    case 'scrims/setScrimsRegion': {
      return {
        ...state,
        scrimsRegion: payload,
      };
    }

    case 'scrims/setScrimsDate': {
      return {
        ...state,
        scrimsDate: payload,
      };
    }

    // toggle show scrims button on navbar
    case 'scrims/toggleHideScrims': {
      return {
        ...state,
        [payload]: !state[payload],
      };
    }

    case 'scrims/setHideScrims': {
      const { showPrevious, showCurrent, showUpcoming } = action;

      return {
        ...state,
        showPreviousScrims: showPrevious ?? state.showPreviousScrims,
        showCurrentScrims: showCurrent ?? state.showCurrentScrims,
        showUpcomingScrims: showUpcoming ?? state.showUpcomingScrims,
      };
    }

    default:
      return state;
  }
}
