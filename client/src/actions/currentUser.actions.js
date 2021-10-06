import devLog from '../utils/devLog';
import { auth, provider } from '../firebase';
import { loginUser, verifyUser } from '../services/auth';
import jwt_decode from 'jwt-decode';
import { setAuthToken, removeToken } from '../services/auth';

export const handleLogin = async (history, dispatch) => {
  devLog('logging in...');

  // verifying user with google, then getting rest of data.
  const result = await auth.signInWithPopup(provider);

  if (result.user) {
    let googleParams = {
      uid: result.user.uid, // google id
      email: result.user.email,
    };

    // token = `Bearer ${bcryptHash}`
    const decodedUser = await loginUser(googleParams); // get the jwt token from backend with params

    if (decodedUser) {
      dispatch({ type: 'auth/setCurrentUser', payload: decodedUser });
      history.push('/');
    }
  }
};

export const handleLogout = (history) => (dispatch) => {
  devLog('logging out...');
  auth.signOut();
  localStorage.removeItem('jwtToken'); // remove token from localStorage
  removeToken();
  history.push('/signup'); // push back to signup
  dispatch({ type: 'auth/logout' });
};

export const handleVerify = async (history, dispatch) => {
  devLog('verifying user');
  if (localStorage.jwtToken) {
    // Set auth token header auth
    const token = localStorage.jwtToken;
    setAuthToken(token);

    const decodedUser = jwt_decode(token);

    const data = await verifyUser({
      uid: decodedUser?.uid,
      email: decodedUser?.email,
    });

    // if there is no token PrivateRoute.jsx should send us to /sign-up automatically.
    if (data?.token) {
      localStorage.setItem('jwtToken', data?.token);
      // Set user
      dispatch({ type: 'auth/setCurrentUser', payload: data?.user });

      // Check for expired token
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decodedUser.exp < currentTime) {
        // if time passed expiration
        // Logout user
        handleLogout(history, dispatch);
        // Redirect to login
        history.push('/signup');
      }
    }
  }
  dispatch({ type: 'auth/setIsVerifyingUser', payload: false });
};
