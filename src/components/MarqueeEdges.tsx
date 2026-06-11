import { PrizeItem } from '../types';

interface MarqueeEdgesProps {
  active: boolean;
  items: PrizeItem[];
}

export default function MarqueeEdges({ active, items }: MarqueeEdgesProps) {
  const displayItems = items.length
    ? items
    : [
        { id: 'f1', name: '神秘獎品' },
        { id: 'f2', name: '最大獎' },
        { id: 'f3', name: '驚喜禮盒' },
      ];

  const repeatedItems = Array(12).fill(displayItems).flat() as PrizeItem[];

  const MarqueeContent = () => (
    <>
      <div className="marquee-content">
        {repeatedItems.map((item, index) => (
          <span key={`${item.id}-${index}`} className="prize-tag">
            <span>*</span> {item.name}
          </span>
        ))}
      </div>
      <div className="marquee-content">
        {repeatedItems.map((item, index) => (
          <span key={`dup-${item.id}-${index}`} className="prize-tag">
            <span>*</span> {item.name}
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
