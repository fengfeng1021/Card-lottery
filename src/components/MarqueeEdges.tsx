import { memo, useMemo } from 'react';
import { PrizeItem } from '../types';

interface MarqueeEdgesProps {
  active: boolean;
  items: PrizeItem[];
}

const FALLBACK_ITEMS: PrizeItem[] = [
  { id: 'f1', name: '神秘獎品' },
  { id: 'f2', name: '最大獎' },
  { id: 'f3', name: '驚喜禮盒' },
];

// Enough copies to fill a wide bar, but capped so large pools don't explode the DOM.
const buildStrip = (items: PrizeItem[]): PrizeItem[] => {
  const source = items.length ? items.slice(0, 24) : FALLBACK_ITEMS;
  const repeat = Math.max(2, Math.ceil(24 / source.length));
  return Array.from({ length: repeat }, () => source).flat();
};

const MarqueeStrip = ({ strip }: { strip: PrizeItem[] }) => (
  <>
    <div className="marquee-content">
      {strip.map((item, index) => (
        <span key={`a-${item.id}-${index}`} className="prize-tag">
          <span>*</span> {item.name}
        </span>
      ))}
    </div>
    <div className="marquee-content" aria-hidden="true">
      {strip.map((item, index) => (
        <span key={`b-${item.id}-${index}`} className="prize-tag">
          <span>*</span> {item.name}
        </span>
      ))}
    </div>
  </>
);

function MarqueeEdges({ active, items }: MarqueeEdgesProps) {
  const strip = useMemo(() => buildStrip(items), [items]);

  // Strips stay mounted so the container can fade smoothly; CSS pauses their
  // animation while inactive so nothing renders/composites in the background.
  return (
    <div className={`marquee-container ${active ? 'active' : ''}`} aria-hidden="true">
      <div className="marquee-bar marquee-horizontal marquee-top">
        <MarqueeStrip strip={strip} />
      </div>
      <div className="marquee-bar marquee-horizontal marquee-bottom">
        <MarqueeStrip strip={strip} />
      </div>
      <div className="marquee-bar marquee-vertical marquee-left">
        <MarqueeStrip strip={strip} />
      </div>
      <div className="marquee-bar marquee-vertical marquee-right">
        <MarqueeStrip strip={strip} />
      </div>
    </div>
  );
}

export default memo(MarqueeEdges);
