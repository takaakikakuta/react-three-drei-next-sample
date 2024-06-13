'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PointOverContextProps {
    isPointerOver: boolean;
    setIsPointerOver: (visible: boolean) => void;
  }

const PointOverContext = createContext<PointOverContextProps | undefined>(undefined);

export const PointOverlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPointerOver, setIsPointerOver] = useState(false);

  return (
    <PointOverContext.Provider value={{ isPointerOver, setIsPointerOver }}>
      {children}
    </PointOverContext.Provider>
  );
};

export const useControl = () => {
  const context = useContext(PointOverContext);
  if (!context) {
    throw new Error('useControl must be used within a ControlProvider');
  }
  return context;
};