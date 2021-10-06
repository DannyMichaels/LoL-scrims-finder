import { combineReducers } from 'redux';

import currentUser from './currentUser.reducer';
// import scrimsReducer from './scrims.reducer';
// import alertsReducer from './alerts.reducer';

// this reducer combines all other specific reducers.
export default combineReducers({
  currentUser,
  // alertsReducer,
  // scrimsReducer,
});
