import { useState, useRef, useEffect, useCallback } from 'react';
import useDragAndZoom  from './useDragAndZoom';

const useCanvasTransform = (initialScale = 1, initialPosition = { x: 0, y: 0 }, scaleLimits = { min: 0.5, max: 3 }) => {

  const {
    scale,
    position,
    handleScroll,
    handleMouseMove
  } = useDragAndZoom(initialScale, initialPosition, scaleLimits);

  const updateCanvasTransform = useCallback((videoRef: React.RefObject<HTMLVideoElement>, canvasContainerRef: React.RefObject<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    const canvasContainerElement = canvasContainerRef.current;
    if (videoElement && canvasContainerElement) {
      canvasContainerElement.style.transform = `translate(${position.x}px, ${position.y}px)`;      
    }

  }, [position, scale, handleMouseMove]);

  const updateCanvasSize = useCallback((videoRef: React.RefObject<HTMLVideoElement>, canvasContainerRef: React.RefObject<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    const canvasElement = canvasContainerRef.current;
    if (videoElement && canvasElement) {
      const videoAspectRatio = videoElement.videoWidth / videoElement.videoHeight;



      canvasElement.style.width = `${videoElement.clientWidth}px`;
      canvasElement.style.height = `${videoElement.clientHeight}px`;
      
    }
  }, [position, scale]);

  return {
    handleScroll,
    updateCanvasTransform,
    updateCanvasSize
  };
};

export default useCanvasTransform;