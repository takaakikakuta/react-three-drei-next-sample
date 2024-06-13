import React from 'react'
import { useState, useCallback, useEffect } from 'react';
import { usePosition } from './PositionContext';

const useDragAndZoom = (
    initialScale = 1,
    initialPosition = { x: 0, y: 0 },
    scaleLimits = { min: 0.5, max: 3 }
  ) => {
    const { position, scale, setPosition, setScale } = usePosition();
    const [dragging, setDragging] = useState(false);
    const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  
    const handleScroll = useCallback((event: React.WheelEvent) => {
    //   event.preventDefault();
      const newScale = scale + event.deltaY * -0.001;
      if (newScale > scaleLimits.min && newScale < scaleLimits.max) {
        setScale(newScale);
      }
    }, [scale, scaleLimits.min, scaleLimits.max]);
  
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
      setDragging(true);
      setInitialMousePosition({ x: event.clientX - position.x, y: event.clientY - position.y });
    }, [position]);
  
    const handleMouseMove = useCallback((event:React. MouseEvent) => {
      if (dragging) {
        const newX = event.clientX - initialMousePosition.x;
        const newY = event.clientY - initialMousePosition.y;
        setPosition({ x: newX, y: newY });
      }
    }, [dragging, initialMousePosition]);
  
    const handleMouseUp = useCallback(() => {
      setDragging(false);
    }, []);
  
    const handleTouchStart = useCallback((event: React.TouchEvent) => {
      setDragging(true);
      const touch = event.touches[0];
      setInitialMousePosition({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }, [position]);
  
    const handleTouchMove = useCallback((event: React.TouchEvent) => {
      if (dragging) {
        const touch = event.touches[0];
        const newX = touch.clientX - initialMousePosition.x;
        const newY = touch.clientY - initialMousePosition.y;
        setPosition({ x: newX, y: newY });
      }
    }, [dragging, initialMousePosition]);
  
    const handleTouchEnd = useCallback(() => {
      setDragging(false);
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

export default useDragAndZoom
