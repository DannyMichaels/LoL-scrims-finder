import { combineReducers } from 'redux';

import auth from './auth.reducer';
// import scrimsReducer from './scrims.reducer';
// import alertsReducer from './alerts.reducer';

// this reducer combines all other specific reducers.
export default combineReducers({
  auth,
  // alertsReducer,
  // scrimsReducer,
});
