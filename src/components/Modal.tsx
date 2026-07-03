import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, prefersReducedMotion } from '../lib/gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes applied to the dialog panel element. */
  panelClassName?: string;
  /** Extra classes applied to the fullscreen backdrop element. */
  screenClassName?: string;
  ariaLabel?: string;
  labelledById?: string;
  closeOnBackdrop?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusable = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );

export default function Modal({
  isOpen,
  onClose,
  children,
  panelClassName = '',
  screenClassName = '',
  ariaLabel,
  labelledById,
  closeOnBackdrop = true,
}: ModalProps) {
  const [rendered, setRendered] = useState(isOpen);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  // Only a press that both starts and ends on the backdrop counts as a backdrop click
  // (prevents a text-selection drag from inside the panel from closing the modal).
  const pointerDownOnBackdrop = useRef(false);

  useEffect(() => {
    if (isOpen) setRendered(true);
  }, [isOpen]);

  // Enter / exit animation driven by GSAP.
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!rendered || !backdrop || !panel) return undefined;

    const reduce = prefersReducedMotion();
    gsap.killTweensOf([backdrop, panel]);

    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Apply the hidden start states first, then tween to visible. Focus happens at the
      // end of the timeline — focusing while autoAlpha still holds visibility:hidden
      // fails silently and would leave keyboard focus behind the backdrop.
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(panel, { autoAlpha: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.92 });

      const tl = gsap.timeline();
      tl.to(backdrop, { autoAlpha: 1, duration: reduce ? 0.12 : 0.3, ease: 'power2.out' })
        .to(
          panel,
          { autoAlpha: 1, y: 0, scale: 1, duration: reduce ? 0.12 : 0.5, ease: 'back.out(1.4)' },
          '<0.04',
        )
        .add(() => {
          const panelEl = panelRef.current;
          if (panelEl && !panelEl.contains(document.activeElement)) {
            panelEl.focus({ preventScroll: true });
          }
        });

      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setRendered(false);
        previouslyFocused.current?.focus?.({ preventScroll: true });
      },
    });
    tl.to(panel, {
      autoAlpha: 0,
      y: reduce ? 0 : 16,
      scale: reduce ? 1 : 0.95,
      duration: reduce ? 0.1 : 0.28,
      ease: 'power2.in',
    }).to(backdrop, { autoAlpha: 0, duration: reduce ? 0.1 : 0.24 }, '<0.05');

    return () => {
      tl.kill();
    };
  }, [isOpen, rendered]);

  // Escape to close + focus trap.
  useEffect(() => {
    if (!rendered || !isOpen) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = getFocusable(panel);
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [rendered, isOpen, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      ref={backdropRef}
      className={`modal-screen fixed inset-0 z-[100] flex items-center justify-center modal-backdrop ${screenClassName}`}
      onMouseDown={(event) => {
        pointerDownOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (closeOnBackdrop && pointerDownOnBackdrop.current && event.target === event.currentTarget) {
          onClose();
        }
        pointerDownOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledById}
        tabIndex={-1}
        className={`outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
