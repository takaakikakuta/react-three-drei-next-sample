import React, { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useControl } from './hooks/PointOverContext';
import { data } from './data'; // データファイルをインポート


interface ControllerProps {
  isOpen: boolean;
  onOpen: () => void;
  currentAudioIndex: number;
  setCurrentAudioIndex: React.Dispatch<React.SetStateAction<number>>;
  isPlaying:boolean;
  setIsPlaying:React.Dispatch<React.SetStateAction<boolean>>

}


const Controller: React.FC<ControllerProps> = ({isOpen, onOpen, currentAudioIndex, setCurrentAudioIndex, isPlaying, setIsPlaying}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  // const [percent, setPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSound, setIsSound] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { isPointerOver, setIsPointerOver } = useControl();
  
  const [radius, setRadius] = useState<number>(30); // デフォルトの半径
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<HTMLAudioElement[]>([]); // オーディオ要素のリファレンスを管理
  
  const [progress, setProgress] = useState<number>(0);

  const audioFiles = data.audioFiles 

  const percent = (progress / audioFiles.length ) * 100;
    
  const updateCircle = () => {
    const circle = circleRef.current;
    if (circle) {
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${circumference - (percent / 100) * circumference}`;
    }
  };

  useEffect(() => {
    updateCircle()
  }, [percent, radius]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setRadius(40); // 画面サイズがmd以上の場合の半径
      } else {
        setRadius(30); // それ以外の画面サイズの場合の半径
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初回レンダリング時に呼び出す

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      if (isCollapsed) {
        content.style.maxHeight = '0px';
      } else {
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    }
  }, [isCollapsed]);

  useEffect(() => {
    // 各音声要素にイベントリスナーを追加する
    audioRefs.current.forEach((audio) => {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(audioRefs.current.some(a => !a.paused));

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        
        
      };
    });
  }, [audioRefs.current]);

  // 共通操作ドラッグをfalseにする　マウス
  const handleMouseDown = () => {
    setIsDragging(false);
  };

  // MouseUpの操作
  const increaseHandleMouseUp = () => {
    if (!isDragging) {
      // increasePercent();
      playNextAudio();
    }
  };

  const decreaseHandleMouseUp = () => {
    if (!isDragging) {
      // decreasePercent();
      playPreviousAudio()
    }
  };

  const handleSoundMouseUp = () => {
    if (!isDragging) {
      toggleSound();
      
      setTimeout(() => {
        console.log(isSound);
        isSound ? audioRefs.current[currentAudioIndex].play() : audioRefs.current[currentAudioIndex].muted
      }, 0);
       
    }
  }

  const handleOpenMouseUp = () => {
    if (!isDragging) {
      onOpen()
    }
  }

  // 共通操作ドラッグをfalseにする　スマホ
  const handleTouchStart = () => {
    setIsDragging(false);
  };

  const increaseHandleTouchEnd = () => {
    if (!isDragging) {
      // increasePercent();
      playNextAudio();
    }
  };

  const decreaseHandleTouchEnd = () => {
    if (!isDragging) {
      // decreasePercent();
      playPreviousAudio();
    }
  };

  const toggleSound = () => {
    setIsSound((prev) => {
      const newSoundState = !prev;
      if (audioRefs.current[currentAudioIndex]) {
        audioRefs.current[currentAudioIndex].muted = !newSoundState;
        if (newSoundState) {
          audioRefs.current[currentAudioIndex].play();
        }
      }
      return newSoundState;
    });
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const playNextAudio = () => {
    if(progress === 0){
      audioRefs.current[currentAudioIndex].play(); // 次の音声を再生 
      audioRefs.current[currentAudioIndex].muted = !isSound;
      setProgress((prev) => prev + 1)
    } else {
      if(audioRefs.current[currentAudioIndex]){
        audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
        audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      }
      const nextIndex = (currentAudioIndex + 1) // 次のインデックスを計算
      setCurrentAudioIndex(nextIndex);
      setTimeout(() => {
        audioRefs.current[nextIndex].play(); // 次の音声を再生
        audioRefs.current[nextIndex].muted = !isSound;
        setProgress((prev) => prev + 1);
      }, 0);
    }
  };

  const playPreviousAudio = () => {
    if(progress === 1){
      audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
      audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      audioRefs.current[currentAudioIndex].play(); // 次の音声を再生
      audioRefs.current[currentAudioIndex].muted = !isSound;
    } else {
      if(audioRefs.current[currentAudioIndex]){
        audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
        audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      }
      const prevIndex = currentAudioIndex - 1 // 前のインデックスを計算
      setCurrentAudioIndex(prevIndex);
      setTimeout(() => {
        audioRefs.current[prevIndex].play(); // 次の音声を再生
        audioRefs.current[prevIndex].muted = !isSound;
        setProgress((prev) => prev - 1);
      }, 0);
    }

  }

  return (
    <>
      <Draggable 
      bounds="parent"
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      defaultPosition={{ x: 0, y: 0 }}>
        <div 
          className='overflow-hidden absolute bottom-10 md:left-10 w-72 md:w-60 h-auto bg-pink-500 z-50 rounded-xl transform -translate-x-1/2 flex flex-col items-center'
          onMouseEnter={() => setIsPointerOver(true)}
          onMouseLeave={() => setIsPointerOver(false)}
        >
            <div className="flex w-full justify-end px-3">
              <button className="flex rounded-full text-black" onClick={toggleCollapse} onTouchStart={toggleCollapse}>
                {isCollapsed ? '+' : '-'}
              </button>
            </div>
            <div
              ref={contentRef}
              className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-screen'}`}
              style={{ maxHeight: isCollapsed ? '0px' : 'none' }}
            >
              <div className="flex md:flex-col justify-center my-3">
                <div className="w-24 md:w-28 h-24 md:h-28 p-2 flex items-center justify-center md:mx-auto">
                  <svg className="relative transform -rotate-90 h-full w-full">
                      <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
                          className="text-gray-700" />
                      <circle ref={circleRef} cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
                        className="text-blue-500" />
                  </svg>
                  <span 
                    className="absolute text-xl cursor-pointer text-center" 
                    onMouseDown={handleMouseDown}
                    onMouseUp={increaseHandleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={increaseHandleTouchEnd}
                  >
                    STEP<br/>
                    {progress} / {audioFiles.length}
                  </span>
                </div>
                <div className="w-48 h-24 bg-orange-400 p-2 pb-4 mr-2 rounded-xl">
                  <div className="flex h-1/2 mb-2">
                    <button 
                    className={`w-1/2 h-full mr-1 rounded-lg flex justify-center items-center ${percent === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-400'}`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={decreaseHandleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={decreaseHandleTouchEnd}
                    disabled={percent === 0}
                    style={percent === 0 ? { pointerEvents: 'none', touchAction: 'none' } : {}}
                    >
                    <PlayIcon className="h-6 w-6 text-white transform rotate-180 " /></button>
                    <button 
                      className={`w-1/2 h-full rounded-lg flex justify-center items-center ${percent === 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-400'}`}
                      onMouseDown={handleMouseDown}
                      onMouseUp={increaseHandleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={increaseHandleTouchEnd}
                      disabled={percent === 100}
                      style={percent === 100 ? { pointerEvents: 'none', touchAction: 'none' } : {}}
                      >
                    <PlayIcon className="h-6 w-6 text-white" /></button>
                  </div>
                  <div className="flex h-1/2">
                    <button 
                      className="w-1/2 h-full bg-red-400 mr-1 rounded-lg flex justify-center items-center"
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleOpenMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleOpenMouseUp}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </button>
                    <button 
                      id="sound"
                      className={`w-1/2 h-full bg-red-400 mr-1 rounded-lg flex justify-center items-center ${isPlaying ? 'blinking' : ''}`}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleSoundMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleSoundMouseUp}>
                      { isSound ?    
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {audioFiles.map((file, index) => (
            <audio key={index} ref={(el) => { audioRefs.current[index] = el!; }} src={file} />
            ))}
            
        </div>
      </Draggable>
    </>
  )
}

export default Controller
