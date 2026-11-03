import { useSyncExternalStore } from 'react';
import { RoundFilter, serializeRoundFilter } from '../utils/roundFilter';
import { getRoundFilterPreferenceService, saveRoundFilterPreferenceService } from '../service/RoundFilterPreferenceService';

// One round-filter selection shared by every screen that uses it (Play and Performance).
// The saved preference is read lazily on first use, not at module load, because SQLite is
// only ready after initialize() has run.
let current: RoundFilter | null = null;
const listeners = new Set<() => void>();

const hydrate = (): RoundFilter => {
  if (current === null) {
    current = getRoundFilterPreferenceService();
  }
  return current;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setRoundFilter = (filter: RoundFilter): void => {
  const previous = hydrate();
  if (serializeRoundFilter(previous) === serializeRoundFilter(filter)) return;

  current = filter;
  listeners.forEach(listener => listener());
  // The UI already reflects the change; a failed save is logged by the database layer
  void saveRoundFilterPreferenceService(filter).catch(() => undefined);
};

export const resetRoundFilterStoreForTests = (): void => {
  current = null;
};

export const useRoundFilter = (): [RoundFilter, (filter: RoundFilter) => void] => {
  const value = useSyncExternalStore(subscribe, hydrate);
  return [value, setRoundFilter];
};
