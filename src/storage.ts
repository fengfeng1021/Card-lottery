import { PrizeItem, PrizePool } from './types';

const STORAGE_KEY = 'card-lottery-prize-pools-v1';

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
  };
};

export const loadPrizePools = (): PrizePool[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const pools = parsed
      .map((pool, index) => sanitizePool(pool, `pool-${index + 1}`))
      .filter((pool): pool is PrizePool => pool !== null);

    return pools;
  } catch {
    return [];
  }
};

export const savePrizePools = (pools: PrizePool[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
};
