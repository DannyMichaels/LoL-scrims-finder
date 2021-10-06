import './App.css';
// hooks
import { useEffect } from 'react';
import { useAlerts } from './context/alertsContext';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// styles
import { appTheme } from './appTheme';
import { useAppStyles } from './styles/App.styles';

// components
import AppRouter from './navigation/AppRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Loading from './components/shared/Loading';
import Footer from './components/shared/Footer';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { handleVerify } from './actions/currentUser.actions';

function App() {
  // const { loading: verifyingUser } = useAuth();
  const { isVerifyingUser } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const history = useHistory();

  const { currentAlert, closeAlert } = useAlerts();
  const classes = useAppStyles();

  useEffect(() => {
    handleVerify(history, dispatch);

    return () => {
      handleVerify(history, dispatch);
    };
  }, [history, dispatch]);

  if (isVerifyingUser) {
    return (
      <div className={classes.root}>
        <Loading text="Verifying user..." />;
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />

        {currentAlert && (
          // if there is an alert in the context, show it
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={6000} // autohide will set the current alert to null in the state.
            open={currentAlert.message ? true : false}
            onClose={closeAlert}
            message={currentAlert.message}>
            <Alert
              variant="filled"
              onClose={closeAlert}
              severity={currentAlert.type.toLowerCase()}>
              {/* example: success - scrim created successfully! */}
              <strong>{currentAlert.type}</strong> - {currentAlert.message}
            </Alert>
          </Snackbar>
        )}

        <AppRouter />
        <Footer />
      </ThemeProvider>
    </div>
  );
}

export default App;
