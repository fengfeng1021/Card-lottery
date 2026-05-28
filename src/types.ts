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
}
