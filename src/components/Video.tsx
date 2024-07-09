import React, { useEffect, useRef, useState, forwardRef } from 'react'
import { usePosition } from './hooks/PositionContext'
import { data } from './data'; // データファイルをインポート

interface VideoProps {
  selectedSlide: number;
  isOpen: boolean;
  videoRef:React.RefObject<HTMLVideoElement>;
  videoRef1:React.RefObject<HTMLVideoElement>;
  videoRef2:React.RefObject<HTMLVideoElement>;
  isSound:boolean;
  onFirstVideoEnd: () => void; // 新しいプロップを追加
}

const Video: React.FC<VideoProps> = ({ 
  selectedSlide,
  isOpen,
  videoRef,
  videoRef1,
  videoRef2,
  isSound,
  onFirstVideoEnd // 新しいプロップを受け取る
}) => {

  const containerRef = useRef<HTMLDivElement>(null);
  let initialVideo:string
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
  const [video1, setVideo1] = useState<string>("");
  const [video2, setVideo2] = useState<string>("");
  const [isOpeningEnded, setIsOpeningEnded] = useState<boolean>(false);

  const selectRandomVideo = () => {
    const videoList = videos[selectedSlide];
    const randomIndex = Math.floor(Math.random() * videoList.length);
    return videoList[randomIndex];
  };

  useEffect(() => {
    // 初回の特定のビデオを設定
    initialVideo = "/OP.mp4"; // ここに特定のビデオのURLを設定
    setVideo1(selectRandomVideo());
    setVideo2(selectRandomVideo());
  }, []);

    useEffect(() => {
      const videoElement = videoRef.current;
      const videoElement1 = videoRef1.current;
      const videoElement2 = videoRef2.current;
      if (videoElement && videoElement1 && videoElement2) {
        videoElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        videoElement1.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        videoElement2.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
        
      }
      
      
    }, [scale, position, isOpen, selectedSlide, videoRef, videoRef1, videoRef2]);

    useEffect(() => {
      const videoElement = videoRef.current;
      const videoElement1 = videoRef1.current;
      const videoElement2 = videoRef2.current;
      if (videoElement && videoElement1 && videoElement2) {
        videoElement.muted = !isSound;
        videoElement1.muted = !isSound;
        videoElement2.muted = !isSound;
      }
    }, [isSound]);

    const handleOpeningEnded= ()=>{
      const videoElement = videoRef.current;
      onFirstVideoEnd();
      setIsOpeningEnded(true);
      // if(videoElement){
      //   videoElement.pause();
        
      // }
      videoRef1.current?.play();
    }

    const handleVideoStarted1 = () => {
      setVideo2(selectRandomVideo());
    };
  
    const handleVideoStarted2 = () => {
      setVideo1(selectRandomVideo());
    };
  
    const handleVideoEnded1 = () => {
      const videoElement1 = videoRef1.current;
      const videoElement2 = videoRef2.current;
      if (videoElement1 && videoElement2) {
        videoElement1.style.display = 'none';
        videoElement2.style.display = 'block';
        videoElement2.play();
        
      }
    };
  
    const handleVideoEnded2 = () => {
      const videoElement1 = videoRef1.current;
      const videoElement2 = videoRef2.current;
      if (videoElement1 && videoElement2) {
        videoElement2.style.display = 'none';
        videoElement1.style.display = 'block';
        videoElement1.play();
      }
    };

    const handleVideoWheel = (event: React.WheelEvent<HTMLVideoElement>) => {
      event.stopPropagation();
    };

    useEffect(() => {
      // selectedSlideが変更されたときに次の動画に切り替える
      const videoElement1 = videoRef1.current;
      const videoElement2 = videoRef2.current;
  
      if (videoElement1 && videoElement2) {
        videoElement1.pause();
        videoElement2.pause();
  
        videoElement1.style.display = 'none';
        videoElement2.style.display = 'none';
  
        setVideo1(selectRandomVideo());
        setVideo2(selectRandomVideo());
  
        // 動画のリロードと再生
        const handleVideo1Load = () => {
          videoElement1.style.display = 'block';
          videoElement1.play();
        };
  
        const handleVideo2Load = () => {
          videoElement2.style.display = 'block';
          videoElement2.play();
        };
  
        videoElement1.addEventListener('loadeddata', handleVideo1Load, { once: true });
        videoElement2.addEventListener('loadeddata', handleVideo2Load, { once: true });
  
        videoElement1.load();
        videoElement2.load();
      }
    }, [selectedSlide]);

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
      style={{ cursor: dragging ? 'grabbing' : ''
      }} // 初期は非表示に設定
      ref={containerRef} className="relative flex justify-center align-items md:max-w-full h-screen max-w-7xl">
        <video
            ref={videoRef}
            style={{ maxWidth: 'none', zIndex: isOpeningEnded ? '-10' : '10'}}
            className="absolute h-full transition-transform duration-0"
            src="/OP.mp4"
            autoPlay
            muted
            onEnded={handleOpeningEnded}
            onWheel={handleVideoWheel} // Video要素のonWheelイベントを追加
            // onLoadedData={handleLoadedData} // ビデオがロードされたら呼び出されるイベント
        ></video>
        <video
            ref={videoRef1}
            style={{ maxWidth: 'none', display: 'none'}}
            className="absolute h-full transition-transform duration-0"
            src={video1}
            muted
            onPlay={handleVideoStarted1} // 再生開始時に次のビデオをロード
            onEnded={handleVideoEnded1}
            onWheel={handleVideoWheel} // Video要素のonWheelイベントを追加
            preload='auto'
        ></video>
        <video
            ref={videoRef2}
            style={{ maxWidth: 'none', display: 'none'}}
            className="absolute h-full transition-transform duration-0"
            src={video2}
            muted
            onPlay={handleVideoStarted2} // 再生開始時に次のビデオをロード
            onEnded={handleVideoEnded2}
            onWheel={handleVideoWheel} // Video要素のonWheelイベントを追加
            preload='auto'
        ></video>

      </div>
    </div>
    </>
  )
}

export default Video