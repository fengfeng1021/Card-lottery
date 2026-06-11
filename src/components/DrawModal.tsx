import { motion, AnimatePresence } from 'motion/react';
import { Gift, X } from 'lucide-react';
import { PrizePool } from '../types';

interface DrawModalProps {
  isOpen: boolean;
  pool: PrizePool | null;
  onClose: () => void;
  onDraw: () => void;
}

export default function DrawModal({ isOpen, pool, onClose, onDraw }: DrawModalProps) {
  if (!pool) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-screen fixed inset-0 z-[100] flex items-center justify-center modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            className="draw-modal bg-[#1E1E1E] border border-secondary-container/50 rounded-xl w-full max-w-sm p-6 shadow-[0_0_30px_rgba(255,0,255,0.15)] relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2 min-w-0">
                <Gift className="text-secondary shrink-0" size={24} />
                <h3 className="font-headline-md text-2xl text-white truncate">{pool.title}</h3>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors" aria-label="關閉">
                <X size={24} />
              </button>
            </div>

            <div className="flex justify-center relative z-10 py-4">
              <button
                onClick={onDraw}
                className="draw-button relative group w-full py-6 bg-transparent overflow-hidden rounded-lg border-2 border-primary-fixed cursor-pointer"
              >
                <div className="absolute inset-0 bg-primary-fixed transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0" />
                <div className="draw-button__shine absolute inset-y-0 w-1/3 -skew-x-12 bg-white/35" />
                <span className="relative z-10 font-display-lg font-bold text-2xl text-primary-fixed group-hover:text-black transition-colors duration-300 tracking-widest uppercase">
                  立即抽獎
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-opacity duration-300 pointer-events-none z-[-1]" />
              </button>
            </div>

            <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-secondary-container/10 blur-[80px] rounded-full pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
