export interface PrizeItem {
  id: string;
  name: string;
  probability?: number;
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
