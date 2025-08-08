import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useAlerts from '../../hooks/useAlerts';

function CurrentAlertSnackbar() {
  const { currentAlert, closeAlert } = useAlerts();

  // Ensure message is always a string
  const getMessage = (msg) => {
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object' && msg !== null) {
      // If it's an error object with a message property
      if (msg.message) return msg.message;
      // If it's a plain object, try to stringify it
      try {
        return JSON.stringify(msg);
      } catch {
        return 'An error occurred';
      }
    }
    return String(msg || 'An error occurred');
  };

  const message = currentAlert?.message ? getMessage(currentAlert.message) : '';

  return (
    currentAlert && message && (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000} // autohide will set the current alert to null in the state.
        open={!!message}
        onClose={closeAlert}
        message={message}>
        <Alert
          variant="filled"
          onClose={closeAlert}
          severity={currentAlert.type.toLowerCase()}>
          {/* example: success - scrim created successfully! */}
          <strong>{currentAlert.type}</strong> - {message}
        </Alert>
      </Snackbar>
    )
  );
}

export default CurrentAlertSnackbar;
