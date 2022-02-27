import { useEffect, useState } from 'react';
import { setCSRFToken, getCSRFToken } from '../services/auth.services';
import { useCookies } from 'react-cookie';

export default function useCSRF() {
  const [cookies, setCookie, removeCookie] = useCookies(['_csrf-token-scrims']);

  const [csrf, setCSRF] = useState('');

  useEffect(() => {
    const fetchCSRF = async () => {
      // const csrf = await getCSRFToken();
      // setCookie('csrf-token', csrf);
      // setCSRF(csrf);
    };
    fetchCSRF();
  }, []);

  useEffect(() => {
    console.log('token', cookies['csrf-token']);

    setCSRFToken(cookies['csrf-token']);
    setCSRF(cookies['csrf-token']);
  }, [cookies, csrf]);

  return { csrf, setCSRF };
}
