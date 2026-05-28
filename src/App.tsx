import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PrizePool } from './types';
import ParticleBackground from './components/ParticleBackground';
import Carousel from './components/Carousel';
import CreatePoolModal from './components/CreatePoolModal';
import DrawModal from './components/DrawModal';
import MarqueeEdges from './components/MarqueeEdges';
import WinnerReveal from './components/WinnerReveal';
import { loadPrizePools, savePrizePools } from './storage';

const DEFAULT_POOLS: PrizePool[] = [
  {
    id: '1',
    title: '年終尾牙大獎',
    color: '#00fbfb',
    gradientTo: '#fe00fe',
    items: [
      { id: '1-1', name: 'iPhone 15' },
      { id: '1-2', name: 'MacBook Air' },
      { id: '1-3', name: '現金 100000' },
    ],
  },
  {
    id: '2',
    title: '行銷活動抽獎',
    color: '#ffabf3',
    gradientTo: '#e9ddff',
    items: [
      { id: '2-1', name: '禮券 500' },
      { id: '2-2', name: '神秘禮盒' },
    ],
  },
  {
    id: '3',
    title: '內部績效抽獎',
    color: '#e9ddff',
    gradientTo: '#3a4a49',
    items: [
      { id: '3-1', name: '帶薪休假一天' },
      { id: '3-2', name: '咖啡兌換券' },
    ],
  },
];

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
  const [pools, setPools] = useState<PrizePool[]>(() => loadPrizePools(DEFAULT_POOLS));
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<PrizePool | null>(null);

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerName, setWinnerName] = useState('');

  const [marqueeActive, setMarqueeActive] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  useEffect(() => {
    savePrizePools(pools);
  }, [pools]);

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
    setMarqueePaused(false);
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
    setMarqueePaused(true);
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
    <div className="bg-black text-white font-body-md antialiased min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      <MarqueeEdges active={marqueeActive} paused={marqueePaused} items={selectedPool?.items || []} />

      <div className="w-full h-screen flex flex-col relative z-20">
        <header className="bg-transparent fixed top-0 w-full flex justify-end items-center px-4 md:px-6 py-4 z-50 pointer-events-none">
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
          <Carousel pools={pools} onSelectPool={handleSelectPool} onEditPool={openEditPool} />
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

      <WinnerReveal isOpen={isDrawing} winnerName={winnerName} onClose={closeWinner} onDrawAgain={executeDrawAgain} />
    </div>
  );
}
