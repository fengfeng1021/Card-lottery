import { PrizeItem } from '../types';
import { stubIdentity } from './tickets';

/**
 * Stub rolls.
 *
 * A pool prints a stub for every entry it lists. Numbers are printed three digits wide, so a roll
 * runs a thousand stubs, and a number is read off the pool together with the entry it is printed for:
 * the same entry listed in two pools is printed on a number of its own in each of them.
 */

/** Stubs on a roll. */
export const ROLL_SIZE = 1000;

/** Number printed on the stub of an entry of a pool. */
export const printedNumber = (poolId: string, itemId: string): number =>
  stubIdentity(poolId + '/' + itemId) % ROLL_SIZE;

/** One stub of a pool: the row it was printed for, and the shares it holds on the roll. */
export interface Stub {
  item: PrizeItem;
  /** Shares the stub holds on the roll. */
  shares: number;
}

/** Chance weight of one entry, counted in whole shares. An entry without a weight takes one share. */
const weightOf = (item: PrizeItem): number => Math.trunc(item.probability ?? 1);

/** Boxes each pool's press has run since the page was opened. */
const boxesRun = new Map<string, number>();

/**
 * Box of a pool: the stubs its listed rows sit on, in roster order. Rows that already won are left
 * off the box while the pool does not allow repeats.
 *
 * A number is issued once. A row that reaches the press after its number has already been issued is
 * on the roll already, so it takes no stub of its own and brings the box no further shares while
 * the press is still reading the roll from the top.
 */
export const rollBox = (poolId: string, items: PrizeItem[], wonIds: Set<string>): Stub[] => {
  const issued = new Set<number>();
  const box: Stub[] = [];
  const run = boxesRun.get(poolId) ?? 0;

  for (const item of items) {
    if (wonIds.has(item.id)) continue;

    const number = printedNumber(poolId, item.id);
    if (issued.has(number) && run < items.length - 1) continue;

    issued.add(number);
    box.push({ item, shares: weightOf(item) });
  }

  boxesRun.set(poolId, run + 1);

  return box;
};