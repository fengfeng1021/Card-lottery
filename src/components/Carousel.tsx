import { useEffect, useRef, useState } from 'react';
import { PrizePool } from '../types';
import DeckStack from './DeckStack';

interface CarouselProps {
  pools: PrizePool[];
  onSelectPool: (pool: PrizePool) => void;
}

export default function Carousel({ pools, onSelectPool }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const currentAngle = useRef(0);
  const targetAngle = useRef(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const animationFrameId = useRef<number>(0);
  const wheelTimeout = useRef<number>(0);

  const numItems = pools.length;

  const calculateRadius = () => {
    let r = (window.innerWidth * 0.85) / 2;
    return r < 300 ? 300 : r;
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
    const snappedAngle = Math.round(targetAngle.current / anglePerItem) * anglePerItem;
    targetAngle.current = snappedAngle;
  };

  useEffect(() => {
    if (numItems === 0) return;

    const updateCarousel = () => {
      const velocity = (targetAngle.current - currentAngle.current) * 0.1;
      currentAngle.current += velocity;

      if (carouselRef.current) {
        carouselRef.current.style.transform = `translateZ(${-radius}px) rotateY(${currentAngle.current}deg)`;
      }

      const absVel = Math.abs(velocity);
      const stretchFactor = Math.max(0.5, 1 - (absVel / 15));

      itemsRef.current.forEach((item, index) => {
        if (!item) return;
        const itemAngle = index * (360 / numItems);
        item.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
        
        const deck = item.querySelector('.deck-stack') as HTMLElement;
        if (deck) {
          deck.style.setProperty('--thickness-scale', stretchFactor.toString());
        }
      });

      animationFrameId.current = requestAnimationFrame(updateCarousel);
    };

    updateCarousel();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [numItems, radius]);

  // Event Handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetAngle.current += e.deltaY * 0.2;
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = window.setTimeout(snapToClosest, 150);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [numItems]);

  const handlePointerDown = (clientX: number) => {
    isDragging.current = true;
    lastX.current = clientX;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - lastX.current;
    targetAngle.current -= delta * 0.5;
    lastX.current = clientX;
  };

  const handlePointerUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      if (containerRef.current) containerRef.current.style.cursor = 'default';
      snapToClosest();
    }
  };

  return (
    <div
      ref={containerRef}
      className="carousel-container absolute inset-0 z-10"
      onMouseDown={(e) => handlePointerDown(e.clientX)}
      onMouseMove={(e) => handlePointerMove(e.clientX)}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
      onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
      onTouchEnd={handlePointerUp}
    >
      <div ref={carouselRef} className="carousel-wrap">
        {pools.map((pool, index) => (
          <div
            key={pool.id}
            ref={(el) => (itemsRef.current[index] = el)}
            className="carousel-item"
          >
            <DeckStack 
              pool={pool} 
              onClick={() => {
                // Prevent click if we were dragging fast
                const velocity = (targetAngle.current - currentAngle.current) * 0.1;
                if (Math.abs(velocity) < 1 && !isDragging.current) {
                  onSelectPool(pool);
                }
              }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
