import { useEffect, useRef, useState } from 'react';
import { PrizePool } from '../types';
import DeckStack from './DeckStack';

interface CarouselProps {
  pools: PrizePool[];
  onSelectPool: (pool: PrizePool) => void;
  onEditPool: (pool: PrizePool) => void;
}

const getWrappedIndex = (index: number, total: number) => ((index % total) + total) % total;

export default function Carousel({ pools, onSelectPool, onEditPool }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const currentAngle = useRef(0);
  const targetAngle = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const dragDistance = useRef(0);
  const suppressClick = useRef(false);
  const animationFrameId = useRef<number>(0);
  const wheelTimeout = useRef<number>(0);

  const numItems = pools.length;

  const calculateRadius = () => {
    const radius = (window.innerWidth * 0.85) / 2;
    return Math.max(300, radius);
  };

  const [radius, setRadius] = useState(300);

  useEffect(() => {
    const handleResize = () => setRadius(calculateRadius());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const snapToClosest = () => {
    const anglePerItem = 360 / Math.max(1, numItems);
    targetAngle.current = Math.round(targetAngle.current / anglePerItem) * anglePerItem;
  };

  useEffect(() => {
    if (numItems === 0) return undefined;

    const updateCarousel = () => {
      const velocity = (targetAngle.current - currentAngle.current) * 0.12;
      currentAngle.current += velocity;

      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateZ(${-radius}px) rotateY(${currentAngle.current}deg)`;
      }

      const anglePerItem = 360 / numItems;
      const activeIndex = getWrappedIndex(Math.round(-currentAngle.current / anglePerItem), numItems);
      const stretchFactor = Math.max(0.6, 1 - Math.abs(velocity) / 16);

      itemsRef.current.forEach((item, index) => {
        if (!item) return;

        const itemAngle = index * anglePerItem;
        item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;

        const deck = item.querySelector('.deck-stack') as HTMLElement | null;
        if (deck) {
          deck.style.setProperty('--thickness-scale', stretchFactor.toString());
          deck.classList.toggle('is-selected', index === activeIndex && Math.abs(velocity) < 0.9);
        }
      });

      animationFrameId.current = requestAnimationFrame(updateCarousel);
    };

    updateCarousel();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [numItems, radius]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetAngle.current -= event.deltaY * 0.2;
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(snapToClosest, 150);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout.current);
    };
  }, [numItems]);

  const handlePointerDown = (clientX: number) => {
    isDragging.current = true;
    suppressClick.current = false;
    dragDistance.current = 0;
    lastX.current = clientX;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current) return;

    const delta = clientX - lastX.current;
    targetAngle.current += delta * 0.5;
    dragDistance.current += Math.abs(delta);
    lastX.current = clientX;
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    suppressClick.current = dragDistance.current > 8;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
    snapToClosest();

    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };

  const handleSelect = (pool: PrizePool) => {
    const velocity = Math.abs((targetAngle.current - currentAngle.current) * 0.12);
    if (!suppressClick.current && velocity < 8) {
      onSelectPool(pool);
    }
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
      onMouseDown={(event) => handlePointerDown(event.clientX)}
      onMouseMove={(event) => handlePointerMove(event.clientX)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={(event) => handlePointerDown(event.touches[0].clientX)}
      onTouchMove={(event) => handlePointerMove(event.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
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
            <DeckStack pool={pool} onClick={handleSelect} onEdit={onEditPool} />
          </div>
        ))}
      </div>
    </div>
  );
}
