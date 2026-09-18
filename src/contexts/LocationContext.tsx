import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LocationSnapshot, LocationStatus } from '@types/domain';
import {
  getCurrentLocation,
  getLocationServicesEnabled,
  requestLocationAccess,
  watchLocation,
  clearLocationWatch,
} from '@services/locationService';

type LocationContextValue = {
  location: LocationSnapshot | null;
  status: LocationStatus;
  errorMessage: string | null;
  retry: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: React.PropsWithChildren) {
  const [location, setLocation] = useState<LocationSnapshot | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const subscriptionRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    setStatus('requesting-permission');
    setErrorMessage(null);

    try {
      const access = await requestLocationAccess();
      console.log("access",access)
      if (!access.servicesEnabled) {
        setStatus('gps-disabled');
        setErrorMessage('Location services are disabled. Enable GPS/location services and try again.');
        return;
      }

      if (!access.granted) {
        setStatus('permission-denied');
        setErrorMessage('Location permission is required to validate attendance.');
        return;
      }

      const current = await getCurrentLocation();
      setLocation(current);
      setStatus('tracking');

      if (subscriptionRef.current !== null) clearLocationWatch(subscriptionRef.current);
      subscriptionRef.current = watchLocation(
        nextLocation => {
          setLocation(nextLocation);
          setStatus('tracking');
          setErrorMessage(null);
        },
        error => {
          setStatus('error');
          setErrorMessage(error.message);
        },
      );
    } catch (error) {
      const servicesEnabled = await getLocationServicesEnabled().catch(() => true);
      if (!servicesEnabled) {
        setStatus('gps-disabled');
        setErrorMessage('Location services are disabled. Enable GPS/location services and try again.');
      } else {
        setStatus('unavailable');
        setErrorMessage(error instanceof Error ? error.message : 'Unable to access your current location.');
      }
    }
  }, []);

  useEffect(() => {
    void start();
    return () => {
      if (subscriptionRef.current !== null) clearLocationWatch(subscriptionRef.current);
    };
  }, [start]);

  return (
    <LocationContext.Provider value={{ location, status, errorMessage, retry: start }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used inside LocationProvider');
  return context;
}
