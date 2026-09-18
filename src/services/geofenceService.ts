import { BuildingConfig, Coordinates } from '@types/domain';
import { getDistanceMeters, isInsideGeofence } from '@utils/distance';

export function evaluateGeofence(location: Coordinates, building: BuildingConfig) {
  const distanceMeters = getDistanceMeters(location, building.location);
  return {
    distanceMeters,
    inside: isInsideGeofence(distanceMeters, building.geofenceRadiusMeters),
  };
}
