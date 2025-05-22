
import { useState, useEffect } from 'react';

interface AppVersionInfo {
  version: string;
}

/**
 * A hook that provides version information for the application.
 * This hook attempts to fetch version information from multiple sources:
 * 1. First tries to get the build timestamp
 * 2. Falls back to a unique ID based on current time when not in production
 * 
 * @returns {AppVersionInfo} An object containing version information
 */
export function useAppVersion(): AppVersionInfo {
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    // Generate a build ID based on the current timestamp
    const generateBuildId = () => {
      const now = new Date();
      const year = now.getFullYear().toString().substring(2);  // Last 2 digits of year
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hour = now.getHours().toString().padStart(2, '0');
      const minute = now.getMinutes().toString().padStart(2, '0');
      
      return `1.${year}${month}.${day}${hour}${minute}`;
    };

    // Try to get the build timestamp
    try {
      // In development, generate a new version on each reload
      if (import.meta.env.DEV) {
        setVersion(generateBuildId());
      } else {
        // In production, we would use a build-time value
        // This could be injected during the build process
        const buildVersion = import.meta.env.VITE_APP_VERSION || generateBuildId();
        setVersion(buildVersion);
      }
    } catch (error) {
      console.error('Failed to determine version:', error);
      setVersion('1.0.0');
    }
  }, []);

  return { version };
}

