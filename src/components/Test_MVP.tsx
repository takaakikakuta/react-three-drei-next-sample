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

extend({ EffectComposer, RenderPass, OutlinePass, ShaderPass });

const outlineObject = data.outlineObject
const raycastList = data.raycastList

interface TestMVPProps {
  onCameraData: (position: THREE.Vector3, quaternion: THREE.Quaternion) => void;
  currentAudioIndex: number; // インデックスを受け取るプロパティを追加
  videoRef:React.RefObject<HTMLVideoElement>;
  isClick:boolean;
  selectedSlide:number;
  setIsClick:React.Dispatch<React.SetStateAction<boolean>>;
  setProductName:React.Dispatch<React.SetStateAction<string>>;
  isPlaying:boolean;
}

const Test_MVP: React.FC<TestMVPProps> = ({ onCameraData, currentAudioIndex, videoRef, setProductName, setIsClick, selectedSlide, isPlaying}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene: modelScene, cameras, animations } = useGLTF('/videoModel.glb'); // GLBファイルのパスを指定
  const  { actions, names}  = useAnimations(animations, groupRef)
  const { gl, camera, size, pointer, raycaster, scene: mainScene } = useThree();
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>();
  const [hoveredObjects, setHoveredObjects] = useState<THREE.Object3D[]>([]);
  const [hoveredObjectPosition, setHoveredObjectPosition] = useState<THREE.Vector3 | null>(null);
  const [hoveredObjectName, setHoveredObjectName] = useState<string | null>(null); // Add state to store hovered object name
  const composerRef = useRef<EffectComposer | null>(null);
  const outlinePassRef = useRef<OutlinePass | null>(null);
  const { isPointerOver, setIsPointerOver } = useControl();
  
  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const camera = cameras[selectedSlide] as THREE.PerspectiveCamera;
      console.log(camera);
      
      onCameraData(camera.position.clone(), camera.quaternion.clone());
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
    const videoElement = videoRef.current;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(mainScene, camera));

    const outlinePass = new OutlinePass(new THREE.Vector2(size.width, size.height), mainScene, camera);
    composer.addPass(outlinePass);
    outlinePassRef.current = outlinePass;

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / size.width, 1 / size.height);
    composer.addPass(effectFXAA);

    composerRef.current = composer;

    const handleResize = () => {
      if(videoElement){
        composer.setSize(videoElement.clientWidth, videoElement.clientHeight);
        effectFXAA.uniforms['resolution'].value.set(1 / videoElement.clientWidth, 1 / videoElement.clientHeight);
        
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [gl, mainScene, camera, size, selectedSlide]);

  useEffect(() => {
    // インデックスに基づいてオブジェクトのリストを取得し、それをhoveredObjectsに設定
    const objectsToHighlight = outlineObject[currentAudioIndex].map(name => {
      const foundObject = modelScene.getObjectByName(name);
      if (foundObject) {
        return foundObject;
      }
      return null;
    }).filter(obj => obj !== null) as THREE.Object3D[];

    setHoveredObjects(objectsToHighlight);
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
    const handleClick = () => {
      if (hoveredObject && !isPointerOver) {
        console.log(hoveredObject.name);
        setProductName(hoveredObject.name)
        setIsClick(true)
        
      }
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [hoveredObject, isPointerOver]);

  useFrame((state, delta) => {

    // カメラの更新
    if (cameras && cameras.length > 0) {
      const camera = cameras[selectedSlide];
      onCameraData(camera.position.clone(), camera.quaternion.clone());
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

    if(outlinePassRef.current){
      if (hoveredObjects.length > 0 && isPlaying) {

        outlinePassRef.current.selectedObjects = hoveredObjects;
  
          // 点滅のためにアウトラインの可視性を変更
          const time = state.clock.getElapsedTime();
          outlinePassRef.current.edgeStrength = Math.sin(time * 5) * 2 + 2; // 辺の強度を変える
          outlinePassRef.current.visibleEdgeColor.setHSL(Math.sin(time * 5) * 0.5 + 0.5, 1.0, 0.5); // 色を変更         
          
      
        } else {
        outlinePassRef.current.selectedObjects = [];
      }

    }

    

    if (composerRef.current) {
      composerRef.current.render();
      
    }
     
  }, 1);

  return (
    <>
      <primitive ref={groupRef} object={modelScene}  style={{width: "100px"}}/>
      {hoveredObjectName && hoveredObjectPosition && (
        <Html position={hoveredObjectPosition} center>
          <div style={{ color: 'white', background: 'black', padding: '5px', borderRadius: '5px' }}>
            {hoveredObjectName}
          </div>
        </Html>
      )}
    </>
  );
};

export default Test_MVP