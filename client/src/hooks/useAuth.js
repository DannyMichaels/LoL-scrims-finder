import devLog from '../utils/devLog';
import { auth, provider } from '../firebase';
import { loginUser, verifyUser } from '../services/auth';
import jwt_decode from 'jwt-decode';
import { setAuthToken, removeToken } from '../services/auth';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

export default function useAuth() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { currentUser, isVerifyingUser } = useSelector((state) => state.auth);

  const setCurrentUser = (currentUserValue) => {
    dispatch({
      type: 'auth/setCurrentUser',
      payload: currentUserValue,
    });
  };

  const handleLogout = async () => {
    devLog('logging out...');
    auth.signOut();
    localStorage.removeItem('jwtToken'); // remove token from localStorage
    removeToken();
    dispatch({ type: 'auth/logout' });
    history.push('/signup'); // push back to signup
  };

  const handleLogin = async () => {
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

  const handleVerify = async () => {
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

  const isCurrentUserAdmin =
    currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY;

  return {
    isCurrentUserAdmin,
    isVerifyingUser,
    currentUser,
    handleLogin,
    handleLogout,
    handleVerify,
    setCurrentUser,
  };
}
