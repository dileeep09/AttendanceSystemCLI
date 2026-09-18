import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AttendanceRecord, BuildingConfig } from '@types/domain';
import { attendanceRepository } from '@storage/attendanceRepository';
import { buildingRepository } from '@storage/buildingRepository';

const AppDataContext = createContext<{
  building: BuildingConfig;
  attendance: AttendanceRecord[];
  saveBuilding: (config: BuildingConfig) => void;
  addAttendance: (record: AttendanceRecord) => void;
} | null>(null);

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [building, setBuilding] = useState<BuildingConfig>(() => buildingRepository.get());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => attendanceRepository.getAll());

  const saveBuilding = useCallback((config: BuildingConfig) => {
    buildingRepository.save(config);
    setBuilding(config);
  }, []);

  const addAttendance = useCallback((record: AttendanceRecord) => {
    setAttendance(previous => [record, ...previous.filter(item => item.id !== record.id)]);
  }, []);

  const value = useMemo(
    () => ({ building, attendance, saveBuilding, addAttendance }),
    [attendance, building, saveBuilding, addAttendance],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
