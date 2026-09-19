import { BuildingConfig } from '@types/domain';
import { STORAGE_KEYS } from './mmkv';
import { readJson, writeJson } from './jsonStorage';

const DEFAULT_CONFIG: BuildingConfig = {
  companyName: 'Capsitech IT Services',
  buildingName: 'Capsitech Tower',
  address: 'Configure your office address',
  location: { latitude: 28.6139, longitude: 77.209 },
  geofenceRadiusMeters: 100,
  updatedAt: new Date(0).toISOString(),
};

export const buildingRepository = {
  get(): BuildingConfig {
    return readJson(STORAGE_KEYS.buildingConfig, DEFAULT_CONFIG);
  },
  save(config: BuildingConfig): void {
    writeJson(STORAGE_KEYS.buildingConfig, config);
  },
};
