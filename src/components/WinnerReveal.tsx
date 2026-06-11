import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { PrizePool } from '../types';

interface WinnerRevealProps {
  isOpen: boolean;
  pool: PrizePool | null;
  winnerName: string;
  onClose: () => void;
  onDrawAgain: () => void;
}

type RevealPhase = 'shuffling' | 'revealed';

const shuffleCards = [
  { x: -110, rotate: -13, delay: 0 },
  { x: -55, rotate: -7, delay: 0.05 },
  { x: 0, rotate: 0, delay: 0.1 },
  { x: 55, rotate: 7, delay: 0.15 },
  { x: 110, rotate: 13, delay: 0.2 },
];

export default function WinnerReveal({
  isOpen,
  pool,
  winnerName,
  onClose,
  onDrawAgain,
}: WinnerRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>('shuffling');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      setPhase('shuffling');
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase('revealed');
    }, reduceMotion ? 150 : 1450);

    return () => window.clearTimeout(timer);
  }, [isOpen, reduceMotion]);

  const primaryColor = pool?.color ?? '#00fbfb';
  const secondaryColor = pool?.gradientTo ?? '#fe00fe';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/90 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${primaryColor}24 0%, ${secondaryColor}12 30%, transparent 68%)`,
            }}
            animate={reduceMotion ? undefined : { scale: [0.8, 1.12, 1], opacity: [0.45, 1, 0.7] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          <AnimatePresence mode="wait">
            {phase === 'shuffling' ? (
              <motion.div
                key="shuffle"
                className="relative flex h-[420px] w-full max-w-xl items-center justify-center"
                exit={{ scale: 1.45, opacity: 0, filter: 'blur(14px)' }}
                transition={{ duration: 0.28, ease: 'easeIn' }}
              >
                <motion.p
                  className="absolute top-4 font-label-md text-sm font-bold tracking-[0.38em] text-white/70 md:text-base"
                  animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  正在抽取
                </motion.p>

                {shuffleCards.map((card, index) => (
                  <motion.div
                    key={index}
                    className="shuffle-card absolute"
                    style={{
                      borderColor: `${primaryColor}99`,
                      background: `linear-gradient(145deg, ${primaryColor}35, #090909 48%, ${secondaryColor}30)`,
                    }}
                    initial={{ x: 0, y: 40, rotate: 0, scale: 0.82, opacity: 0 }}
                    animate={
                      reduceMotion
                        ? { x: card.x * 0.45, y: 0, rotate: card.rotate, scale: 1, opacity: 1 }
                        : {
                            x: [0, card.x, card.x * -0.38, card.x],
                            y: [36, 0, index % 2 ? -18 : 14, 0],
                            rotate: [0, card.rotate, card.rotate * -0.55, card.rotate],
                            scale: [0.82, 1, 1.04, 1],
                            opacity: 1,
                          }
                    }
                    transition={{
                      duration: 0.85,
                      delay: card.delay,
                      repeat: reduceMotion ? 0 : Infinity,
                      repeatType: 'mirror',
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="shuffle-card__inner" style={{ borderColor: `${secondaryColor}70` }}>
                      <Sparkles size={28} style={{ color: primaryColor }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="winner"
                className="winner-stage relative z-10 flex w-full max-w-4xl items-center justify-center"
                initial={{ scale: 0.35, opacity: 0, rotateY: 86 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18, mass: 0.9 }}
              >
                <motion.div
                  className="winner-burst absolute h-[min(78vw,620px)] w-[min(78vw,620px)] rounded-full"
                  style={{ borderColor: primaryColor }}
                  initial={{ scale: 0.15, opacity: 1 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />

                <div
                  className="winner-card-new relative flex min-h-[520px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 px-6 py-10 text-center md:min-h-[620px] md:px-12"
                  style={{
                    borderColor: primaryColor,
                    background: `linear-gradient(145deg, ${primaryColor}18, #080808 38%, #080808 65%, ${secondaryColor}1f)`,
                    boxShadow: `0 0 70px ${primaryColor}40, inset 0 0 50px ${secondaryColor}12`,
                  }}
                >
                  <div className="winner-card-grid absolute inset-0 opacity-25" />
                  <motion.div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, ${secondaryColor}, transparent)` }}
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.25, repeat: Infinity, repeatDelay: 1.4 }}
                  />

                  <motion.div
                    className="relative z-10 mb-6 flex items-center gap-3 text-sm font-bold tracking-[0.35em] md:text-lg"
                    style={{ color: secondaryColor }}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Sparkles size={20} />
                    恭喜中獎
                    <Sparkles size={20} />
                  </motion.div>

                  <motion.div
                    className="winner-text-style-new relative z-10 max-w-3xl break-words text-white"
                    initial={{ y: 30, opacity: 0, filter: 'blur(12px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {winnerName}
                  </motion.div>

                  <motion.p
                    className="relative z-10 mt-5 max-w-md truncate text-sm text-white/45 md:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                  >
                    {pool?.title}
                  </motion.p>

                  <motion.div
                    className="relative z-10 mt-10 flex flex-col gap-3 sm:flex-row md:mt-14"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.62 }}
                  >
                    <button
                      onClick={onClose}
                      className="winner-action-button"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      確認
                    </button>
                    <button
                      onClick={onDrawAgain}
                      className="winner-action-button"
                      style={{ borderColor: secondaryColor, color: secondaryColor }}
                    >
                      再抽一次
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
