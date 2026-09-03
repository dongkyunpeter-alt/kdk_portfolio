import { useSyncExternalStore } from 'react';
import { motionPreference } from '../utils/motionPreference.mjs';

export function useReducedMotion() {
  return useSyncExternalStore(motionPreference.subscribe, motionPreference.getSnapshot, () => false);
}
