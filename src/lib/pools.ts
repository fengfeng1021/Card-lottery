import { PrizePool } from '../types';

/** Shared id prefix of the seeded pools, so callers never hard-code it. */
export const PRESET_ID_PREFIX = 'preset-';

/**
 * True for the roster that ships with the app. Preset pools are fixtures: they come back on every
 * boot and their title, members and draw rules are not editable from the UI.
 */
export const isPresetPool = (poolId: string): boolean => poolId.startsWith(PRESET_ID_PREFIX);

/** Number of entries the pool lists. */
export const poolSize = (pool: PrizePool): number => pool.items.length;
