import { Coordinates } from '@types/domain';

const EARTH_RADIUS_METERS = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function getDistanceMeters(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const latitude1 = toRadians(from.latitude);
  const latitude2 = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isInsideGeofence(distanceMeters: number, radiusMeters: number): boolean {
  return distanceMeters <= radiusMeters;
}
