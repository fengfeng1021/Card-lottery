import { useId } from 'react';
import { Gift, RotateCcw, Repeat, X } from 'lucide-react';
import { PrizePool } from '../types';
import Modal from './Modal';

interface DrawModalProps {
  isOpen: boolean;
  pool: PrizePool | null;
  /** Ids already won for this pool (only relevant when the pool disallows repeats). */
  drawnItemIds: string[];
  onClose: () => void;
  onDraw: () => void;
  onToggleRepeat: (allowRepeat: boolean) => void;
  onResetDrawn: () => void;
  onResetAndDraw: () => void;
}

export default function DrawModal({
  isOpen,
  pool,
  drawnItemIds,
  onClose,
  onDraw,
  onToggleRepeat,
  onResetDrawn,
  onResetAndDraw,
}: DrawModalProps) {
  const titleId = useId();

  if (!pool) return null;

  const drawn = new Set(drawnItemIds);
  const remaining = pool.allowRepeat
    ? pool.items.length
    : pool.items.filter((item) => !drawn.has(item.id)).length;
  const exhausted = !pool.allowRepeat && remaining === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledById={titleId}
      panelClassName="draw-modal-panel"
      screenClassName="draw-modal-screen"
    >
      <div className="draw-modal bg-[#141414] border border-secondary-container/50 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(255,0,255,0.18)] relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Gift className="text-secondary shrink-0" size={24} />
            <h3 id={titleId} className="font-headline-md text-2xl text-white truncate">
              {pool.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors"
            aria-label="關閉"
          >
            <X size={24} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleRepeat(!pool.allowRepeat)}
          className="draw-repeat-toggle relative z-10"
          aria-pressed={pool.allowRepeat}
          title="切換是否可重複中獎"
        >
          <span className="flex items-center gap-2">
            <Repeat size={16} className={pool.allowRepeat ? 'text-primary-fixed' : 'text-on-surface-variant'} />
            <span className="text-sm text-white">
              {pool.allowRepeat ? '可重複中獎' : '不可重複中獎'}
            </span>
          </span>
          <span className={`draw-repeat-switch ${pool.allowRepeat ? 'is-on' : ''}`} aria-hidden="true">
            <span className="draw-repeat-knob" />
          </span>
        </button>

        {!pool.allowRepeat && (
          <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant relative z-10">
            <span>
              剩餘 <span className="text-primary-fixed font-bold">{remaining}</span> / {pool.items.length} 項
            </span>
            {drawn.size > 0 && (
              <button
                type="button"
                onClick={onResetDrawn}
                className="inline-flex items-center gap-1 text-secondary hover:text-secondary-container transition-colors"
              >
                <RotateCcw size={13} /> 重置已抽
              </button>
            )}
          </div>
        )}

        <div className="flex justify-center relative z-10 py-4 mt-3">
          {exhausted ? (
            <div className="w-full text-center">
              <p className="text-on-surface-variant mb-4">本獎池已全部抽完。</p>
              <button
                onClick={onResetAndDraw}
                className="inline-flex items-center gap-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-black font-bold py-3 px-6 rounded-lg transition-all active:scale-[0.98]"
              >
                <RotateCcw size={18} /> 重置後再抽
              </button>
            </div>
          ) : (
            <button
              onClick={onDraw}
              className="draw-button relative group w-full py-6 bg-transparent overflow-hidden rounded-xl border-2 border-primary-fixed cursor-pointer"
            >
              <div className="absolute inset-0 bg-primary-fixed transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />
              <div className="draw-button__shine absolute inset-y-0 w-1/3 -skew-x-12 bg-white/35" />
              <span className="relative z-10 font-display-lg font-bold text-2xl text-primary-fixed group-hover:text-black transition-colors duration-300 tracking-widest uppercase">
                立即抽獎
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-opacity duration-300 pointer-events-none z-[-1]" />
            </button>
          )}
        </div>

        <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-secondary-container/10 blur-[80px] rounded-full pointer-events-none" />
      </div>
    </Modal>
  );
}
