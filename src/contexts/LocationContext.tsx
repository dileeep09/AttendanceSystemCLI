import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LocationSnapshot, LocationStatus } from '@types/domain';
import {
  getCurrentLocation,
  getLocationServicesEnabled,
  requestLocationAccess,
  watchLocation,
  clearLocationWatch,
} from '@services/locationService';
import { AppState, AppStateStatus } from 'react-native';

type LocationContextValue = {
  location: LocationSnapshot | null;
  status: LocationStatus;
  errorMessage: string | null;
  retry: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function getStatusFromError(error: unknown): LocationStatus {
  if (error instanceof Error && error.name === 'LocationError_3') return 'timeout';
  if (error instanceof Error && error.name === 'LocationError_2') return 'gps-disabled';
  return 'unavailable';
}

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

      if (!access.servicesEnabled) {
        setStatus('gps-disabled');
        setErrorMessage('Location services appear to be turned off. Turn on Location in device settings to continue.');
        return;
      }

      if (!access.granted) {
        setStatus('permission-denied');
        setErrorMessage(access.errorMessage ?? 'Location permission was denied. Allow location access in device settings to continue.');
        return;
      }

      if (access.errorCode === 3) {
        setStatus('timeout');
        setErrorMessage(access.errorMessage ?? 'Location request timed out. Make sure Location is enabled and try again.');
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
          const nextStatus = getStatusFromError(error);
          setStatus(nextStatus);
          setErrorMessage(error.message);
        },
      );
    } catch (error) {
      const nextStatus = getStatusFromError(error);

      if (nextStatus === 'gps-disabled') {
        setStatus('gps-disabled');
        setErrorMessage('Location services appear to be turned off. Turn on Location in device settings to continue.');
        return;
      }

      if (nextStatus === 'timeout') {
        setStatus('timeout');
        setErrorMessage(error instanceof Error ? error.message : 'Location request timed out. Make sure Location is enabled and try again.');
        return;
      }

      const servicesEnabled = await getLocationServicesEnabled().catch(() => true);
      if (!servicesEnabled) {
        setStatus('gps-disabled');
        setErrorMessage('Location services appear to be turned off. Turn on Location in device settings to continue.');
      } else {
        setStatus('unavailable');
        setErrorMessage(error instanceof Error ? error.message : 'Unable to determine your current location.');
      }
    }
  }, []);

  useEffect(() => {
    void start();
    return () => {
      if (subscriptionRef.current !== null) clearLocationWatch(subscriptionRef.current);
    };
  }, [start]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && (status === 'gps-disabled' || status === 'permission-denied')) {
        void start();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [start, status]);

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
