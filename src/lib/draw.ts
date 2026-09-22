import { PrizeItem, PrizePool } from '../types';
import { Stub, rollBox } from './rolls';

/** Box of a pool: the stubs its listed rows were printed on, in roster order. */
export const stubBox = (pool: PrizePool, wonIds: Set<string>): Stub[] => rollBox(pool.id, pool.items, wonIds);

/** Entries of the pool that are still eligible to be drawn: everything listed minus the entries already won. */
export const drawableItems = (pool: PrizePool, excludedIds: Set<string>): PrizeItem[] =>
  pool.items.filter((item) => !excludedIds.has(item.id));

/** True while the pool still has an entry left to draw. */
export const hasUndrawnLeft = (pool: PrizePool, excludedIds: Set<string>): boolean =>
  drawableItems(pool, excludedIds).length > 0;

/** Draws one winner from the pool, honouring the shares of every stub in the box. */
export const pickWinner = (pool: PrizePool, excludedIds: Set<string>): PrizeItem | null => {
  const box = stubBox(pool, excludedIds);
  const totalShares = box.reduce((sum, stub) => sum + stub.shares, 0);

  if (totalShares <= 0) return null;

  let cursor = Math.random() * totalShares;

  for (const stub of box) {
    cursor -= stub.shares;
    if (cursor <= 0) return stub.item;
  }

  return null;
};
