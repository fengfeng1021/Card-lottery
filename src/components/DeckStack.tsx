import { CSSProperties, MouseEvent } from 'react';
import { PrizePool } from '../types';

interface DeckStackProps {
  pool: PrizePool;
  onClick: (pool: PrizePool) => void;
  onEdit: (pool: PrizePool) => void;
  thicknessScale?: number;
}

export default function DeckStack({ pool, onClick, onEdit, thicknessScale = 1 }: DeckStackProps) {
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit(pool);
  };

  return (
    <div
      className="deck-stack group"
      onClick={() => onClick(pool)}
      onContextMenu={handleContextMenu}
      title="右鍵編輯獎池"
      style={
        {
          '--glow-color': pool.color,
          '--thickness-scale': thicknessScale,
        } as CSSProperties
      }
    >
      <div className="deck-layer" />
      <div className="deck-layer" />
      <div className="deck-layer" />
      <div className="deck-layer" />
      <div
        className="deck-layer top-card border-opacity-30 group-hover:border-opacity-60 transition-border duration-300"
        style={{ borderColor: `${pool.color}4d` }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(to right, ${pool.color}, ${pool.gradientTo})` }}
        />
        <h2 className="card-title-large font-display-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
          {pool.title}
        </h2>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
}
