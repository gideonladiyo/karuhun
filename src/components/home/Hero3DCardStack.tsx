import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { getAllGuildBranchIcons } from '@/services/apiService';
import { GuildBranchCard } from '@/components/common/GuildBranchCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MainTab } from '@/pages/HomePage';

interface Hero3DCardStackProps {
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

const fallbackLogo = '/logo.png';

export const Hero3DCardStack: React.FC<Hero3DCardStackProps> = ({
  selectedIndex,
  onSelectIndex,
  onNavigate,
}) => {
  const count = GUILD_BRANCHES.length; // 4 branches
  const angleStep = 360 / count; // 90 degrees

  // Continuous orbital angle in degrees
  const angleRef = useRef<number>(selectedIndex * angleStep);
  const targetAngleRef = useRef<number>(selectedIndex * angleStep);
  const [renderAngle, setRenderAngle] = useState<number>(selectedIndex * angleStep);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [branchIcons, setBranchIcons] = useState<Record<number, string>>({});

  const isHoveredRef = useRef<boolean>(false);
  const isInteractingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    getAllGuildBranchIcons()
      .then((icons) => {
        setBranchIcons(icons);
      })
      .catch((err) => {
        console.warn('Failed to load guild icons', err);
      });
  }, []);

  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragAxisRef = useRef<'x' | 'y' | null>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const dragStartAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  // Wheel animation step function with spring ease
  const animateWheel = useCallback(() => {
    const remaining = targetAngleRef.current - angleRef.current;
    if (Math.abs(remaining) < 0.05) {
      angleRef.current = targetAngleRef.current;
      setRenderAngle(targetAngleRef.current);
      rafRef.current = null;
      return;
    }

    // Exponential spring damping
    angleRef.current += remaining * 0.15;
    setRenderAngle(angleRef.current);
    rafRef.current = requestAnimationFrame(animateWheel);
  }, []);

  const rotateTo = useCallback((newTargetAngle: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    targetAngleRef.current = newTargetAngle;
    
    // Normalize selected index
    const normalizedAngle = ((newTargetAngle % 360) + 360) % 360;
    const newIdx = Math.round(normalizedAngle / angleStep) % count;
    onSelectIndex(newIdx);

    rafRef.current = requestAnimationFrame(animateWheel);
  }, [animateWheel, angleStep, count, onSelectIndex]);

  // Sync external selectedIndex
  useEffect(() => {
    const currentTargetIndex = Math.round(targetAngleRef.current / angleStep) % count;
    const normalizedCurrent = ((currentTargetIndex % count) + count) % count;
    
    if (selectedIndex !== normalizedCurrent) {
      let diff = selectedIndex - normalizedCurrent;
      if (diff > count / 2) diff -= count;
      if (diff < -count / 2) diff += count;
      
      const nextTarget = targetAngleRef.current + diff * angleStep;
      rotateTo(nextTarget);
    }
  }, [selectedIndex, angleStep, count, rotateTo]);

  // Auto-Rotate: Smooth periodic rotation every 4.5 seconds when idle
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHoveredRef.current && !isInteractingRef.current && !isDraggingRef.current) {
        rotateTo(targetAngleRef.current + angleStep);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [rotateTo, angleStep]);

  // Next / Prev Clockwise Rotation
  const handlePrev = () => {
    isInteractingRef.current = true;
    rotateTo(targetAngleRef.current - angleStep);
    setTimeout(() => { isInteractingRef.current = false; }, 3000);
  };

  const handleNext = () => {
    isInteractingRef.current = true;
    rotateTo(targetAngleRef.current + angleStep);
    setTimeout(() => { isInteractingRef.current = false; }, 3000);
  };

  // Pointer drag event handlers (Horizontal-only swipe lock to prevent vertical page scroll trap)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    isInteractingRef.current = true;
    isDraggingRef.current = true;
    dragAxisRef.current = null;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartAngleRef.current = angleRef.current;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - dragStartYRef.current;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);

    // Axis lock determination
    if (!dragAxisRef.current) {
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        dragAxisRef.current = 'x';
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        // Vertical gesture: release to native browser page scrolling
        dragAxisRef.current = 'y';
        isDraggingRef.current = false;
        return;
      }
    }

    if (dragAxisRef.current === 'x') {
      // Horizontal swipe controls orbital rotation
      const newAngle = dragStartAngleRef.current + deltaX * 0.55;
      const prevAngle = angleRef.current;
      angleRef.current = newAngle;
      setRenderAngle(newAngle);

      velocityRef.current = ((newAngle - prevAngle) / dt) * 1000;
      lastTimeRef.current = now;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current && dragAxisRef.current === 'x') {
      // Momentum throw physics for horizontal swipe
      const carried = Math.max(-120, Math.min(120, velocityRef.current * 0.16));
      const finalProjected = angleRef.current + carried;
      const snappedAngle = Math.round(finalProjected / angleStep) * angleStep;

      rotateTo(snappedAngle);
    }
    
    isDraggingRef.current = false;
    dragAxisRef.current = null;
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 3000);
  };

  return (
    <div 
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      className="w-full flex flex-col items-center select-none -mt-10 sm:-mt-16 lg:-mt-20 relative"
    >
      
      {/* 3D Asymmetric Constellation Viewport (touch-pan-y for native frictionless vertical scrolling) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-[410px] sm:h-[460px] lg:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing outline-none overflow-visible touch-pan-y"
        style={{
          perspective: '1600px',
          perspectiveOrigin: '50% 40%',
          touchAction: 'pan-y',
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {GUILD_BRANCHES.map((branch, index) => {
            // Orbital Phase Angle
            const cardBaseAngle = index * angleStep;
            const currentAngleDiff = ((cardBaseAngle - renderAngle) % 360 + 360) % 360;
            const rad = (currentAngleDiff * Math.PI) / 180;

            const sinVal = Math.sin(rad);
            const cosVal = Math.cos(rad);
            const sin2Val = Math.sin(2 * rad);
            const cos2Val = Math.cos(2 * rad);

            // Shift cluster center far up towards the top-right
            const centerOffsetX = 20;
            const centerOffsetY = -120;

            // Wide orbital spread radiuses
            const Rx = 245; // Wide horizontal spread (px)
            const Ry = 145; // Vertical spread (px)
            const Rz = 115; // Depth spread (px)

            // Responsive posX for Mobile vs Desktop
            const posX = isMobile
              ? centerOffsetX - sinVal * Rx - 25 * cos2Val
              : centerOffsetX - sinVal * Rx - 55 * cos2Val;

            const posY = centerOffsetY + cosVal * Ry - 0 * sinVal + 15 * cos2Val;
            const posZ = (cosVal - 1) * Rz;

            // Organic 3D card tilt angles (pitch, yaw, roll)
            const rotX = -19 * sinVal;
            const rotY = 7 * cosVal;
            const rotZ = 4.2 * sin2Val - 2.2 * cosVal;

            const scale = 1 + 0.26 * ((cosVal + 1) / 2);

            // Card at the very back has opacity 0 to not obstruct text above
            const isBack = cosVal < -0.25;
            const opacity = isBack ? 0 : 0.45 + 0.55 * ((cosVal + 1) / 2);
            const zIndex = Math.round(100 + 80 * cosVal);

            // Active front card detection
            const isFront = cosVal > 0.80;

            const isCompetitive = branch.tag === 'Competitive';
            const isSubCompetitive = branch.tag === 'Sub-Competitive';

            const tagColorClass = isCompetitive
              ? 'text-amber-400'
              : isSubCompetitive
              ? 'text-sky-400'
              : 'text-zinc-400';

            const iconSrc = branchIcons[branch.id] || fallbackLogo;

            return (
              <div
                key={branch.id}
                style={{
                  transform: `translate3d(${posX}px, ${posY}px, ${posZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: isBack ? 'none' : 'auto',
                }}
                className="absolute w-[240px] sm:w-[275px] lg:w-[295px] will-change-transform"
              >
                <GuildBranchCard
                  branch={branch}
                  isActive={isFront}
                  iconUrl={iconSrc}
                  onClick={(e) => {
                    if (isFront) {
                      onNavigate('hub', branch.id);
                    } else {
                      e.stopPropagation();
                      isInteractingRef.current = true;
                      const diff = index - (selectedIndex % count);
                      let stepCount = diff;
                      if (stepCount > count / 2) stepCount -= count;
                      if (stepCount < -count / 2) stepCount += count;
                      rotateTo(targetAngleRef.current + stepCount * angleStep);
                      setTimeout(() => { isInteractingRef.current = false; }, 3000);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Switcher Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-[420px] px-2 -mt-6 sm:-mt-10 pt-2 border-t border-[#27272a]/50 z-40">
        
        {/* Navigation Buttons (Clockwise / Counter-Clockwise Orbit) */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePrev}
            aria-label="Previous Division"
            className="p-2 rounded-xl bg-[#18181b] hover:bg-white hover:text-black text-zinc-400 border border-[#27272a] hover:border-white transition-all shadow-md active:scale-90 flex items-center justify-center"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Division"
            className="p-2 rounded-xl bg-[#18181b] hover:bg-white hover:text-black text-zinc-400 border border-[#27272a] hover:border-white transition-all shadow-md active:scale-90 flex items-center justify-center"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Branch Select Indicator Dots */}
        <div className="flex items-center space-x-1.5">
          {GUILD_BRANCHES.map((b, idx) => {
            const isDotActive = idx === selectedIndex;
            return (
              <button
                key={b.id}
                onClick={() => {
                  isInteractingRef.current = true;
                  const diff = idx - (selectedIndex % count);
                  let stepCount = diff;
                  if (stepCount > count / 2) stepCount -= count;
                  if (stepCount < -count / 2) stepCount += count;
                  rotateTo(targetAngleRef.current + stepCount * angleStep);
                  setTimeout(() => { isInteractingRef.current = false; }, 3000);
                }}
                aria-label={`Select ${b.name}`}
                className={`transition-all duration-300 rounded-full ${
                  isDotActive
                    ? 'w-7 h-2 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-2 h-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            );
          })}
        </div>

        {/* Division Indicator Ticker */}
        <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-wider font-bold">
          0{selectedIndex + 1} / 0{count}
        </span>

      </div>

    </div>
  );
};
