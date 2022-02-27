import api from './apiConfig';
import devLog from '../utils/devLog';
import jwt_decode from 'jwt-decode';
import Cookies from 'universal-cookie';

export const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    api.defaults.headers.common['Authorization'] = token;
  } else {
    // Delete auth header
    delete api.defaults.headers.common['Authorization'];
  }
};

export const loginUser = async (googleParams) => {
  try {
    // const cookie = String(await Cookies.get('csrf-token'));

    // console.log('cookie', cookie);
    const response = await api.post(
      '/auth/login',
      {
        email: googleParams.email,
        uid: googleParams.uid,
      },
      {
        headers: {
          'csrf-token': Cookies.get('csrf-token'),
        },
      }
    );

    if (response.data?.token) {
      const { token } = response.data;
      localStorage.setItem('jwtToken', token); // add token to back-end
      setAuthToken(token); // add authorization in the request to be bearer token.
      const decodedUser = jwt_decode(token); // decode user by hashed uid that was hashed in back-end
      if (!decodedUser) console.error('unable to decode user');
      return decodedUser;
    } else {
      console.error(
        'error, no token provided by response, invalid token provided?'
      );
    }
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData, setAlert) => {
  try {
    const response = await api.post('/auth/register', userData);

    if (response?.data?.token) {
      const { token } = response.data;
      // token = `Bearer ${bcryptHash}`
      localStorage.setItem('jwtToken', token); // add token to back-end
      setAuthToken(token); // add authorization in the request to be bearer token.
      const decodedUser = jwt_decode(token); // decode user by hashed uid that was hashed in back-end

      return decodedUser;
    }
  } catch (error) {
    const errorMsg = error?.response?.data?.error;

    if (errorMsg) {
      setAlert({ type: 'Error', message: errorMsg });
      return;
    }
    throw error;
  }
};

export const verifyUser = async () => {
  try {
    const resp = await api.post('/auth/verify'); // we get the authToken with setAuthToken in handleVerify in useAuth (useAuthActions)
    return resp.data;
  } catch (error) {
    // these lines are to handle the case when heroku is hibernating and the home page is loading because the content hasn't loaded but we don't have a user to associate it with.
    // if the user isn't verified and heroku is hibernating.
    devLog('heroku is hibernating, cannot verify user, pushing to /signup');

    localStorage.removeItem('jwtToken'); // remove token because we have an error verifying the user.

    let path = window.location.origin + '/signup';
    // and the path isn't signup
    if (window.location.origin + '/signup' !== path) {
      // send the user to signup.
      window.location.href = window.location.origin + '/signup';
    }
  }

  return null;
};

export const updateUser = async (userData) => {
  try {
    const response = await api.put(`/auth/update-user`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeToken = () => {
  devLog('removing token...');
  api.defaults.headers.common['Authorization'] = null;
};

export const getCSRFToken = async () => {
  const response = await api.get('/getCSRFToken');
  api.defaults.headers.post['xsrf-token'] = response.data.csrfToken;
  api.defaults.headers.put['xsrf-token'] = response.data.csrfToken;
  api.defaults.headers.patch['xsrf-token'] = response.data.csrfToken;
  return response.data.csrfToken;
};

export const setCSRFToken = (csrfToken) => {
  api.defaults.headers.common['xsrf-token'] = csrfToken;
};
