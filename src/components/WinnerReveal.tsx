import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { PrizePool } from '../types';
import { gsap, prefersReducedMotion } from '../lib/gsap';

interface WinnerRevealProps {
  isOpen: boolean;
  pool: PrizePool | null;
  winnerName: string;
  /** Increments on every draw so the reveal replays for "再抽一次" without unmounting. */
  drawNonce: number;
  canDrawAgain: boolean;
  onClose: () => void;
  onDrawAgain: () => void;
}

const FAN = [
  { x: -128, rotate: -14 },
  { x: -64, rotate: -7 },
  { x: 0, rotate: 0 },
  { x: 64, rotate: 7 },
  { x: 128, rotate: 14 },
];

export default function WinnerReveal({
  isOpen,
  pool,
  winnerName,
  drawNonce,
  canDrawAgain,
  onClose,
  onDrawAgain,
}: WinnerRevealProps) {
  const [rendered, setRendered] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setRendered(true);
  }, [isOpen]);

  const primaryColor = pool?.color ?? '#00fbfb';
  const secondaryColor = pool?.gradientTo ?? '#fe00fe';

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!rendered || !overlay) return undefined;

    const q = gsap.utils.selector(overlay);
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(overlay);
    gsap.killTweensOf(q('*'));

    const cards = q('.shuffle-card');
    const shuffleStage = q('.shuffle-stage');
    const winnerStage = q('.winner-stage');
    const card = q('.winner-card-new');
    const burst = q('.winner-burst');
    const scanline = q('.winner-scanline');
    const congrats = q('.winner-congrats');
    const nameEl = q('.winner-text-style-new');
    const sub = q('.winner-sub');
    const actions = q('.winner-actions > *');

    if (!isOpen) {
      const tl = gsap.timeline({
        onComplete: () => setRendered(false),
      });
      tl.to(overlay, { autoAlpha: 0, duration: reduce ? 0.12 : 0.28, ease: 'power2.in' });
      return () => tl.kill();
    }

    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(shuffleStage, { autoAlpha: 1 });
    gsap.set(winnerStage, { autoAlpha: 0 });
    // Pre-hide the reveal content so nothing is visible inside the card while it flips in;
    // each element then animates in via its own fromTo below.
    gsap.set([...congrats, ...nameEl, ...sub, ...actions], { autoAlpha: 0 });

    const tl = gsap.timeline();

    if (reduce) {
      tl.set(shuffleStage, { autoAlpha: 0 })
        .set(winnerStage, { autoAlpha: 1 })
        .fromTo(card, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.2 })
        .fromTo(
          [congrats, nameEl, sub, ...actions],
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.04 },
          '<',
        )
        .add(() => {
          (q('.winner-action-button')[0] as HTMLElement | undefined)?.focus?.({ preventScroll: true });
        });
      return () => tl.kill();
    }

    tl.fromTo(
      cards,
      { x: 0, y: 60, scale: 0.7, autoAlpha: 0, rotate: 0 },
      {
        x: (i) => FAN[i].x,
        y: 0,
        scale: 1,
        autoAlpha: 1,
        rotate: (i) => FAN[i].rotate,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.6)',
      },
    )
      .to(
        cards,
        {
          x: (i) => FAN[i].x * -0.42,
          y: (i) => (i % 2 ? -18 : 14),
          rotate: (i) => FAN[i].rotate * -0.5,
          duration: 0.38,
          ease: 'sine.inOut',
          stagger: { each: 0.04, from: 'center' },
        },
        '+=0.03',
      )
      .to(cards, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.92,
        duration: 0.3,
        ease: 'power3.in',
        stagger: 0.025,
      })
      .to(cards, { scale: 1.35, autoAlpha: 0, duration: 0.28, ease: 'power2.in' }, '-=0.1')
      .set(shuffleStage, { autoAlpha: 0 })
      .set(winnerStage, { autoAlpha: 1 })
      .fromTo(
        card,
        { rotateY: 90, scale: 0.42, autoAlpha: 0 },
        { rotateY: 0, scale: 1, autoAlpha: 1, duration: 0.65, ease: 'back.out(1.3)' },
      )
      .fromTo(
        burst,
        { scale: 0.2, autoAlpha: 1 },
        { scale: 1.35, autoAlpha: 0, duration: 0.8, ease: 'power2.out' },
        '<',
      )
      .fromTo(congrats, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35 }, '-=0.35')
      .fromTo(
        nameEl,
        { y: 30, autoAlpha: 0, filter: 'blur(14px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' },
        '-=0.18',
      )
      .fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, '-=0.2')
      .fromTo(
        actions,
        { y: 18, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.06 },
        '-=0.12',
      )
      .add(() => {
        gsap.fromTo(
          scanline,
          { xPercent: -130 },
          { xPercent: 130, duration: 1.4, repeat: -1, repeatDelay: 1.5, ease: 'power1.inOut' },
        );
        (q('.winner-action-button')[0] as HTMLElement | undefined)?.focus?.({ preventScroll: true });
      });

    return () => {
      tl.kill();
      gsap.killTweensOf(scanline);
    };
  }, [isOpen, rendered, drawNonce]);

  // Escape closes the reveal.
  useEffect(() => {
    if (!rendered || !isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [rendered, isOpen, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="winner-screen fixed inset-0 z-[200] grid place-items-center overflow-hidden bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="抽獎結果"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${primaryColor}24 0%, ${secondaryColor}12 30%, transparent 68%)`,
        }}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {isOpen ? `恭喜中獎：${winnerName}` : ''}
      </p>

      <div className="shuffle-stage col-start-1 row-start-1 relative flex w-full max-w-xl items-center justify-center">
        <p className="winner-shuffle-label absolute top-4 font-label-md text-sm font-bold tracking-[0.38em] text-white/70 md:text-base">
          正在抽取
        </p>
        {FAN.map((_, index) => (
          <div
            key={index}
            className="shuffle-card absolute"
            style={{
              borderColor: `${primaryColor}99`,
              background: `linear-gradient(145deg, ${primaryColor}35, #090909 48%, ${secondaryColor}30)`,
            }}
          >
            <div className="shuffle-card__inner" style={{ borderColor: `${secondaryColor}70` }}>
              <Sparkles size={28} style={{ color: primaryColor }} />
            </div>
          </div>
        ))}
      </div>

      <div className="winner-stage col-start-1 row-start-1 relative z-10 flex w-full max-w-4xl items-center justify-center">
        <div
          className="winner-burst pointer-events-none absolute h-[min(78vw,620px)] w-[min(78vw,620px)] rounded-full"
          style={{ borderColor: primaryColor }}
        />

        <div
          className="winner-card-new relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 text-center"
          style={{
            borderColor: primaryColor,
            background: `linear-gradient(145deg, ${primaryColor}18, #080808 38%, #080808 65%, ${secondaryColor}1f)`,
            boxShadow: `0 0 70px ${primaryColor}40, inset 0 0 50px ${secondaryColor}12`,
          }}
        >
          <div className="winner-card-grid absolute inset-0 opacity-25" />
          <div
            className="winner-scanline absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${primaryColor}, ${secondaryColor}, transparent)`,
            }}
          />

          <div
            className="winner-congrats relative z-10 mb-6 flex items-center gap-3 text-sm font-bold tracking-[0.35em] md:text-lg"
            style={{ color: secondaryColor }}
          >
            <Sparkles size={20} />
            恭喜中獎
            <Sparkles size={20} />
          </div>

          <div className="winner-text-style-new relative z-10 max-w-3xl break-words text-white">
            {winnerName}
          </div>

          <p className="winner-sub relative z-10 mt-5 max-w-md truncate text-sm text-white/70 md:text-base">
            {pool?.title}
          </p>

          <div className="winner-actions relative z-10 mt-10 flex flex-col gap-3 sm:flex-row md:mt-14">
            <button
              onClick={onClose}
              className="winner-action-button"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              確認
            </button>
            {canDrawAgain && (
              <button
                onClick={onDrawAgain}
                className="winner-action-button"
                style={{ borderColor: secondaryColor, color: secondaryColor }}
              >
                再抽一次
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
