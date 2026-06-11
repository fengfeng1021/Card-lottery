import { useEffect, useMemo, useState } from 'react';
import { Box, List, Plus } from 'lucide-react';
import { PrizePool } from './types';
import ParticleBackground from './components/ParticleBackground';
import Carousel from './components/Carousel';
import PoolList from './components/PoolList';
import CreatePoolModal from './components/CreatePoolModal';
import DrawModal from './components/DrawModal';
import MarqueeEdges from './components/MarqueeEdges';
import WinnerReveal from './components/WinnerReveal';
import { loadPrizePools, savePrizePools } from './storage';

type ViewMode = 'carousel' | 'list';

const pickWinner = (pool: PrizePool) => {
  const weightedItems = pool.items.filter(
    (item) => typeof item.probability === 'number' && item.probability > 0,
  );

  if (weightedItems.length) {
    const totalWeight = weightedItems.reduce((sum, item) => sum + (item.probability ?? 0), 0);
    let cursor = Math.random() * totalWeight;

    for (const item of weightedItems) {
      cursor -= item.probability ?? 0;
      if (cursor <= 0) return item;
    }

    return weightedItems[weightedItems.length - 1];
  }

  return pool.items[Math.floor(Math.random() * pool.items.length)];
};

export default function App() {
  const [pools, setPools] = useState<PrizePool[]>(loadPrizePools);
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<PrizePool | null>(null);

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerName, setWinnerName] = useState('');

  const [marqueeActive, setMarqueeActive] = useState(false);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  useEffect(() => {
    savePrizePools(pools);
  }, [pools]);

  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventZoomWheel = (event: WheelEvent) => {
      if (event.ctrlKey) event.preventDefault();
    };
    const preventZoomKeys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)) {
        event.preventDefault();
      }
    };
    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    const preventGesture = (event: Event) => event.preventDefault();

    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    document.addEventListener('touchmove', preventMultiTouch, { passive: false });
    window.addEventListener('wheel', preventZoomWheel, { passive: false });
    window.addEventListener('keydown', preventZoomKeys);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('touchmove', preventMultiTouch);
      window.removeEventListener('wheel', preventZoomWheel);
      window.removeEventListener('keydown', preventZoomKeys);
    };
  }, []);

  const openCreatePool = () => {
    setEditingPool(null);
    setIsPoolModalOpen(true);
  };

  const openEditPool = (pool: PrizePool) => {
    setEditingPool(pool);
    setIsPoolModalOpen(true);
  };

  const handleSavePool = (pool: PrizePool) => {
    setPools((currentPools) => {
      const existingIndex = currentPools.findIndex((currentPool) => currentPool.id === pool.id);
      if (existingIndex === -1) return [...currentPools, pool];

      return currentPools.map((currentPool) => (currentPool.id === pool.id ? pool : currentPool));
    });
  };

  const handleDeletePool = (poolId: string) => {
    setPools((currentPools) => currentPools.filter((pool) => pool.id !== poolId));

    if (selectedPoolId === poolId) {
      setSelectedPoolId(null);
      setIsDrawModalOpen(false);
      setIsDrawing(false);
      setMarqueeActive(false);
    }
  };

  const handleSelectPool = (pool: PrizePool) => {
    setSelectedPoolId(pool.id);
    setIsDrawModalOpen(true);
    setMarqueeActive(true);
  };

  const closeDrawModal = () => {
    setIsDrawModalOpen(false);
    setMarqueeActive(false);
    window.setTimeout(() => {
      setSelectedPoolId(null);
    }, 300);
  };

  const executeDraw = () => {
    if (!selectedPool || selectedPool.items.length === 0) return;

    const winner = pickWinner(selectedPool);
    setWinnerName(winner.name);
    setIsDrawModalOpen(false);
    setIsDrawing(true);
  };

  const closeWinner = () => {
    setIsDrawing(false);
    setMarqueeActive(false);
    setSelectedPoolId(null);
  };

  const executeDrawAgain = () => {
    setIsDrawing(false);
    window.setTimeout(() => {
      executeDraw();
    }, 350);
  };

  return (
    <div className="app-shell bg-black text-white font-body-md antialiased flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      <MarqueeEdges active={marqueeActive} items={selectedPool?.items || []} />

      <div className="app-viewport w-full flex flex-col relative z-20">
        <header className="app-header bg-transparent fixed top-0 w-full flex justify-between items-center z-50 pointer-events-none">
          <div
            className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/65 p-1 shadow-lg backdrop-blur-xl"
            role="group"
            aria-label="顯示模式"
          >
            <button
              onClick={() => setViewMode('carousel')}
              aria-pressed={viewMode === 'carousel'}
              className={`view-mode-button ${viewMode === 'carousel' ? 'is-active' : ''}`}
              title="3D 卡組模式"
            >
              <Box size={18} />
              <span>3D</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`view-mode-button ${viewMode === 'list' ? 'is-active' : ''}`}
              title="列表模式"
            >
              <List size={18} />
              <span>列表</span>
            </button>
          </div>

          <button
            onClick={openCreatePool}
            aria-label="新增獎池"
            title="新增獎池"
            className="text-white pointer-events-auto hover:text-primary-fixed hover:scale-110 hover:rotate-90 transition-all duration-300 ease-out active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-grow w-full max-w-[100vw] relative">
          {viewMode === 'carousel' ? (
            <Carousel pools={pools} onSelectPool={handleSelectPool} onEditPool={openEditPool} />
          ) : (
            <PoolList pools={pools} onSelectPool={handleSelectPool} onEditPool={openEditPool} />
          )}
        </main>
      </div>

      <CreatePoolModal
        isOpen={isPoolModalOpen}
        editingPool={editingPool}
        onClose={() => setIsPoolModalOpen(false)}
        onSave={handleSavePool}
        onDelete={handleDeletePool}
      />

      <DrawModal isOpen={isDrawModalOpen && !isDrawing} pool={selectedPool} onClose={closeDrawModal} onDraw={executeDraw} />

      <WinnerReveal
        isOpen={isDrawing}
        pool={selectedPool}
        winnerName={winnerName}
        onClose={closeWinner}
        onDrawAgain={executeDrawAgain}
      />
    </div>
  );
}
