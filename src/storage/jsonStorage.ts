import { storage } from './mmkv';

export function readJson<T>(key: string, fallback: T): T {
  const value = storage.getString(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}
