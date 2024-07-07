'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, use } from 'react';

interface Position {
  x: number;
  y: number;
}

interface PositionContextType {
  position: Position;
  scale: number;
  setPosition: (position: Position) => void;
  setScale: (scale: number) => void;
  dragging: boolean;
  click: boolean;
  handleScroll: (event: React.WheelEvent) => void;
  handleMouseDown: (event: React.MouseEvent) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

const PositionContext = createContext<PositionContextType | undefined>(undefined);

export const PositionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [click, setClick] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(0)
  const [move, setMove] = useState(false)

  const handleScroll = useCallback((event: React.WheelEvent) => {
    const newScale = scale + event.deltaY * -0.001;
    if (newScale > 0.5 && newScale < 3) {
      setScale(newScale);
    }
  }, [scale]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setDragging(true);
    setClick(false)        
    setInitialMousePosition({ x: event.clientX - position.x, y: event.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragging) {
      const newX = event.clientX - initialMousePosition.x;
      const newY = event.clientY - initialMousePosition.y;
      const distance = Math.sqrt(Math.pow(newX,2) + Math.pow(newY, 2));
      setMove(true)
      setDistance(distance)
      setPosition({ x: newX, y: newY });
    }
  }, [dragging, initialMousePosition]);

  const handleMouseUp = useCallback(() => {
    if(!move && dragging){
      setClick(true)       
    }
    setDragging(false);
    setMove(false)
  }, [distance,dragging]);

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
      setScale(prevScale => {
        const newScale = prevScale * scaleChange;
        return newScale > 0.5 && newScale < 3 ? newScale : prevScale;
      });
      setInitialDistance(distance);
    }
  }, [dragging, initialMousePosition, initialDistance]);

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
    setInitialDistance(null);
  }, []);

  return (
    <PositionContext.Provider value={{
      position,
      scale,
      setPosition,
      setScale,
      dragging,
      click,
      handleScroll,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    }}>
      {children}
    </PositionContext.Provider>
  );
};

export const usePosition = () => {
  const context = useContext(PositionContext);
  if (!context) {
    throw new Error('usePosition must be used within a PositionProvider');
  }
  return context;
};