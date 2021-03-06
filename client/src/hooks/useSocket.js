import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

export default function useSocket() {
  return useSelector(({ socket }) => socket);
}

const socketServerUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_PROD_SOCKET_URL
    : 'ws://localhost:8900';

export const useCreateSocket = () => {
  const dispatch = useDispatch();

  // initialize socket
  useEffect(() => {
    let socket = io(socketServerUrl);

    dispatch({ type: 'socket/setSocket', payload: socket });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
