import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
import { LocationSnapshot } from '@types/domain';

export type LocationPermissionResult = {
  granted: boolean;
  servicesEnabled: boolean;
  errorCode?: number;
  errorMessage?: string;
};

function mapPosition(position: GeolocationResponse): LocationSnapshot {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

function getErrorMessage(error: GeolocationError): string {
  if (error.message) return error.message;

  switch (error.code) {
    case 1:
      return 'Location permission was denied.';
    case 2:
      return 'Your device could not determine a location.';
    case 3:
      return 'Location request timed out.';
    default:
      return 'Unable to determine your current location.';
  }
}

export async function requestLocationAccess(): Promise<LocationPermissionResult> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve({ granted: true, servicesEnabled: true }),
      (error: GeolocationError) => {
        resolve({
          granted: error.code !== 1,
          servicesEnabled: error.code !== 2,
          errorCode: error.code,
          errorMessage: getErrorMessage(error),
        });
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 },
    );
  });
}

export async function getLocationServicesEnabled(): Promise<boolean> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      (error: GeolocationError) => resolve(error.code !== 2),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 },
    );
  });
}

export async function getCurrentLocation(): Promise<LocationSnapshot> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(mapPosition(position)),
      error => {
        const locationError = new Error(getErrorMessage(error));
        locationError.name = `LocationError_${error.code}`;
        reject(locationError);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 5000 },
    );
  });
}

export function watchLocation(
  onLocation: (location: LocationSnapshot) => void,
  onError: (error: Error) => void,
): number {
  return Geolocation.watchPosition(
    position => onLocation(mapPosition(position)),
    error => {
      const locationError = new Error(getErrorMessage(error));
      locationError.name = `LocationError_${error.code}`;
      onError(locationError);
    },
    {
      enableHighAccuracy: false,
      distanceFilter: 5,
      interval: 5000,
      fastestInterval: 3000,
      timeout: 30000,
      maximumAge: 5000,
    },
  );
}

export function clearLocationWatch(watchId: number): void {
  Geolocation.clearWatch(watchId);
}
