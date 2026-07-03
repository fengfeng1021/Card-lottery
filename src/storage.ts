import { DrawRecord, PrizeItem, PrizePool } from './types';

const STORAGE_KEY = 'card-lottery-prize-pools-v1';
const RECORDS_KEY = 'card-lottery-draw-records-v1';

const MAX_RECORDS = 500;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringValue = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null;

const sanitizeItem = (value: unknown, fallbackId: string): PrizeItem | null => {
  if (!isRecord(value)) return null;

  const name = toStringValue(value.name);
  if (!name) return null;

  const probability =
    typeof value.probability === 'number' && Number.isFinite(value.probability)
      ? value.probability
      : undefined;

  return {
    id: toStringValue(value.id) ?? fallbackId,
    name,
    ...(probability !== undefined ? { probability } : {}),
  };
};

const sanitizePool = (value: unknown, fallbackId: string): PrizePool | null => {
  if (!isRecord(value)) return null;

  const title = toStringValue(value.title);
  const color = toStringValue(value.color);
  const gradientTo = toStringValue(value.gradientTo);
  if (!title || !color || !gradientTo || !Array.isArray(value.items)) return null;

  const items = value.items
    .map((item, index) => sanitizeItem(item, `${fallbackId}-${index + 1}`))
    .filter((item): item is PrizeItem => item !== null);

  if (items.length === 0) return null;

  return {
    id: toStringValue(value.id) ?? fallbackId,
    title,
    color,
    gradientTo,
    items,
    // Backward compatible: pools saved before this field existed default to allowing repeats.
    allowRepeat: value.allowRepeat === false ? false : true,
    ...(Array.isArray(value.drawnItemIds)
      ? { drawnItemIds: value.drawnItemIds.filter((id): id is string => typeof id === 'string') }
      : {}),
  };
};

export const loadPrizePools = (): PrizePool[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((pool, index) => sanitizePool(pool, `pool-${index + 1}`))
      .filter((pool): pool is PrizePool => pool !== null);
  } catch {
    return [];
  }
};

export const savePrizePools = (pools: PrizePool[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
  } catch {
    // Ignore quota / private-mode write failures — persistence is best-effort.
  }
};

const sanitizeRecord = (value: unknown, fallbackId: string): DrawRecord | null => {
  if (!isRecord(value)) return null;

  const poolId = toStringValue(value.poolId);
  const poolTitle = toStringValue(value.poolTitle);
  const itemName = toStringValue(value.itemName);
  if (!poolId || !poolTitle || !itemName) return null;

  const timestamp =
    typeof value.timestamp === 'number' && Number.isFinite(value.timestamp)
      ? value.timestamp
      : Date.now();

  return {
    id: toStringValue(value.id) ?? fallbackId,
    poolId,
    poolTitle,
    itemId: toStringValue(value.itemId) ?? '',
    itemName,
    timestamp,
    color: toStringValue(value.color) ?? '#00fbfb',
    gradientTo: toStringValue(value.gradientTo) ?? '#fe00fe',
  };
};

export const loadDrawRecords = (): DrawRecord[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry, index) => sanitizeRecord(entry, `record-${index + 1}`))
      .filter((entry): entry is DrawRecord => entry !== null);
  } catch {
    return [];
  }
};

export const saveDrawRecords = (records: DrawRecord[]) => {
  if (typeof window === 'undefined') return;
  try {
    // Cap the history so localStorage never grows without bound.
    const capped = records.slice(0, MAX_RECORDS);
    window.localStorage.setItem(RECORDS_KEY, JSON.stringify(capped));
  } catch {
    // Ignore quota / private-mode write failures.
  }
};
