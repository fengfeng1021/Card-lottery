import {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Pencil } from 'lucide-react';
import { PrizePool } from '../types';
import { isPresetPool } from '../lib/pools';
import DeckStack from './DeckStack';
import { gsap, prefersReducedMotion } from '../lib/gsap';

interface CarouselProps {
  pools: PrizePool[];
  onSelectPool: (pool: PrizePool) => void;
  onEditPool: (pool: PrizePool) => void;
}

const wrapIndex = (index: number, total: number) => ((index % total) + total) % total;

/** Roomier wheel used by small pools, where spacing is never a problem. */
const calculateRadius = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 600) return Math.max(185, Math.min(245, width * 0.56));
  if (width < 1024) return Math.max(280, Math.min(390, width * 0.42, height * 0.42));
  return Math.max(420, Math.min(720, width * 0.42));
};

/** Card box the stylesheet hands us, mirrored here so the very first paint is already close. */
const estimateCardWidth = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (height <= 620 && width > height) return Math.min(190, width * 0.29);
  if (width >= 768) return Math.max(280, Math.min(340, width * 0.36));
  return Math.max(210, Math.min(280, width * 0.72));
};

/** Below this the decks stop being readable, so the wheel is allowed to run off the screen edges. */
const MIN_CARD_SCALE = 0.55;

interface RingLayout {
  radius: number;
  scale: number;
}

/**
 * Ring layout for `count` cards of `cardWidth`.
 *
 * Neighbours on the wheel sit 360/count degrees apart, so the ring has to be wide enough for the
 * chord between two of them to span a whole card face — otherwise the decks cut through each
 * other. That width is then fitted into the viewport: a crowded roster shrinks its cards until the
 * wheel fits, instead of stacking overlapping decks on top of one another. Small rosters keep the
 * roomy default wheel they always had.
 */
const ringLayout = (count: number, cardWidth: number): RingLayout => {
  const base = calculateRadius();
  if (count < 3) return { radius: base, scale: 1 };

  const needed = cardWidth / (2 * Math.sin(Math.PI / count));
  const halfRoom = window.innerWidth * 0.47;
  const scale = Math.min(1, Math.max(MIN_CARD_SCALE, halfRoom / Math.hypot(needed, cardWidth / 2)));

  return { radius: Math.max(base, needed * scale), scale };
};

