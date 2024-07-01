import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { usePosition } from './hooks/PositionContext'
import { data } from './data'; // データファイルをインポート

interface VideoProps {
  selectedSlide: number;
  isOpen: boolean;
  videoRef:React.RefObject<HTMLVideoElement>;
  isSound:boolean;
  onFirstVideoEnd: () => void; // 新しいプロップを追加
}

const Video: React.FC<VideoProps> = ({ 
  selectedSlide,
  isOpen,
  videoRef,
  isSound,
  onFirstVideoEnd // 新しいプロップを受け取る
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
    
  const videos = data.videos
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [nextVideo, setNextVideo] = useState<string>("");
  const [isFirstPlay, setIsFirstPlay] = useState<boolean>(true);

  const selectRandomVideo = () => {
    const videoList = videos[selectedSlide];
    const randomIndex = Math.floor(Math.random() * videoList.length);
    return videoList[randomIndex];
  };

  useEffect(() => {
    // 初回の特定のビデオを設定
    const initialVideo = "/OP.mp4"; // ここに特定のビデオのURLを設定
    setCurrentVideo(initialVideo);
    setNextVideo(initialVideo); // 初回は同じビデオを設定
  }, []);

    useEffect(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        
      }
      
      
    }, [scale, position, isOpen, selectedSlide, videoRef]);

    useEffect(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.muted = !isSound;
      }
    }, [isSound]);

    const handleVideoEnded = () => {
      const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.pause(); // 一度ビデオを停止

       // 次のビデオを選択し、ロードイベントで再生を開始
       onFirstVideoEnd(); // 初回のビデオが終了したらコールバックを呼ぶ
       const newVideo = isFirstPlay ? currentVideo : selectRandomVideo(); // 初回は特定のビデオ、以降はランダム
       setNextVideo(newVideo);

      // 一時的に src を空にして再設定
      videoElement.src = "";
      // videoElement.load();
      setTimeout(() => {
        videoElement.src = newVideo;
        videoElement.load(); // 再度ロード
        videoElement.play();
      }, 1); // 1秒待つ
    };
  }

    const handleLoadedData = () => {
      setCurrentVideo(nextVideo); // ビデオがロードされたら現在のビデオを更新
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.play(); // 新しいビデオを再生
      }
      setIsFirstPlay(false); // 初回再生が完了したらフラグを更新
    };

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
            src={currentVideo}
            autoPlay
            muted
            onEnded={handleVideoEnded}
            onLoadedData={handleLoadedData} // ビデオがロードされたら呼び出されるイベント
            ></video>

      </div>
    </div>
    </>
  )
}

export default Video
