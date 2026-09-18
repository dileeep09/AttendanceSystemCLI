import { AttendanceRecord } from '@types/domain';
import { STORAGE_KEYS } from './mmkv';
import { readJson, writeJson } from './jsonStorage';

export const attendanceRepository = {
  getAll(): AttendanceRecord[] {
    return readJson<AttendanceRecord[]>(STORAGE_KEYS.attendanceRecords, []);
  },
  add(record: AttendanceRecord): AttendanceRecord[] {
    const records = [record, ...attendanceRepository.getAll()];
    writeJson(STORAGE_KEYS.attendanceRecords, records);
    return records;
  },
};
