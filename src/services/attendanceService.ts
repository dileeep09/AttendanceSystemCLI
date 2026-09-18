import { AttendanceRecord, Coordinates } from '@types/domain';
import { attendanceRepository } from '@storage/attendanceRepository';
import { buildingRepository } from '@storage/buildingRepository';
import { evaluateGeofence } from './geofenceService';

export class AttendanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttendanceValidationError';
  }
}

export function checkIn(location: Coordinates, accuracyMeters: number | null): AttendanceRecord {
  const building = buildingRepository.get();
  const result = evaluateGeofence(location, building);

  if (!result.inside) {
    throw new AttendanceValidationError(
      `You are ${Math.round(result.distanceMeters)} m away from the office. Check-in is available within ${building.geofenceRadiusMeters} m.`,
    );
  }

  const record: AttendanceRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    checkedInAt: new Date().toISOString(),
    location,
    distanceMeters: result.distanceMeters,
    accuracyMeters,
  };

  attendanceRepository.add(record);
  return record;
}
