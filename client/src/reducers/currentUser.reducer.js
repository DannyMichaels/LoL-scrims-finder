const initialState = {
  currentUser: null,
  isVerifyingUser: true,
};

export default function currentUserReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'currentUser/setCurrentUser': {
      return {
        ...state,
        currentUser: payload,
      };
    }

    case 'currentUser/logout': {
      return { ...state, currentUser: null };
    }

    case 'currentUser/setIsVerifyingUser': {
      return {
        ...state,
        isVerifyingUser: payload,
      };
    }

    default:
      return state;
  }
}

// export const handleLogin = async (dispatch, history) => {
//   devLog('logging in...');

//   // verifying user with google, then getting rest of data.
//   const result = await auth.signInWithPopup(provider);

//   if (result.user) {
//     let googleParams = {
//       uid: result.user.uid, // google id
//       email: result.user.email,
//     };

//     // token = `Bearer ${bcryptHash}`
//     const decodedUser = await loginUser(googleParams); // get the jwt token from backend with params
//     if (decodedUser) {
//       dispatch({ type: 'currentUser/setCurrentUser', payload: decodedUser });
//       history.push('/');
//     }
//   }
// };

// export const handleLogout = async (dispatch, history) => {
//   devLog('logging out...');
//   auth.signOut();
//   localStorage.removeItem('jwtToken'); // remove token from localStorage
//   removeToken();
//   dispatch({ type: 'currentUser/logout' });
//   history.push('/signup'); // push back to signup
// };

// export const handleVerify = async (dispatch, history) => {
//   devLog('verifying user');
//   if (localStorage.jwtToken) {
//     // Set auth token header auth
//     const token = localStorage.jwtToken;
//     setAuthToken(token);

//     const decodedUser = jwt_decode(token);

//     const data = await verifyUser({
//       uid: decodedUser?.uid,
//       email: decodedUser?.email,
//     });

//     // if there is no token PrivateRoute.jsx should send us to /sign-up automatically.
//     if (data?.token) {
//       localStorage.setItem('jwtToken', data?.token);

//       // Set user
//       dispatch({ type: 'currentUser/setCurrentUser', payload: data?.user });
//       // Check for expired token
//       const currentTime = Date.now() / 1000; // to get in milliseconds
//       if (decodedUser.exp < currentTime) {
//         // if time passed expiration
//         // Logout user
//         dispatch({ type: 'currentUser/logout' });
//         // Redirect to login
//         history.push('/signup');
//       }
//     }
//   }
//   // setVerifyingUser(false);
//   dispatch({ type: 'currentUser/setVerifyingUser', payload: false });
// };
