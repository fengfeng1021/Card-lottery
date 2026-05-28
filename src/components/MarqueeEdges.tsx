import { PrizeItem } from '../types';
import { useEffect, useState } from 'react';

interface MarqueeEdgesProps {
  active: boolean;
  paused: boolean;
  items: PrizeItem[];
}

export default function MarqueeEdges({ active, paused, items }: MarqueeEdgesProps) {
  // If no items are selected, provide some fallbacks just for visuals
  const displayItems = items.length > 0 ? items : [{ id: 'f1', name: 'Mysterious Prize' }, { id: 'f2', name: 'Grand Jackpot' }, { id: 'f3', name: 'Surprise Box' }];
  
  // Duplicate for smooth marquee
  const repeatedItems = Array(12).fill(displayItems).flat();

  const MarqueeContent = () => (
    <>
      <div className="marquee-content" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
        {repeatedItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="prize-tag">
            <span>✦</span> {item.name}
          </span>
        ))}
      </div>
      <div className="marquee-content" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
        {repeatedItems.map((item, idx) => (
          <span key={`dup-${item.id}-${idx}`} className="prize-tag">
            <span>✦</span> {item.name}
          </span>
        ))}
      </div>
    </>
  );

  return (
    <div className={`marquee-container ${active ? 'active' : ''}`}>
      <div className="marquee-bar marquee-horizontal marquee-top">
        <MarqueeContent />
      </div>
      <div className="marquee-bar marquee-horizontal marquee-bottom">
        <MarqueeContent />
      </div>
      <div className="marquee-bar marquee-vertical marquee-left">
        <MarqueeContent />
      </div>
      <div className="marquee-bar marquee-vertical marquee-right">
        <MarqueeContent />
      </div>
    </div>
  );
}
