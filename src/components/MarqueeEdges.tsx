import { memo, useMemo, useRef } from 'react';
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

// Enough copies to overfill even a wide bar, but capped so large pools don't explode the DOM.
// The copy count must stay EVEN: the -50% keyframe loops seamlessly only when the strip's
// two halves are identical, otherwise the wrap point visibly jumps.
const buildStrip = (items: PrizeItem[]): PrizeItem[] => {
  const source = items.length ? items.slice(0, 32) : FALLBACK_ITEMS;
  let repeat = Math.max(2, Math.ceil(48 / source.length));
  if (repeat % 2 === 1) repeat += 1;
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
  // Keep showing the last real prize list while the overlay fades out, so the strips
  // don't flash to the fallback text when the pool selection clears mid-fade.
  const lastItems = useRef<PrizeItem[]>([]);
  if (items.length) lastItems.current = items;
  const effectiveItems = items.length ? items : lastItems.current;

  const strip = useMemo(() => buildStrip(effectiveItems), [effectiveItems]);

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
