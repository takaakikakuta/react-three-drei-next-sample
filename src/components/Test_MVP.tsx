'use client'

import { useFrame, useThree, extend } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useAnimations, useGLTF, Html} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { OutlinePass } from 'three-stdlib';
import { ShaderPass } from 'three-stdlib';
import { FXAAShader } from 'three-stdlib';
import { useControl } from './hooks/PointOverContext';
import { data } from './data'; // データファイルをインポート
import { usePosition } from './hooks/PositionContext';
import { log } from 'three/examples/jsm/nodes/Nodes.js';

extend({ EffectComposer, RenderPass, OutlinePass, ShaderPass });

const outlineObject = data.outlineObject
const raycastList = data.raycastList
const displayName = data.displayName

interface TestMVPProps {
  onCameraData: (position: THREE.Vector3, quaternion: THREE.Quaternion) => void;
  currentAudioIndex: number; // インデックスを受け取るプロパティを追加
  videoRef:React.RefObject<HTMLVideoElement>;
  videoRef1:React.RefObject<HTMLVideoElement>;
  videoRef2:React.RefObject<HTMLVideoElement>;
  isClick:boolean;
  selectedSlide:number;
  setIsClick:React.Dispatch<React.SetStateAction<boolean>>;
  setProductName:React.Dispatch<React.SetStateAction<string>>;
  isPlaying:boolean;
}

