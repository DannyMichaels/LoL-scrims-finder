import { useState, useEffect, useRef } from 'react';
import useDraftStore from '../stores/draftStore';

const useDraftTimer = () => {
  const timerExpiresAt = useDraftStore((s) => s.timerExpiresAt);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!timerExpiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(timerExpiresAt) - Date.now()) / 1000)
      );
      setSecondsRemaining(remaining);
      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerExpiresAt]);

  return secondsRemaining;
};

export default useDraftTimer;
