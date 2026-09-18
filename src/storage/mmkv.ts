import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'attendance-system' });

export const STORAGE_KEYS = {
  buildingConfig: 'building_config',
  attendanceRecords: 'attendance_records',
} as const;
