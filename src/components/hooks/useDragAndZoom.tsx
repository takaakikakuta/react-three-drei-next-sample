import React from 'react';
import { useState, useCallback } from 'react';
import { usePosition } from './PositionContext';

interface Position {
  x: number;
  y: number;
}

const useDragAndZoom = (
  initialScale = 1,
  initialPosition: Position = { x: 0, y: 0 },
  scaleLimits = { min: 0.5, max: 3 }
) => {
  const { position, scale, setPosition, setScale } = usePosition();
  const [dragging, setDragging] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const handleScroll = useCallback((event: React.WheelEvent) => {
    const newScale = scale + event.deltaY * -0.001;
    if (newScale > scaleLimits.min && newScale < scaleLimits.max) {
      setScale(newScale);
    }
  }, [scale, setScale, scaleLimits.min, scaleLimits.max]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setDragging(true);
    setInitialMousePosition({ x: event.clientX - position.x, y: event.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragging) {
      const newX = event.clientX - initialMousePosition.x;
      const newY = event.clientY - initialMousePosition.y;
      setPosition({ x: newX, y: newY });
    }
  }, [dragging, initialMousePosition, setPosition]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      setDragging(true);
      const touch = event.touches[0];
      setInitialMousePosition({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else if (event.touches.length === 2) {
      setDragging(false);
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      setInitialDistance(Math.sqrt(dx * dx + dy * dy));
    }
  }, [position]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (dragging && event.touches.length === 1) {
      const touch = event.touches[0];
      const newX = touch.clientX - initialMousePosition.x;
      const newY = touch.clientY - initialMousePosition.y;
      setPosition({ x: newX, y: newY });
    } else if (event.touches.length === 2 && initialDistance !== null) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = distance / initialDistance;
      const newScale = scale * scaleChange;
      if (newScale > scaleLimits.min && newScale < scaleLimits.max) {
        setScale(newScale);
      }
      setInitialDistance(distance);
    }
  }, [dragging, initialMousePosition, initialDistance, setPosition, scale, setScale, scaleLimits.min, scaleLimits.max]);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    setInitialDistance(null);
  }, []);

  return {
    scale,
    position,
    dragging,
    handleScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

export default useDragAndZoom;
