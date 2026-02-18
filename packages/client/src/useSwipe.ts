import { useCallback, useEffect, useRef, useState } from "react";

export interface SwipeState {
  offsetX: number;
  isDragging: boolean;
  direction: "left" | "right" | null;
}

interface UseSwipeOptions {
  enabled: boolean;
  threshold?: number;
  onSwipe: (direction: "left" | "right") => void;
}

export function useSwipe({
  enabled,
  threshold = 80,
  onSwipe,
}: UseSwipeOptions) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const draggingRef = useRef(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const direction: "left" | "right" | null =
    offsetX > 20 ? "right" : offsetX < -20 ? "left" : null;

  const handleStart = useCallback(
    (clientX: number) => {
      if (!enabled) return;
      startXRef.current = clientX;
      draggingRef.current = true;
      setIsDragging(true);
    },
    [enabled],
  );

  const handleMove = useCallback(
    (clientX: number) => {
      if (!draggingRef.current) return;
      const dx = clientX - startXRef.current;
      setOffsetX(dx);
    },
    [],
  );

  const handleEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    if (Math.abs(offsetX) >= threshold) {
      const dir = offsetX > 0 ? "right" : "left";
      onSwipe(dir);
      // Keep offset for exit animation — parent will disable & reset
    } else {
      setOffsetX(0);
    }
  }, [offsetX, threshold, onSwipe]);

  const reset = useCallback(() => {
    setOffsetX(0);
    setIsDragging(false);
    draggingRef.current = false;
  }, []);

  // Touch events
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      startYRef.current = e.touches[0].clientY;
      handleStart(e.touches[0].clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      // Prevent vertical scroll when swiping horizontally
      const dx = Math.abs(e.touches[0].clientX - startXRef.current);
      const dy = Math.abs(e.touches[0].clientY - startYRef.current);
      if (dx > dy && dx > 10) {
        e.preventDefault();
      }
      handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  // Mouse events
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      handleMove(e.clientX);
    };

    const onMouseUp = () => handleEnd();

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleStart, handleMove, handleEnd]);

  return {
    ref: elementRef,
    offsetX,
    isDragging,
    direction,
    reset,
  };
}
