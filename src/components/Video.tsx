import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { usePosition } from './hooks/PositionContext'
import { data } from './data'; // データファイルをインポート

interface VideoProps {
  selectedSlide: number;
  isOpen: boolean;
  videoRef:React.RefObject<HTMLVideoElement>;
}

const Video: React.FC<VideoProps> = ({ 
  selectedSlide,
  isOpen,
  videoRef
}) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const {
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
  } = usePosition();

    // const {
    //   handleVideoSizeChange
    // } = useCanvasTransform(1, { x: 0, y: 0 }, { min: 0.5, max: 3 })

    
  const videos = data.videos

    useEffect(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        
      }
      
      
    }, [scale, position, isOpen, selectedSlide, videoRef]);

  return (
    <>
    <div 
      className="absolute w-full"
      onWheel={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      <div 
      style={{ cursor: dragging ? 'grabbing' : 'grab'
      }} // 初期は非表示に設定
      ref={containerRef} className="flex justify-center align-items md:max-w-full h-screen max-w-7xl">
        <video
            ref={videoRef}
            style={{
              maxWidth: 'none',
            }}
            className="transition-transform duration-0"
            src={videos[selectedSlide]}
            autoPlay
            muted
            loop
            ></video>

      </div>
    </div>
    </>
  )
}

export default Video
