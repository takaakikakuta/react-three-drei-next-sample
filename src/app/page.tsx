'use client'

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame} from "@react-three/fiber";
import { log } from "console";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";
import * as THREE from 'three';

import Test_MVP from "@/components/Test_MVP";
import UpdateCamera from "@/components/UpdateCamera";

const Home: React.FC = () => {
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0.52, 0.1, 0));
  const [cameraQuaternion, setCameraQuaternion] = useState(new THREE.Quaternion());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const focalLength = 50; // 焦点距離 50mm
  const sensorHeight = 20; // センサー高さ 24mm
  // 本当は24
  const thetaRad = 2 * Math.atan(sensorHeight / (2 * focalLength));
  const fovDegrees = thetaRad * (180 / Math.PI);

  const handleCameraData = useCallback((position: THREE.Vector3, quaternion: THREE.Quaternion) => {
    setCameraPosition(position);
    setCameraQuaternion(quaternion);    
  }, []);

  const updateCanvasSizeAndPosition = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const containerAspectRatio = window.innerWidth / window.innerHeight;

      let newWidth, newHeight, offsetX, offsetY;

      if (videoAspectRatio > containerAspectRatio) {
        newWidth = window.innerWidth;
        newHeight = newWidth / videoAspectRatio;
        offsetX = 0;
        offsetY = (window.innerHeight - newHeight) / 2;
      } else {
        newHeight = window.innerHeight;
        newWidth = newHeight * videoAspectRatio;
        offsetX = (window.innerWidth - newWidth) / 2;
        offsetY = 0;
      }

      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
      canvas.style.left = `${offsetX}px`;
      canvas.style.top = `${offsetY}px`;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateCanvasSizeAndPosition);
    }
    window.addEventListener('resize', updateCanvasSizeAndPosition);

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateCanvasSizeAndPosition);
      }
      window.removeEventListener('resize', updateCanvasSizeAndPosition);
    };
  }, []);

  return (
    // Ground Container

    <div className="flex items-center justify-center h-screen w-screen relative">
       <div className="absolute top-0 left-0 h-full w-full">
        <div className="relative h-full w-full" ref={canvasRef}>
          <Canvas
            className="absolute top-0 left-0 h-full w-full object-contain z-10"
            camera={{ fov: fovDegrees, position: cameraPosition }}
            gl={{ antialias: true }}
            style={{ background: '#87ceeb' }} // 背景色を設定
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Test_MVP onCameraData={handleCameraData} />
            <UpdateCamera cameraPosition={cameraPosition} cameraQuaternion={cameraQuaternion} />
            {/* <OrbitControls /> */}
          </Canvas>
          <video
            ref={videoRef}
            className="absolute top-0 left-0 h-full w-full object-contain"
            src="/mono_review_test.mp4"
          ></video>
        </div>
      </div>
    </div>
  );
}

export default Home;
