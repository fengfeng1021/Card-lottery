import { useEffect, useState } from 'react';

interface WinnerRevealProps {
  isOpen: boolean;
  winnerName: string;
  onClose: () => void;
  onDrawAgain: () => void;
}

export default function WinnerReveal({ isOpen, winnerName, onClose, onDrawAgain }: WinnerRevealProps) {
  const [showCard, setShowCard] = useState(false);
  const [showLines, setShowLines] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowLines(true);
      setShowCard(false);
      
      const timer = setTimeout(() => {
        setShowLines(false);
        setShowCard(true);
      }, 1100);
      
      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
      setShowLines(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* Pull Lines Animation */}
      {showLines && (
        <div className="absolute inset-0 w-full h-full">
          <div className="pull-line pull-top"></div>
          <div className="pull-line pull-bottom"></div>
          <div className="pull-line pull-left"></div>
          <div className="pull-line pull-right"></div>
        </div>
      )}

      {/* Winner Card */}
      <div 
        className={`bg-[#050505] border-4 border-primary-fixed rounded-3xl w-[calc(100vw-32px)] md:w-[calc(100vw-120px)] h-[calc(100vh-120px)] shadow-[0_0_100px_rgba(0,255,255,0.5)] transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 flex flex-col items-center justify-center gap-8 md:gap-12 relative overflow-hidden ${showCard ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.1)_0%,transparent_70%)] pointer-events-none"></div>
        
        <h4 className="font-headline-md text-xl md:text-3xl text-secondary tracking-[0.5em] uppercase z-10 relative mt-8 md:mt-0">
          恭喜中獎
        </h4>
        
        <div className="font-display-lg text-white text-center break-words max-w-5xl text-[3rem] sm:text-[6rem] md:text-[8rem] leading-tight z-10 relative winner-text-style px-4">
          {winnerName}
        </div>
        
        <div className="mt-4 md:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 z-10 relative mb-8 md:mb-0">
          <button 
            onClick={onClose}
            className="pointer-events-auto px-10 py-4 md:px-16 md:py-6 bg-primary-fixed/20 border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed hover:text-black rounded-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-all duration-300 font-headline-md text-xl md:text-3xl tracking-widest cursor-pointer"
          >
            確認
          </button>
          <button 
            onClick={onDrawAgain}
            className="pointer-events-auto px-10 py-4 md:px-16 md:py-6 bg-secondary/20 border-2 border-secondary text-secondary hover:bg-secondary hover:text-black rounded-xl hover:shadow-[0_0_30px_rgba(255,171,243,0.8)] transition-all duration-300 font-headline-md text-xl md:text-3xl tracking-widest cursor-pointer"
          >
            再抽一次
          </button>
        </div>
      </div>
    </div>
  );
}
