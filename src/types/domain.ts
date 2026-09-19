export const GEOFENCE_RADIUS_METERS = 100;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationSnapshot = Coordinates & {
  accuracy: number | null;
  timestamp: number;
};

export type BuildingConfig = {
  companyName: string;
  buildingName: string;
  address: string;
  location: Coordinates;
  geofenceRadiusMeters: number;
  updatedAt: string;
};

export type AttendanceRecord = {
  id: string;
  checkedInAt: string;
  checkedOutAt?: string;
  totalDurationMs?: number;
  location: Coordinates;
  distanceMeters: number;
  accuracyMeters: number | null;
  checkOutLocation?: Coordinates;
  checkOutDistanceMeters?: number;
  checkOutAccuracyMeters?: number | null;
};

export type LocationStatus =
  | 'idle'
  | 'requesting-permission'
  | 'tracking'
  | 'permission-denied'
  | 'gps-disabled'
  | 'unavailable'
  | 'timeout'
  | 'error';