const Test_MVP: React.FC<TestMVPProps> = ({ 
  onCameraData,
  currentAudioIndex,
  videoRef,
  videoRef1,
  videoRef2,
  setProductName,
  setIsClick,
  selectedSlide, 
  isPlaying}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene: modelScene, cameras, animations } = useGLTF('/MapModel_Animation.glb'); // GLBファイルのパスを指定
  const  { actions, names}  = useAnimations(animations)
  const { gl, camera, size, pointer, raycaster, scene: mainScene } = useThree();
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>();
  const [narrationObjects, setNarrationObjects] = useState<THREE.Object3D[]>([]);
  const [hoveredObjectPosition, setHoveredObjectPosition] = useState<THREE.Vector3 | null>(null);
  const [hoveredObjectName, setHoveredObjectName] = useState<string | null>(null); // Add state to store hovered object name
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const { isPointerOver, setIsPointerOver } = useControl();
  const { dragging, click, handleMouseDown, handleMouseUp } = usePosition();

  const {
    scale,
    position,
  } = usePosition();

  const composer = new EffectComposer(gl);

  const getElementSize = (element: HTMLElement | null): { width: number, height: number } => {
    if (element) {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: 0, height: 0 };
  };
  
  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const cameraName = `M_Linear_${selectedSlide}`;
      const selectedCamera = cameras.find(cam => cam.name === cameraName) as THREE.PerspectiveCamera;

      if (selectedCamera) {
        onCameraData(selectedCamera.position.clone(), selectedCamera.quaternion.clone());
      } else {
        console.warn(`Camera with name ${cameraName} not found`);
      }
    }

    // モデルを透明に設定
    modelScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.transparent = true;
        child.material.opacity = 0.0; // 不透明度を設定（0.0〜1.0）
        child.frustumCulled = false; // フラスタムカリングを無効にする
      }
    });   

  }, [actions, animations, cameras, onCameraData, modelScene]);

  useEffect(() => {
    const videoElement = videoRef.current    

    composer.addPass(new RenderPass(mainScene, camera));

    if (videoElement) {
      const size = getElementSize(videoElement);      
      composer.setSize(size.width, size.height);
    }

    composerRef.current = composer;

    const handleResize = () => {
      const videoElement = videoRef.current || videoRef1.current || videoRef2.current;

      if(videoElement){
        composer.setSize(videoElement.clientWidth, videoElement.clientHeight);       
        
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [gl, mainScene, camera, selectedSlide, scale, position,videoRef, videoRef1, videoRef2]);

  useEffect(() => {
    // インデックスに基づいてオブジェクトのリストを取得し、それをhoveredObjectsに設定
    const objectsToHighlight = outlineObject[currentAudioIndex].map(name => {
      const foundObject = modelScene.getObjectByName(name);
      if (foundObject) {
        const clonedObject = foundObject.clone();
        // foundObjectの親がSceneでない場合、親のポジションを加算
        if (foundObject.parent && foundObject.parent.name !== 'Scene') {
          const parentPosition = new THREE.Vector3();
          
          foundObject.parent.getWorldPosition(parentPosition);
          clonedObject.position.add(parentPosition);
      }
      return clonedObject;
      }
      return null;
    }).filter(obj => obj !== null) as THREE.Object3D[];

    setNarrationObjects(objectsToHighlight);
    
  }, [currentAudioIndex, modelScene]);

   // マウスの移動に応じてポインターの座標を更新
   useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const videoElement = videoRef.current;
      if (videoElement) {
        const rect = videoElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }
      
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, pointer]);

  // マウスクリックのイベントリスナーを追加
  useEffect(() => {
    if(hoveredObject && click){
      
      setProductName(hoveredObject!.name);
      setIsClick(true);
    }
  }, [click]);

  useFrame((state, delta) => {

    // カメラの更新
    if (cameras && cameras.length > 0) {
      const cameraName = `M_Linear_${selectedSlide}`;
      const selectedCamera = cameras.find(cam => cam.name === cameraName) as THREE.PerspectiveCamera;

      if (selectedCamera) {
        onCameraData(selectedCamera.position.clone(), selectedCamera.quaternion.clone());
      } else {
        console.warn(`Camera with name ${cameraName} not found`);
      }
    }

    // レイキャスティング
    raycaster.setFromCamera(pointer, state.camera);
    // レイキャスト対象のオブジェクトを絞るか
    const raycastObjects = modelScene.children.filter(child => 
      raycastList.includes(child.name)
    );


    const intersects = raycaster.intersectObjects(raycastObjects, true);

    if (intersects.length > 0) {
      const firstIntersect = intersects[0].object;      
      setHoveredObject(firstIntersect);      
      setHoveredObjectPosition(firstIntersect.position.clone());
      setHoveredObjectName(firstIntersect.name); // Set hovered object name
      
      
    } else {
      setHoveredObject(null);
      setHoveredObjectPosition(null);
      setHoveredObjectName(null); // Reset hovered object name
    }    

    // ここの処理useFrameが走らなくなるから消せない

    if (composerRef.current) {
      composerRef.current.render();
      
    }
     
  }, 1);

  const displayText = hoveredObjectName && displayName.hasOwnProperty(hoveredObjectName)
    ? displayName[hoveredObjectName as keyof typeof displayName]
    : hoveredObjectName;
    

  return (
    <>
      <primitive object={modelScene}/>
      {hoveredObjectName && hoveredObjectPosition && (
        <Html position={hoveredObjectPosition} center style={{ pointerEvents: 'none' }} >
          <div className="flex w-40" style={{ color: 'white', background: 'black', padding: '5px', borderRadius: '5px', opacity:"50%", pointerEvents: 'none'}}
            dangerouslySetInnerHTML={{ __html: displayText || "" }}
            // onPointerDown={(e) => e.stopPropagation()} // ここに追加
          />
        </Html>
      )}
       {narrationObjects && narrationObjects.map((object, index) => {
        const narrationName = displayName.hasOwnProperty(object.name)
          ? displayName[object.name as keyof typeof displayName]
          : object.name;
        return (
          <Html key={`${object.uuid}-${index}`} position={object.position} center style={{ pointerEvents: 'none' }} >
            <div className="flex w-40" style={{ color: 'white', background: 'black', padding: '5px', borderRadius: '5px', opacity:"50%",pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{ __html: narrationName || "" }}
            // onPointerDown={(e) => e.stopPropagation()} // ここに追加
          />
          </Html>
        );
      })}
    </>
  );
};

export default Test_MVP