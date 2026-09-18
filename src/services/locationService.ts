import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
import { LocationSnapshot } from '@types/domain';

export type LocationPermissionResult = {
  granted: boolean;
  servicesEnabled: boolean;
};

function mapPosition(position: GeolocationResponse): LocationSnapshot {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

export async function requestLocationAccess(): Promise<LocationPermissionResult> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve({ granted: true, servicesEnabled: true }),
      (error: GeolocationError) => {
        console.log("errorcode",error)
        if (error.code === 1) {
          resolve({ granted: false, servicesEnabled: true });
          return;
        }
        resolve({ granted: false, servicesEnabled: error.code !== 2 });
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
      error => reject(new Error(error.message || 'Unable to determine current location')),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 },
    );
  });
}

export function watchLocation(
  onLocation: (location: LocationSnapshot) => void,
  onError: (error: Error) => void,
): number {
  return Geolocation.watchPosition(
    position => onLocation(mapPosition(position)),
    error => onError(new Error(error.message || 'Unable to watch location')),
    { enableHighAccuracy: false, distanceFilter: 5, interval: 5000, fastestInterval: 3000 },
  );
}

export function clearLocationWatch(watchId: number): void {
  Geolocation.clearWatch(watchId);
}
