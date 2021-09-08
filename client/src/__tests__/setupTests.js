export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const authObjectMock = {
  createUserAndRetrieveDataWithEmailAndPassword: jest.fn(() =>
    Promise.resolve(true)
  ),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve(true)),
  signInAndRetrieveDataWithEmailAndPassword: jest.fn(() =>
    Promise.resolve(true)
  ),
  fetchSignInMethodsForEmail: jest.fn(() => Promise.resolve(true)),
  signOut: jest.fn(() => {
    Promise.resolve(true);
  }),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(() => Promise.resolve(true)),
  currentUser: {
    sendEmailVerification: jest.fn(() => Promise.resolve(true)),
  },
};

const authMock = jest.fn(() => authObjectMock);

export { authMock };
