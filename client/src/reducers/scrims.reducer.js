const initialState = {
  scrims: [],
  scrimsLoaded: false,
  fetch: false,
  scrimsRegion: 'NA',
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

    default:
      return state;
  }
}
