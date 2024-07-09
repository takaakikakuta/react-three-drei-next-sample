'use client'

import { Canvas, useFrame} from "@react-three/fiber";
import { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from 'three';
import { usePosition } from '@/components/hooks/PositionContext';
import { useSearchParams } from "next/navigation";

import Test_MVP from "@/components/Test_MVP";
import UpdateCamera from "@/components/UpdateCamera";
import Header from "@/components/Header";
import Video from "@/components/Video";
import Controller from "@/components/Controller";
import TextSpace from "@/components/TextSpace";
import CameraModal from "@/components/CameraModal";
import useDragAndZoom from "@/components/hooks/useDragAndZoom";
import useCanvasTransform from "@/components/hooks/useCanvasTransform";
import ProductModal from "@/components/ProductModal";


const Home: React.FC = () => {
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0.52, 0.1, 0));
  const [cameraQuaternion, setCameraQuaternion] = useState(new THREE.Quaternion());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0); // 選択されたスライドのインデックスを管理
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 再生中かどうかのステート
  const [isSound, setIsSound] = useState<boolean>(false);
  const [isVoice, setIsVoice] = useState<boolean>(false);
  const [firstVideoEnded, setFirstVideoEnded] = useState<boolean>(false); // 最初のビデオ終了ステータス
  // for ProductModal
  const [isClick, setIsClick] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>("");
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ビデオサイズ取得


  // const [position,setPosition] = useState(new THREE.Vector2())

  const focalLength = 50; // 焦点距離 50mm
  const sensorHeight = 20; // センサー高さ 24mm
  // 本当は24
  const thetaRad = 2 * Math.atan(sensorHeight / (2 * focalLength));
  const fovDegrees = thetaRad * (180 / Math.PI);

  // クエリパラメーターの取得
  const searchParams = useSearchParams();
  const param = searchParams.get("param"); 
  

  const handleCameraData = useCallback((position: THREE.Vector3, quaternion: THREE.Quaternion) => {
    setCameraPosition(position);
    setCameraQuaternion(quaternion);
  }, []);

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false);

  const productOpenModal = () => setIsClick(true)
  const productCloseModal = () => setIsClick(false)


  const {
    scale,
    position,
    handleScroll,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = usePosition();

  const {
    updateCanvasSize,
    updateCanvasTransform
  } = useCanvasTransform(1, { x: 0, y: 0 }, { min: 0.5, max: 3 })

  const updateCanvas = () => {
    updateCanvasTransform(videoRef, canvasContainerRef);
    updateCanvasSize(videoRef, canvasContainerRef)
    const canvasContainerElement = canvasContainerRef.current;
    if (canvasContainerElement) {
      canvasContainerElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
      
    }
    
  }

  useEffect(() => {
    const handleResize = () => {
      updateCanvas()
    };
  
    window.addEventListener('resize', handleResize);
  
    // クリーンアップ関数を返す
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasTransform, updateCanvasSize]);
  
  useEffect(() => {

    updateCanvasTransform(videoRef, canvasContainerRef);
    updateCanvasSize(videoRef, canvasContainerRef)
    

  }, [scale, position]);
  
  useEffect(() => {
    const canvasContainerElement = canvasContainerRef.current;
    const videoElement = videoRef.current;
    
    if (canvasContainerElement && videoElement) {
      canvasContainerElement.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`; 
      
    }    

  }, [scale]);

  const handleFirstVideoEnd = () => {
    setFirstVideoEnded(true);
  }

  return (
    // Ground Container
      <div className="h-screen relative overflow-hidden justify-center flex">
          <Header />
          <div 
          ref={canvasContainerRef} 
          className="z-10 flex justify-center absolute" 
          style={{pointerEvents:"none"}}
          onWheel={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          >
          <Canvas
            ref={canvasRef}
            camera={{ fov: fovDegrees, position: cameraPosition }}
            gl={{ antialias: true, alpha: true}} // alpha: trueを追加
            >
            {/* デバッグ用 */}
            <ambientLight intensity={0.5} />
            <Test_MVP 
              onCameraData={handleCameraData}
              currentAudioIndex={currentAudioIndex}
              videoRef = {videoRef}
              videoRef1 = {videoRef1}
              videoRef2 = {videoRef2}
              isClick = {isClick} 
              setIsClick ={setIsClick}
              setProductName={setProductName}
              selectedSlide={selectedSlide}
              isPlaying={isPlaying} 
              />
            <UpdateCamera cameraPosition={cameraPosition} cameraQuaternion={cameraQuaternion} />
          </Canvas>
        </div>
        <Video 
          selectedSlide={selectedSlide}
          isOpen={isModalOpen}
          videoRef = {videoRef}
          videoRef1 = {videoRef1}
          videoRef2 = {videoRef2}
          isSound = {isSound}
          onFirstVideoEnd={handleFirstVideoEnd} // 初回のビデオ終了コールバックを渡す
        />
        {firstVideoEnded && (
        <>
          <Controller
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentAudioIndex={currentAudioIndex}
            setCurrentAudioIndex={setCurrentAudioIndex}
            isOpen={isModalOpen} 
            onOpen={openModal}
            isSound={isSound}
            setIsSound={setIsSound}
            isVoice={isVoice}
            setIsVoice={setIsVoice}
          />
          <TextSpace currentAudioIndex={currentAudioIndex} isPlaying={isPlaying}/>
          <CameraModal isOpen={isModalOpen} onClose={closeModal} selectedSlide={selectedSlide} onSelectSlide={setSelectedSlide}/>
          <ProductModal isClick={isClick} onClose={productCloseModal} productName={productName}/>
        </>
      )}
      </div>
  );
}

export default Home;
