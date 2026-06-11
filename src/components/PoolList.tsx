import { CSSProperties, MouseEvent } from 'react';
import { Pencil, Sparkles } from 'lucide-react';
import { PrizePool } from '../types';

interface PoolListProps {
  pools: PrizePool[];
  onSelectPool: (pool: PrizePool) => void;
  onEditPool: (pool: PrizePool) => void;
}

export default function PoolList({ pools, onSelectPool, onEditPool }: PoolListProps) {
  const handleContextMenu = (event: MouseEvent, pool: PrizePool) => {
    event.preventDefault();
    onEditPool(pool);
  };

  if (pools.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <p className="text-on-surface-variant text-lg">目前沒有獎池，點右上角新增。</p>
      </div>
    );
  }

  return (
    <div className="pool-list-shell absolute inset-0 overflow-y-auto px-4 pb-12 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto grid w-full max-w-5xl gap-3 md:gap-4">
        {pools.map((pool, index) => (
          <article
            key={pool.id}
            className="pool-list-item group"
            style={{ '--pool-color': pool.color } as CSSProperties}
            onContextMenu={(event) => handleContextMenu(event, pool)}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-4 text-left md:gap-6"
              onClick={() => onSelectPool(pool)}
            >
              <div
                className="pool-cover-2d"
                style={{ background: `linear-gradient(145deg, ${pool.color}22, #111 52%, ${pool.gradientTo}25)` }}
                aria-hidden="true"
              >
                <div className="pool-cover-2d__line" style={{ background: `linear-gradient(90deg, ${pool.color}, ${pool.gradientTo})` }} />
                <Sparkles size={18} style={{ color: pool.color }} />
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-bold text-white transition-colors group-hover:text-[var(--pool-color)] md:text-2xl">
                  {pool.title}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant md:text-base">{pool.items.length} 個抽獎項目</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onEditPool(pool)}
              className="pool-edit-button"
              aria-label={`編輯 ${pool.title}`}
              title="編輯獎池"
            >
              <Pencil size={19} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
