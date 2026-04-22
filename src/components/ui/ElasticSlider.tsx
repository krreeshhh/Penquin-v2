"use client";

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';

const MAX_OVERFLOW = 50;

interface ElasticSliderProps {
  defaultValue?: number;
  startingValue?: number;
  maxValue?: number;
  className?: string;
  isStepped?: boolean;
  stepSize?: number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

const ElasticSlider: React.FC<ElasticSliderProps> = ({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon = null,
  rightIcon = null,
  onValueChange,
  onValueCommit,
}) => {
  return (
    <div className={`flex items-center justify-center w-full mx-auto ${className}`}>
      <InnerSlider
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />
    </div>
  );
};

interface InnerSliderProps {
  defaultValue: number;
  startingValue: number;
  maxValue: number;
  isStepped: boolean;
  stepSize: number;
  leftIcon: React.ReactNode;
  rightIcon: React.ReactNode;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

const InnerSlider: React.FC<InnerSliderProps> = ({
  defaultValue,
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  onValueChange,
  onValueCommit,
}) => {
  const [value, setValue] = useState<number>(defaultValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useMotionValueEvent(clientX, 'change', (latest: number) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue: number;
      if (latest < left) {
        setRegion('left');
        newValue = left - latest;
      } else if (latest > right) {
        setRegion('right');
        newValue = latest - right;
      } else {
        setRegion('middle');
        newValue = 0;
      }
      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);
      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }
      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      setValue(newValue);
      onValueChange?.(Math.round(newValue));
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
    onValueCommit?.(Math.round(value));
  };

  const getRangePercentage = (): number => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return ((value - startingValue) / totalRange) * 100;
  };

  return (
    <motion.div
      onHoverStart={() => animate(scale, 1.02)}
      onHoverEnd={() => animate(scale, 1)}
      onTouchStart={() => animate(scale, 1.02)}
      onTouchEnd={() => animate(scale, 1)}
      style={{
        scale,
      }}
      className="flex w-full touch-none select-none items-center justify-center gap-3"
    >
      {leftIcon && (
        <motion.div
          animate={{
            scale: region === 'left' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 }
          }}
          style={{
            x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0))
          }}
          className="text-[var(--vp-c-text-2)] select-none"
        >
          {leftIcon}
        </motion.div>
      )}

      <div
        ref={sliderRef}
        className="relative flex w-full flex-grow cursor-grab active:cursor-grabbing touch-none select-none items-center py-4"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <motion.div
          style={{
            scaleX: useTransform(() => {
              if (sliderRef.current) {
                const { width } = sliderRef.current.getBoundingClientRect();
                return 1 + overflow.get() / width;
              }
              return 1;
            }),
            scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.95]),
            transformOrigin: useTransform(() => {
              if (sliderRef.current) {
                const { left, width } = sliderRef.current.getBoundingClientRect();
                return clientX.get() < left + width / 2 ? 'right' : 'left';
              }
              return 'center';
            }),
            height: 36,
          }}
          className="flex flex-grow"
        >
          <div className="relative h-full flex-grow rounded-xl bg-black overflow-hidden">
            {/* Filled part (Progress) */}
            <motion.div
              className="absolute h-full left-0 bg-[#e0e0da]"
              animate={{ 
                width: `calc(${getRangePercentage()}% - ${(getRangePercentage() / 100) * 48}px + 24px)` 
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            />
            {/* Thumb */}
            <motion.div 
              className="absolute top-0 bottom-0 w-[48px] bg-[#eeeee9] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-white/20 z-10"
              animate={{ 
                left: `calc(${getRangePercentage()}% - ${(getRangePercentage() / 100) * 48}px)`,
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            />
          </div>
        </motion.div>
      </div>

      {rightIcon && (
        <motion.div
          animate={{
            scale: region === 'right' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 }
          }}
          style={{
            x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0))
          }}
          className="text-[var(--vp-c-text-2)] select-none"
        >
          {rightIcon}
        </motion.div>
      )}
    </motion.div>
  );
};

function decay(value: number, max: number): number {
  if (max === 0) return 0;
  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
  return sigmoid * max;
}

export default ElasticSlider;
