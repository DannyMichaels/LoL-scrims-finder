import { combineReducers } from 'redux';

import auth from '@/features/auth/stores/auth.reducer';
import alerts from './alerts.reducer';
import scrims from '@/features/scrims/stores/scrims.reducer';
import users from '@/features/users/stores/users.reducer';
import general from './general.reducer';
import messenger from '@/features/messenger/stores/messenger.reducer';
import socket from './socket.reducer';

// this reducer combines all other specific reducers.
export default combineReducers({
  auth,
  alerts,
  scrims,
  users,
  general,
  socket,
  messenger,
});
