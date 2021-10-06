const initialState = {
  currentUser: null,
  isVerifyingUser: true,
};

export default function currentUserReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'auth/setCurrentUser': {
      return {
        ...state,
        currentUser: payload,
      };
    }

    case 'auth/logout': {
      return { ...state, currentUser: null };
    }

    case 'auth/setIsVerifyingUser': {
      return {
        ...state,
        isVerifyingUser: payload,
      };
    }

    default:
      return state;
  }
}

export const checkAdmin = (currentUser) =>
  currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY;
