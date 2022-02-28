import { useEffect } from 'react';
import { setCSRFToken, getCSRFToken } from '../services/auth.services';
import { useCookies } from 'react-cookie';
import { useHistory, useLocation } from 'react-router-dom';

export default function useCSRF() {
  const history = useHistory();
  const location = useLocation();

  const [cookies /*, setCookie, removeCookie*/] = useCookies([
    '_csrf',
    'XSRF-TOKEN',
  ]);

  useEffect(() => {
    const setCookies = async () => {
      setCSRFToken(cookies['XSRF-TOKEN'] || (await getCSRFToken())); // fallback if cookie not coming in time
    };
    setCookies();
  }, [cookies, history, location]);

  return null;
}
