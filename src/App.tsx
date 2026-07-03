import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, History, List, Plus } from 'lucide-react';
import { DrawRecord, PrizeItem, PrizePool } from './types';
import ParticleBackground from './components/ParticleBackground';
import Carousel from './components/Carousel';
import PoolList from './components/PoolList';
import CreatePoolModal from './components/CreatePoolModal';
import DrawModal from './components/DrawModal';
import MarqueeEdges from './components/MarqueeEdges';
import WinnerReveal from './components/WinnerReveal';
import HistoryModal from './components/HistoryModal';
import { loadDrawRecords, loadPrizePools, saveDrawRecords, savePrizePools } from './storage';
import { generateId } from './lib/id';

type ViewMode = 'carousel' | 'list';

const pickWinner = (pool: PrizePool, excludedIds: Set<string>): PrizeItem | null => {
  const available = pool.items.filter((item) => !excludedIds.has(item.id));
  if (available.length === 0) return null;

  const weightedItems = available.filter(
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

  return available[Math.floor(Math.random() * available.length)];
};

const drawnIdsForPool = (pool: PrizePool | null): Set<string> => {
  if (!pool || pool.allowRepeat) return new Set();
  return new Set(pool.drawnItemIds ?? []);
};

export default function App() {
  const [pools, setPools] = useState<PrizePool[]>(loadPrizePools);
  const [records, setRecords] = useState<DrawRecord[]>(loadDrawRecords);
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<PrizePool | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [drawNonce, setDrawNonce] = useState(0);

  const [marqueeActive, setMarqueeActive] = useState(false);

  // Deferred reset of the selected pool after the draw modal's exit animation; tracked so a fast re-select can cancel it.
  const clearSelectionTimer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(clearSelectionTimer.current), []);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  const drawnItemIds = useMemo(() => Array.from(drawnIdsForPool(selectedPool)), [selectedPool]);

  const canDrawAgain = useMemo(() => {
    if (!selectedPool) return false;
    if (selectedPool.allowRepeat) return true;
    const drawn = drawnIdsForPool(selectedPool);
    return selectedPool.items.some((item) => !drawn.has(item.id));
  }, [selectedPool]);

  useEffect(() => {
    savePrizePools(pools);
  }, [pools]);

  useEffect(() => {
    saveDrawRecords(records);
  }, [records]);

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

  const handleToggleRepeat = (allowRepeat: boolean) => {
    if (!selectedPoolId) return;
    setPools((currentPools) =>
      currentPools.map((pool) =>
        pool.id === selectedPoolId
          ? {
              ...pool,
              allowRepeat,
              // Enabling "no repeats" starts fresh so past wins don't retroactively block.
              drawnItemIds: allowRepeat ? pool.drawnItemIds : [],
            }
          : pool,
      ),
    );
  };

  const markDrawn = (poolId: string, itemId: string) => {
    setPools((currentPools) =>
      currentPools.map((pool) =>
        pool.id === poolId
          ? { ...pool, drawnItemIds: [...(pool.drawnItemIds ?? []), itemId] }
          : pool,
      ),
    );
  };

  const handleResetDrawn = () => {
    if (!selectedPoolId) return;
    // History (records) stays intact; only the per-pool drawn set is cleared.
    setPools((currentPools) =>
      currentPools.map((pool) =>
        pool.id === selectedPoolId ? { ...pool, drawnItemIds: [] } : pool,
      ),
    );
  };

  const handleSelectPool = (pool: PrizePool) => {
    window.clearTimeout(clearSelectionTimer.current);
    setSelectedPoolId(pool.id);
    setIsDrawModalOpen(true);
    setMarqueeActive(true);
  };

  const closeDrawModal = () => {
    setIsDrawModalOpen(false);
    setMarqueeActive(false);
    window.clearTimeout(clearSelectionTimer.current);
    // Keep the pool data alive through the modal's exit animation, then clear it.
    clearSelectionTimer.current = window.setTimeout(() => setSelectedPoolId(null), 360);
  };

  const commitDraw = (pool: PrizePool, excluded: Set<string>) => {
    const winner = pickWinner(pool, excluded);
    if (!winner) return;

    const record: DrawRecord = {
      id: generateId(),
      poolId: pool.id,
      poolTitle: pool.title,
      itemId: winner.id,
      itemName: winner.name,
      timestamp: Date.now(),
      color: pool.color,
      gradientTo: pool.gradientTo,
    };

    setRecords((current) => [record, ...current]);
    if (!pool.allowRepeat) markDrawn(pool.id, winner.id);

    setWinnerName(winner.name);
    setDrawNonce((nonce) => nonce + 1);
    setIsDrawModalOpen(false);
    setIsDrawing(true);
    setMarqueeActive(true);
  };

  const executeDraw = () => {
    window.clearTimeout(clearSelectionTimer.current);
    const pool = pools.find((candidate) => candidate.id === selectedPoolId);
    if (!pool || pool.items.length === 0) return;
    commitDraw(pool, drawnIdsForPool(pool));
  };

  const handleResetAndDraw = () => {
    window.clearTimeout(clearSelectionTimer.current);
    const pool = pools.find((candidate) => candidate.id === selectedPoolId);
    if (!pool || pool.items.length === 0) return;
    // Clear the drawn set first, then draw against a fresh (empty) exclusion in one action.
    setPools((currentPools) =>
      currentPools.map((current) =>
        current.id === pool.id ? { ...current, drawnItemIds: [] } : current,
      ),
    );
    commitDraw({ ...pool, drawnItemIds: [] }, new Set());
  };

  const closeWinner = () => {
    window.clearTimeout(clearSelectionTimer.current);
    setIsDrawing(false);
    setMarqueeActive(false);
    // Defer clearing so WinnerReveal keeps its pool colours/title through the exit fade.
    clearSelectionTimer.current = window.setTimeout(() => setSelectedPoolId(null), 360);
  };

  const executeDrawAgain = () => {
    executeDraw();
  };

  const handleClearHistory = () => setRecords([]);
  const handleDeleteRecord = (id: string) =>
    setRecords((current) => current.filter((record) => record.id !== id));

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

          <div className="pointer-events-auto flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              aria-label="抽獎記錄"
              title="抽獎記錄"
              className="header-icon-button relative"
            >
              <History size={26} strokeWidth={2.2} />
              {records.length > 0 && (
                <span className="header-badge">{records.length > 99 ? '99+' : records.length}</span>
              )}
            </button>
            <button
              onClick={openCreatePool}
              aria-label="新增獎池"
              title="新增獎池"
              className="header-icon-button header-icon-button--add"
            >
              <Plus size={30} strokeWidth={2.5} />
            </button>
          </div>
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

      <DrawModal
        isOpen={isDrawModalOpen && !isDrawing}
        pool={selectedPool}
        drawnItemIds={drawnItemIds}
        onClose={closeDrawModal}
        onDraw={executeDraw}
        onToggleRepeat={handleToggleRepeat}
        onResetDrawn={handleResetDrawn}
        onResetAndDraw={handleResetAndDraw}
      />

      <WinnerReveal
        isOpen={isDrawing}
        pool={selectedPool}
        winnerName={winnerName}
        drawNonce={drawNonce}
        canDrawAgain={canDrawAgain}
        onClose={closeWinner}
        onDrawAgain={executeDrawAgain}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        records={records}
        onClose={() => setIsHistoryOpen(false)}
        onClearAll={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
}