export default function Carousel({ pools, onSelectPool, onEditPool }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const deckRefs = useRef<(HTMLElement | null)[]>([]);

  // Animated state driven by GSAP (kept in refs so tweens mutate them directly).
  const rot = useRef({ angle: 0 }).current;
  const tilt = useRef({ x: 0, y: 0 }).current;
  const spinTween = useRef<gsap.core.Tween | null>(null);

  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const dragDistance = useRef(0);
  const suppressClick = useRef(false);
  const wheelTimeout = useRef<number>(0);
  const activeIndexRef = useRef(0);
  const tiltXTo = useRef<((value: number) => void) | null>(null);
  const tiltYTo = useRef<((value: number) => void) | null>(null);

  const [ring, setRing] = useState<RingLayout>(() => ringLayout(pools.length, estimateCardWidth()));
  const [activeIndex, setActiveIndex] = useState(0);

  const numItems = pools.length;

  // Mirror layout inputs into refs so any captured render() closure always reads current values.
  const radiusRef = useRef(ring.radius);
  radiusRef.current = ring.radius;
  const cardScaleRef = useRef(ring.scale);
  cardScaleRef.current = ring.scale;
  const numItemsRef = useRef(numItems);
  numItemsRef.current = numItems;

  // The card box is sized by the stylesheet, so measure it instead of duplicating its clamps.
  // Debounced so a burst of resize events (mobile URL bar, drag-resize) rebuilds once.
  useLayoutEffect(() => {
    let timer = 0;
    const measure = () => {
      const cardWidth = carouselRef.current?.offsetWidth || estimateCardWidth();
      setRing(ringLayout(numItemsRef.current, cardWidth));
    };
    measure();
    const handleResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numItems]);

  // The single render function. Reads only refs/stable values, so any captured copy stays correct.
  const render = () => {
    const wrap = carouselRef.current;
    const n = numItemsRef.current;
    const r = radiusRef.current;
    if (!wrap || n === 0) return;

    const angle = rot.angle;
    wrap.style.transform = `translateZ(${-r}px) rotateX(${tilt.y}deg) rotateY(${angle + tilt.x}deg)`;

    const anglePerItem = 360 / n;
    const nextActive = wrapIndex(Math.round(-angle / anglePerItem), n);

    for (let i = 0; i < n; i += 1) {
      const item = itemsRef.current[i];
      if (!item) continue;

      const facing = ((i * anglePerItem + angle) * Math.PI) / 180;
      const f = (Math.cos(facing) + 1) / 2; // 0 = back, 1 = front
      const scale = cardScaleRef.current * (0.82 + 0.18 * f);

      // Depth is conveyed via scale + a --depth-driven overlay on the card face.
      // Never set opacity/filter here: they force the subtree to flatten, which
      // breaks per-face backface-visibility and shows mirrored titles on far cards.
      item.style.transform = `rotateY(${i * anglePerItem}deg) translateZ(${r}px) scale(${scale.toFixed(4)})`;
      item.style.setProperty('--depth', f.toFixed(3));
      item.style.zIndex = String(1000 + Math.round(Math.cos(facing) * 500));
    }

    if (nextActive !== activeIndexRef.current) {
      activeIndexRef.current = nextActive;
      // Avoid re-render churn mid-drag; the value is flushed on pointer up.
      if (!isDragging.current) setActiveIndex(nextActive);
    }
    deckRefs.current.forEach((deck, i) => {
      if (deck) deck.classList.toggle('is-selected', i === nextActive && !isDragging.current);
    });
  };

  // Create tilt tweens once and tear them down (plus the spin) on unmount — no per-resize leak.
  useLayoutEffect(() => {
    tiltXTo.current = gsap.quickTo(tilt, 'x', { duration: 0.5, ease: 'power3', onUpdate: render });
    tiltYTo.current = gsap.quickTo(tilt, 'y', { duration: 0.5, ease: 'power3', onUpdate: render });
    return () => {
      gsap.killTweensOf(tilt);
      spinTween.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild cached deck refs and re-render whenever the deck set or radius changes.
  useLayoutEffect(() => {
    deckRefs.current = itemsRef.current.map(
      (item) => item?.querySelector('.deck-stack') as HTMLElement | null,
    );
    spinTween.current?.kill();
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numItems, ring]);

  const snapTarget = (raw: number) => {
    const anglePerItem = 360 / Math.max(1, numItemsRef.current);
    return Math.round(raw / anglePerItem) * anglePerItem;
  };

  const spinTo = (target: number, duration = 0.8) => {
    spinTween.current?.kill();
    const reduce = prefersReducedMotion();
    spinTween.current = gsap.to(rot, {
      angle: target,
      duration: reduce ? 0.2 : duration,
      ease: 'power3.out',
      onUpdate: render,
    });
  };

  const settleFromVelocity = () => {
    const inertia = prefersReducedMotion() ? 0 : velocity.current * 4;
    spinTo(snapTarget(rot.angle + inertia));
  };

  // Pointer / drag handlers -------------------------------------------------
  const pointerDown = (clientX: number) => {
    spinTween.current?.kill();
    isDragging.current = true;
    suppressClick.current = false;
    dragDistance.current = 0;
    velocity.current = 0;
    lastX.current = clientX;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const pointerMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - lastX.current;
    lastX.current = clientX;
    velocity.current = velocity.current * 0.6 + delta * 0.4;
    dragDistance.current += Math.abs(delta);
    rot.angle += delta * 0.35;
    render();
  };

  const pointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    suppressClick.current = dragDistance.current > 8;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
    setActiveIndex(activeIndexRef.current); // flush after the drag-suppressed updates
    settleFromVelocity();
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  // Wheel to rotate ---------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container || numItems === 0) return undefined;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      spinTween.current?.kill();
      rot.angle -= event.deltaY * 0.25;
      render();
      window.clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(() => spinTo(snapTarget(rot.angle), 0.5), 140);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.clearTimeout(wheelTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numItems]);

  // Pointer parallax tilt (fine pointers only) -----------------------------
  const handleContainerPointerMove = (event: ReactMouseEvent) => {
    if (isDragging.current || prefersReducedMotion()) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    tiltXTo.current?.(nx * 8);
    tiltYTo.current?.(-ny * 6);
  };

  const resetTilt = () => {
    tiltXTo.current?.(0);
    tiltYTo.current?.(0);
  };

  // Keyboard: arrows rotate, Enter/Space opens the active pool --------------
  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (numItems === 0) return;
    const anglePerItem = 360 / numItems;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      spinTo(snapTarget(rot.angle) + anglePerItem, 0.5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      spinTo(snapTarget(rot.angle) - anglePerItem, 0.5);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const pool = pools[activeIndexRef.current];
      if (pool) onSelectPool(pool);
    }
  };

  const handleSelect = (pool: PrizePool) => {
    if (!suppressClick.current) onSelectPool(pool);
  };

  if (pools.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <p className="text-on-surface-variant text-lg">目前沒有獎池，點右上角新增。</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="carousel-container absolute inset-0 z-10"
      style={{ '--card-scale': String(ring.scale), '--ring-radius': ring.radius.toFixed(1) + 'px' } as CSSProperties}
      role="group"
      tabIndex={0}
      aria-label="獎池輪播，使用左右方向鍵切換，Enter 開啟"
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => pointerDown(event.clientX)}
      onMouseMove={(event) => {
        pointerMove(event.clientX);
        handleContainerPointerMove(event);
      }}
      onMouseUp={pointerUp}
      onMouseLeave={() => {
        pointerUp();
        resetTilt();
      }}
      onTouchStart={(event) => pointerDown(event.touches[0]?.clientX ?? 0)}
      onTouchMove={(event) => pointerMove(event.touches[0]?.clientX ?? lastX.current)}
      onTouchEnd={pointerUp}
      onTouchCancel={pointerUp}
    >
      <div ref={carouselRef} className="carousel-wrap">
        {pools.map((pool, index) => (
          <div
            key={pool.id}
            ref={(element) => {
              itemsRef.current[index] = element;
            }}
            className="carousel-item"
          >
            <DeckStack pool={pool} onClick={handleSelect} />
          </div>
        ))}
      </div>

      {pools[activeIndex] && !isPresetPool(pools[activeIndex].id) && (
        <button
          type="button"
          className="carousel-active-edit"
          onClick={() => onEditPool(pools[activeIndex])}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          aria-label={`編輯 ${pools[activeIndex].title}`}
          title="編輯目前獎池"
        >
          <Pencil size={18} />
          <span>編輯</span>
        </button>
      )}
    </div>
  );
}
