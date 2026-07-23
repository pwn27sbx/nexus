import type { CSSProperties } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { LayoutGrid } from 'lucide-react';

type MenuItem = {
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

export type BubbleMenuProps = {
  children?: React.ReactNode;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: MenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
};

export default function BubbleMenu({
  onMenuClick,
  className,
  style,
  menuAriaLabel = 'Toggle menu',
  menuBg = 'rgba(255,255,255,0.8)',
  menuContentColor = '#111',
  useFixedPosition = true,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12,
  children,
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<HTMLElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);

  const menuItems = items || [];

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    // Cierra el menú al hacer clic
    handleToggle();
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const item = menuItems[i];
        if (item) {
          gsap.set(bubble, { '--item-rot': `${item.rotation ?? 0}deg` } as any);
        }
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out',
            },
            '-=' + animationDuration * 0.9
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power3.in',
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: 'power3.in',
        onComplete: () => {
          gsap.set(overlay, { display: 'none' });
          setShowOverlay(false);
        },
      });
    }
  }, [isMenuOpen, showOverlay, animationEase, animationDuration, staggerDelay]);

  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        const bubbles = bubblesRef.current.filter(Boolean);
        bubbles.forEach((bubble, i) => {
          const item = menuItems[i];
          if (bubble && item) {
            const rotation = item.rotation ?? 0;
            gsap.set(bubble, { '--item-rot': `${rotation}deg` } as any);
          }
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      <style>{`
        .bubble-menu-items .pill-list .pill-col:nth-child(4):nth-last-child(2) {
          margin-left: calc(100% / 6);
        }
        .bubble-menu-items .pill-list .pill-col:nth-child(4):last-child {
          margin-left: calc(100% / 3);
        }
        @media (min-width: 900px) {
          .bubble-menu-items .pill-link {
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg) !important;
            color: var(--hover-color) !important;
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
        @media (max-width: 899px) {
          .bubble-menu-items {
            align-items: center;
          }
          .bubble-menu-items .pill-list {
            row-gap: 12px;
            justify-content: center;
          }
          .bubble-menu-items .pill-list .pill-col {
            flex: 0 0 auto !important;
            margin-left: 0 !important;
            overflow: visible;
          }
          .bubble-menu-items .pill-link {
            font-size: clamp(1rem, 3.5vw, 1.4rem) !important;
            padding: 10px 16px !important;
            min-height: auto !important;
            transform: rotate(var(--item-rot));
          }
          .bubble-menu-items .pill-link:hover {
            transform: rotate(var(--item-rot)) scale(1.06);
            background: var(--hover-bg);
            color: var(--hover-color);
          }
          .bubble-menu-items .pill-link:active {
            transform: rotate(var(--item-rot)) scale(.94);
          }
        }
      `}</style>

      {/* Botón que se integra en la barra de búsqueda */}
      <button
        type="button"
        className={`shrink-0 flex items-center justify-center transition-all bg-transparent hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] text-[rgba(100,80,160,0.9)] dark:text-[rgba(180,160,255,0.9)] hover:text-[#7c3aed] dark:hover:text-[#d8b4fe] rounded-r-[21.5px] w-[50px] sm:w-auto h-full px-0 sm:px-6 py-3 sm:py-4 gap-2 font-bold ${className || ''}`}
        onClick={handleToggle}
        aria-label={menuAriaLabel}
        aria-pressed={isMenuOpen}
        style={style}
      >
        {children ? (
          children
        ) : (
          <>
            {/* En móvil se ve el ícono, en PC se oculta */}
            <LayoutGrid
              size={18}
              className="sm:hidden transition-transform duration-300 hover:scale-110"
            />
            {/* En PC se ve el texto, en móvil se oculta */}
            <span className="hidden sm:inline text-[14px]">Categories</span>
          </>
        )}
      </button>

      {/* Overlay del Menú Animado */}
      {showOverlay &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={overlayRef}
            className={[
              'bubble-menu-items',
              useFixedPosition ? 'fixed' : 'absolute',
              'inset-0',
              'flex items-center justify-center',
              'pointer-events-none',
              'z-[1000]',
              'backdrop-blur-xl bg-white/20 dark:bg-black/30',
              'overflow-y-auto',
              '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
            ].join(' ')}
            aria-hidden={!isMenuOpen}
          >
            <ul
              className={[
                'pill-list',
                'list-none m-0 px-6 py-12 my-auto',
                'w-full max-w-[1200px] mx-auto',
                'flex flex-wrap justify-center',
                'gap-x-2 gap-y-4',
                'pointer-events-auto',
              ].join(' ')}
              role="menu"
              aria-label="Menu links"
            >
              {menuItems.map((item, idx) => (
                <li
                  key={idx}
                  role="none"
                  className={[
                    'pill-col',
                    'flex justify-center items-stretch',
                    '[flex:0_0_auto]',
                    'box-border',
                  ].join(' ')}
                  ref={(el) => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <button
                    role="menuitem"
                    onClick={() => handleItemClick(item)}
                    aria-label={item.ariaLabel || item.label}
                    className={[
                      'pill-link',
                      'w-[90%]',
                      'rounded-[999px]',
                      'no-underline',
                      'text-inherit',
                      'shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_4px_16px_rgba(255,255,255,0.4),0_8px_24px_rgba(80,60,180,0.15)]',
                      'dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_4px_12px_rgba(255,255,255,0.05),0_8px_24px_rgba(0,0,0,0.8)]',
                      'bg-gradient-to-b from-[rgba(255,255,255,0.55)] to-[rgba(255,255,255,0.15)]',
                      'dark:from-[rgba(40,35,70,0.45)] dark:to-[rgba(15,10,25,0.25)]',
                      'backdrop-blur-[48px] backdrop-saturate-[250%]',
                      'flex items-center justify-center',
                      'relative',
                      'transition-[background,color,transform] duration-300 ease-in-out',
                      'box-border',
                      'whitespace-nowrap overflow-hidden',
                      'border border-[rgba(255,255,255,0.5)] dark:border-[rgba(255,255,255,0.1)]',
                    ].join(' ')}
                    style={
                      {
                        ['--item-rot']: `${item.rotation ?? 0}deg`,
                        ['--hover-bg']: item.hoverStyles?.bgColor || '#7c3aed',
                        ['--hover-color']: item.hoverStyles?.textColor || '#ffffff',
                        color: 'var(--pill-color)',
                        minHeight: 'var(--pill-min-h, 50px)',
                        padding: 'clamp(1rem, 2vw, 3rem) 0',
                        fontSize: 'clamp(1.5rem, 2vw, 2.5rem)',
                        fontWeight: 700,
                        lineHeight: 0,
                        willChange: 'transform',
                      } as CSSProperties
                    }
                  >
                    <span
                      className="pill-label inline-block"
                      style={{
                        willChange: 'transform, opacity',
                        height: '1.2em',
                        lineHeight: 1.2,
                      }}
                      ref={(el) => {
                        if (el) labelRefs.current[idx] = el;
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Botón para cerrar */}
            <button
              onClick={handleToggle}
              className="pointer-events-auto absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center text-gray-800 dark:text-white shadow-lg hover:bg-white/40 dark:hover:bg-white/20 transition-all hover:scale-110"
            >
              <span className="text-2xl font-bold leading-none select-none">✕</span>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
