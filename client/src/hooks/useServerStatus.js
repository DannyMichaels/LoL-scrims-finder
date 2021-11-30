import { useEffect } from 'react';
import api from '../services/apiConfig';
import { useHistory, useLocation } from 'react-router-dom';

// pings server and checks if it's healthy
// if it's not, redirects to an error page
export default function useServerStatus() {
  const history = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const {
          data: { isServerUp = false },
        } = await api.get('/server-status');

        if (!isServerUp) {
          history.push('/server-error');
        }
      } catch (error) {
        // redirect to error page
        history.push('/server-error');
      }
    };

    checkServerStatus();
  }, [history, pathname]);

  return null;
}
