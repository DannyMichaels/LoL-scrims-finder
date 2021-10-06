const initialState = {
  scrims: [],
  scrimsLoaded: false,
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

    default:
      return state;
  }
}
