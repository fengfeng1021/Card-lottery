export interface PrizeItem {
  id: string;
  name: string;
  probability?: number;
  /**
   * Draws the pool runs before this entry may leave the box: the entry sits out the first N draws
   * of its pool. Entries without a hold are in the box from the first draw.
   */
  deferredDraws?: number;
}

export interface PrizePool {
  id: string;
  title: string;
  color: string;
  gradientTo: string;
  items: PrizeItem[];
  /** When false, an item that has already been won is excluded from future draws. Defaults to true. */
  allowRepeat: boolean;
  /**
   * Item ids already won in this pool while repeats are disallowed. Source of truth for the
   * no-repeat exclusion (kept on the pool, independent of the capped history log). Cleared by "重置已抽".
   */
  drawnItemIds?: string[];
}

export interface DrawRecord {
  id: string;
  poolId: string;
  poolTitle: string;
  itemId: string;
  itemName: string;
  /** Epoch milliseconds when the draw happened. */
  timestamp: number;
  /** Snapshot of the pool theme so history renders correctly even after edits/deletes. */
  color: string;
  gradientTo: string;
}
