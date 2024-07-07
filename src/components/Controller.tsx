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
  isSound:boolean;
  setIsSound:React.Dispatch<React.SetStateAction<boolean>>
  isVoice:boolean;
  setIsVoice:React.Dispatch<React.SetStateAction<boolean>>
}


const Controller: React.FC<ControllerProps> = ({isOpen, onOpen, currentAudioIndex, setCurrentAudioIndex, isPlaying, setIsPlaying, isSound, setIsSound, isVoice, setIsVoice}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  // const [percent, setPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { isPointerOver, setIsPointerOver } = useControl();
  
  const [radius, setRadius] = useState<number>(30); // デフォルトの半径
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<HTMLAudioElement[]>([]); // オーディオ要素のリファレンスを管理
  
  const [progress, setProgress] = useState<number>(0);

  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);

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
    audioRefs.current.forEach((audio, index) => {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(audioRefs.current.some(a => !a.paused));
      const handleEnded = () => {
        if (isAutoPlay) {
          playNextAudio();
        }
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    });
  }, [isAutoPlay, audioRefs.current]);


  // 共通操作ドラッグをfalseにする　マウス
  const handleMouseDown = () => {
    setIsDragging(false);
  };

  // MouseUpの操作
  const increaseHandleMouseUp = () => {
    if (!isDragging) {
      playNextAudio();
    }
  };

  const autoplayHandleMouseUp = () => {
    if (!isDragging) {
      setIsAutoPlay(true)
      console.log(isAutoPlay);
      
      playNextAudio();
    }
  };

  const decreaseHandleMouseUp = () => {
    if (!isDragging) {
      playPreviousAudio()
    }
  };

  const handleSoundMouseUp = () => {
    if (!isDragging) {
      toggleSound();
      
      setTimeout(() => {
        isSound ? !audioRefs.current[currentAudioIndex].muted : audioRefs.current[currentAudioIndex].muted
      }, 0);
       
    }
  }

  const handleVoiceMouseUp = () => {
    if (!isDragging) {
      toggleVoice();
      
      setTimeout(() => {
        isVoice ? !audioRefs.current[currentAudioIndex].muted : audioRefs.current[currentAudioIndex].muted
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
      playNextAudio();
    }
  };

  const decreaseHandleTouchEnd = () => {
    if (!isDragging) {
      playPreviousAudio();
    }
  };

  const toggleSound = () => {
    setIsSound((prev)=> !prev)
  };

  const toggleVoice = () => {
    setIsVoice((prev) => {
      const newSoundState = !prev;
      if (audioRefs.current[currentAudioIndex]) {
        audioRefs.current[currentAudioIndex].muted = !newSoundState;
      }
      return newSoundState;
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const playNextAudio = () => {
    if(progress === 0){      
      audioRefs.current[currentAudioIndex].play(); // 次の音声を再生 
      audioRefs.current[currentAudioIndex].muted = !isVoice;      
      setProgress((prev) => prev + 1)
      // ここにprogressの加算の式をかくと、多分ずっと無理。
      console.log(progress);
      
    } else {
      if(audioRefs.current[currentAudioIndex]){
        audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
        audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      }
      const nextIndex = (currentAudioIndex + 1) // 次のインデックスを計算
      console.log(nextIndex);
      
      setCurrentAudioIndex(nextIndex);
      setTimeout(() => {
        audioRefs.current[nextIndex].play(); // 次の音声を再生
        audioRefs.current[nextIndex].muted = !isVoice;
        setProgress((prev) => prev + 1);
      }, 0);
    }
  };

  const playPreviousAudio = () => {
    if(progress === 1){
      audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
      audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      audioRefs.current[currentAudioIndex].play(); // 次の音声を再生
      audioRefs.current[currentAudioIndex].muted = !isVoice;
    } else {
      if(audioRefs.current[currentAudioIndex]){
        audioRefs.current[currentAudioIndex].pause(); // 現在の音声を停止
        audioRefs.current[currentAudioIndex].currentTime = 0; // 再生位置をリセット
      }
      const prevIndex = currentAudioIndex - 1 // 前のインデックスを計算
      setCurrentAudioIndex(prevIndex);
      setTimeout(() => {
        audioRefs.current[prevIndex].play(); // 次の音声を再生
        audioRefs.current[prevIndex].muted = !isVoice;
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
          className='overflow-hidden absolute bottom-10 md:left-10 w-72 md:w-60 h-auto bg-green-400 z-50 rounded-xl transform -translate-x-1/2 flex flex-col items-center'
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
              <div className="flex md:flex-col justify-center">
                <div className="w-24 md:w-28 h-24 md:h-28 p-2 flex items-center justify-center md:mx-auto">
                  <svg className="relative transform -rotate-90 h-full w-full">
                      <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
                          className="text-gray-700" />
                      <circle ref={circleRef} cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent"
                        className="text-blue-500" />
                  </svg>
                  <span
                  className="absolute md:text-xl text-sm cursor-pointer text-center"
                  onMouseDown={handleMouseDown}
                  onMouseUp={increaseHandleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={increaseHandleTouchEnd}
                >
                  STEP<br/>
                  {progress} / {audioFiles.length}
                </span>
                </div>
                <div className="w-48 md:h-48 h-24 bg-gray-300 p-2 pb-6 mr-2 rounded-xl mb-2">
                  <div className="flex h-1/3 mb-2">
                    <button 
                    className={`w-1/2 h-full mr-1 rounded-lg flex justify-center items-center shadow-[inset_0_0px_1px_3px_#fff] active:[box-shadow:none] ${percent === 0 ? 'bg-black cursor-not-allowed' : 'bg-white'}`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={decreaseHandleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={decreaseHandleTouchEnd}
                    disabled={percent === 0}
                    style={percent === 0 ? { pointerEvents: 'none', touchAction: 'none' } : {}}
                    >
                    <PlayIcon className={`h-6 w-6 transform rotate-180 ${percent === 0 ? 'text-white' : 'text-black'}`}/>
                    <p className={`block font-bold ${percent === 0 ? 'text-white' : 'text-black'}`}>BACK</p>
                    </button>
                    <button 
                      className={`w-1/2 h-full rounded-lg flex justify-center items-center shadow-[inset_0_0px_1px_3px_#fff] active:[box-shadow:none] ${percent === 100 ? 'bg-black  cursor-not-allowed' : 'bg-white'}`}
                      onMouseDown={handleMouseDown}
                      onMouseUp={increaseHandleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={increaseHandleTouchEnd}
                      disabled={percent === 100}
                      style={percent === 100 ? { pointerEvents: 'none', touchAction: 'none' } : {}}
                      >
                      <p className={`block font-bold ${percent === 100 ? 'text-white' : 'text-black'}`}>NEXT</p>
                    <PlayIcon className={`h-6 w-6 ${percent === 100 ? 'text-white' : 'text-black'}`} /></button>
                  </div>
                  <div className="flex h-1/3 mb-2">
                    <button 
                      className="w-full h-full bg-white text-black mr-1 rounded-lg flex flex-col justify-center items-center shadow-[inset_0_0px_1px_3px_#fff] active:[box-shadow:none]"
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleOpenMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleOpenMouseUp}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                      <p className='hidden md:flex'>Switch Camera</p>
                    </button>
                  </div>
                  <div className="flex h-1/3 mb-2">
                    <button 
                      className={`w-1/2 h-full ${isVoice ? 'bg-white' : 'bg-black'} ${isVoice ? 'text-black' : 'text-white'} mr-1 rounded-lg flex flex-col justify-center items-center mx-auto shadow-[inset_0_0px_1px_3px_#fff] active:[box-shadow:none] ${isPlaying ? 'blinking' : ''}`}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleVoiceMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleVoiceMouseUp}>
                       { isVoice ?    
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>:<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>
                        
                      }
                      <p className='hidden md:flex'>Voice</p>
                    </button>
                    <button 
                      id="sound"
                      className={`w-1/2 h-full ${isSound ? 'bg-white' : 'bg-black'} mr-1 rounded-lg ${isSound ? 'text-black' : 'text-white'} flex flex-col justify-center items-center shadow-[inset_0_0px_1px_3px_#fff] active:[box-shadow:none]`}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleSoundMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleSoundMouseUp}>
                      { isSound ?    
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>:<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 flex">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                        
                      }
                      <p className='hidden md:flex'>Sound</p>
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
