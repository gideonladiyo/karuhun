import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  direction?: 'up' | 'down' | 'scale' | 'none';
  variant?: 'bouncy' | 'smooth';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
  variant = 'smooth',
  threshold = 0.08
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        {
          threshold,
          rootMargin: '0px 0px -30px 0px'
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }

    setIsVisible(true);
    return undefined;
  }, [threshold]);

  let transformInitial = 'translate3d(0, 12px, 0)';
  if (direction === 'down') transformInitial = 'translate3d(0, -12px, 0)';
  else if (direction === 'scale') transformInitial = 'scale3d(0.98, 0.98, 1) translate3d(0, 8px, 0)';
  else if (direction === 'none') transformInitial = 'none';

  return (
    <div
      ref={ref}
      style={{
        transitionProperty: 'transform, opacity',
        transitionDuration: variant === 'bouncy' ? '260ms' : '200ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delayMs}ms`,
        transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : transformInitial,
        opacity: isVisible ? 1 : 0,
        willChange: isVisible ? 'auto' : 'transform, opacity'
      }}
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
};
