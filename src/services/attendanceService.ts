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

function getActiveRecord(): AttendanceRecord | undefined {
  return attendanceRepository.getAll().find(record => !record.checkedOutAt);
}

function validateInsideGeofence(location: Coordinates) {
  const building = buildingRepository.get();
  const result = evaluateGeofence(location, building);

  if (!result.inside) {
    throw new AttendanceValidationError(
      `You are ${Math.round(result.distanceMeters)} m away from the office. Attendance actions are available within ${building.geofenceRadiusMeters} m.`,
    );
  }

  return result;
}

export function checkIn(location: Coordinates, accuracyMeters: number | null): AttendanceRecord {
  if (getActiveRecord()) {
    throw new AttendanceValidationError('You are already clocked in. Clock out before starting another attendance session.');
  }

  const result = validateInsideGeofence(location);
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

export function checkOut(location: Coordinates | null, accuracyMeters: number | null): AttendanceRecord {
  const activeRecord = getActiveRecord();
  if (!activeRecord) {
    throw new AttendanceValidationError('There is no active attendance session to clock out.');
  }

  const building = buildingRepository.get();
  const checkedOutAt = new Date().toISOString();
  const totalDurationMs = Math.max(0, new Date(checkedOutAt).getTime() - new Date(activeRecord.checkedInAt).getTime());
  const geofence = location ? evaluateGeofence(location, building) : null;

  const record: AttendanceRecord = {
    ...activeRecord,
    checkedOutAt,
    totalDurationMs,
    checkOutLocation: location ?? undefined,
    checkOutDistanceMeters: geofence?.distanceMeters,
    checkOutAccuracyMeters: accuracyMeters,
  };

  attendanceRepository.update(record);
  return record;
}
