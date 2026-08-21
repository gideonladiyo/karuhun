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
  variant = 'bouncy',
  threshold = 0.08
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
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
          rootMargin: '0px 0px -50px 0px' 
        }
      );

      observer.observe(node);
      return () => observer.disconnect();
    }

    setIsVisible(true);
    return undefined;
  }, [threshold]);

  // Easing curve: bouncy spring vs buttery smooth
  const easing =
    variant === 'bouncy'
      ? 'cubic-bezier(0.34, 1.25, 0.64, 1)' // subtle tactile spring bounce
      : 'cubic-bezier(0.16, 1, 0.3, 1)'; // ultra-smooth linear dampening

  // Initial transform state before reveal
  let transformInitial = 'translate3d(0, 36px, 0)';
  if (direction === 'down') transformInitial = 'translate3d(0, -36px, 0)';
  else if (direction === 'scale') transformInitial = 'scale3d(0.95, 0.95, 1) translate3d(0, 24px, 0)';
  else if (direction === 'none') transformInitial = 'none';

  return (
    <div
      ref={ref}
      style={{
        transitionProperty: 'transform, opacity',
        transitionDuration: variant === 'bouncy' ? '800ms' : '700ms',
        transitionTimingFunction: easing,
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
