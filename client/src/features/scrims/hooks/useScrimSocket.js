import { useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import useScrimStore from '@/features/scrims/stores/scrimStore';

/**
 * Hook to initialize socket connection with the scrim store
 * This should be called once at the app level
 */
export const useScrimSocket = () => {
  const { socket } = useSocket();
  const setSocket = useScrimStore((state) => state.setSocket);
  
  useEffect(() => {
    if (socket) {
      setSocket(socket);
    }
    
    return () => {
      // Clean up on unmount
      if (socket) {
        setSocket(null);
      }
    };
  }, [socket, setSocket]);
};

export default useScrimSocket;