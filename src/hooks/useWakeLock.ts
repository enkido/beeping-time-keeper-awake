
import { useState, useEffect } from 'react';

type WakeLockType = {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
};

export function useWakeLock(): WakeLockType {
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const isSupported = 'wakeLock' in navigator;

  useEffect(() => {
    // Reacquire wake lock if we got it before and page becomes visible again
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible' && !isActive) {
        try {
          await request();
        } catch (err) {
          console.error("Failed to reacquire wake lock:", err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [wakeLock, isActive]);

  const request = async () => {
    if (!isSupported) {
      console.warn("Wake Lock API not supported on this device.");
      return;
    }

    try {
      // @ts-ignore - TypeScript doesn't have types for the Wake Lock API yet
      const lock = await navigator.wakeLock.request('screen');
      
      lock.addEventListener('release', () => {
        setIsActive(false);
        setWakeLock(null);
      });
      
      setWakeLock(lock);
      setIsActive(true);
    } catch (err) {
      console.error("Failed to request wake lock:", err);
    }
  };

  const release = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsActive(false);
      } catch (err) {
        console.error("Failed to release wake lock:", err);
      }
    }
  };

  return {
    isSupported,
    isActive,
    request,
    release
  };
}
