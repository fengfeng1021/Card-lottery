import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PrizePool, PrizeItem } from './types';
import ParticleBackground from './components/ParticleBackground';
import Carousel from './components/Carousel';
import CreatePoolModal from './components/CreatePoolModal';
import DrawModal from './components/DrawModal';
import MarqueeEdges from './components/MarqueeEdges';
import WinnerReveal from './components/WinnerReveal';

const DEFAULT_POOLS: PrizePool[] = [
  {
    id: '1',
    title: '年終尾牙大獎',
    color: '#00fbfb',
    gradientTo: '#fe00fe',
    items: [
      { id: '1-1', name: 'iPhone 15' },
      { id: '1-2', name: 'MacBook Air' },
      { id: '1-3', name: '現金 100000' }
    ]
  },
  {
    id: '2',
    title: '行銷活動抽獎',
    color: '#ffabf3',
    gradientTo: '#e9ddff',
    items: [
      { id: '2-1', name: '禮券 500' },
      { id: '2-2', name: '神秘禮盒' }
    ]
  },
  {
    id: '3',
    title: '內部績效抽獎',
    color: '#e9ddff',
    gradientTo: '#3a4a49',
    items: [
      { id: '3-1', name: '帶薪休假一天' },
      { id: '3-2', name: '咖啡兌換券' }
    ]
  },
  {
    id: '4',
    title: '粉絲專頁回饋',
    color: '#007070',
    gradientTo: '#00dddd',
    items: [
      { id: '4-1', name: '限量潮T' },
      { id: '4-2', name: '馬克杯' }
    ]
  },
  {
    id: '5',
    title: '隨機驚喜包',
    color: '#fe00fe',
    gradientTo: '#380038',
    items: [
      { id: '5-1', name: '衛生紙一串' },
      { id: '5-2', name: '100 Credits' }
    ]
  }
];

export default function App() {
  const [pools, setPools] = useState<PrizePool[]>(DEFAULT_POOLS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Draw State
  const [selectedPool, setSelectedPool] = useState<PrizePool | null>(null);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  
  // Marquee State
  const [marqueeActive, setMarqueeActive] = useState(false);
  const [marqueePaused, setMarqueePaused] = useState(false);

  const handleCreatePool = (newPool: PrizePool) => {
    setPools([...pools, newPool]);
  };

  const handleSelectPool = (pool: PrizePool) => {
    setSelectedPool(pool);
    setIsDrawModalOpen(true);
    setMarqueeActive(true);
    setMarqueePaused(false);
  };

  const closeDrawModal = () => {
    setIsDrawModalOpen(false);
    setMarqueeActive(false);
    setTimeout(() => {
      setSelectedPool(null);
    }, 300);
  };

  const executeDraw = () => {
    if (!selectedPool || selectedPool.items.length === 0) return;
    
    // Pick winner
    const items = selectedPool.items;
    const winner = items[Math.floor(Math.random() * items.length)];
    setWinnerName(winner.name);

    // Coordinate animations
    setMarqueePaused(true);
    setIsDrawModalOpen(false); // Hide the modal content immediately
    setIsDrawing(true); // Trigger reveal
  };

  const closeWinner = () => {
    setIsDrawing(false);
    setMarqueeActive(false);
    setSelectedPool(null);
  };

  const executeDrawAgain = () => {
    setIsDrawing(false);
    setTimeout(() => {
      executeDraw();
    }, 500); // Wait for card to shrink before drawing again
  };

  return (
    <div className="bg-black text-white font-body-md antialiased min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />
      
      <MarqueeEdges 
        active={marqueeActive} 
        paused={marqueePaused} 
        items={selectedPool?.items || []} 
      />

      <div className="w-full h-screen flex flex-col relative z-20">
        <header className="bg-transparent fixed top-0 w-full flex justify-end items-center px-4 md:px-6 py-4 z-50 pointer-events-none">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="text-white pointer-events-auto hover:text-primary-fixed hover:scale-110 hover:rotate-90 transition-all duration-300 ease-out active:scale-95 flex items-center justify-center p-2 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </header>

        <main className="flex-grow w-full max-w-[100vw] relative">
          <Carousel pools={pools} onSelectPool={handleSelectPool} />
        </main>
      </div>

      <CreatePoolModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreatePool} 
      />

      <DrawModal 
        isOpen={isDrawModalOpen && !isDrawing} 
        pool={selectedPool}
        onClose={closeDrawModal}
        onDraw={executeDraw}
      />

      <WinnerReveal 
        isOpen={isDrawing}
        winnerName={winnerName}
        onClose={closeWinner}
        onDrawAgain={executeDrawAgain}
      />
    </div>
  );
}
