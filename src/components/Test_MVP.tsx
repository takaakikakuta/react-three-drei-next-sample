'use client'

import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react'
import { useAnimations, useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import { log } from 'console';

const Test_MVP: React.FC<{ onCameraData: (position: THREE.Vector3, quaternion: THREE.Quaternion) => void }> = ({ onCameraData }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, cameras, animations} = useGLTF('/monoReview.glb'); // GLBファイルのパスを指定
  const  { actions }  = useAnimations(animations, groupRef)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);  

  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const camera = cameras[0];
      onCameraData(camera.position.clone(), camera.quaternion.clone());
    }

    if (animations && animations.length > 0) {
      console.log('Animations:', animations);
    }

    if (actions) {
      const actionName = Object.keys(actions)[0]; // 最初のアクション名を取得
      const action = actions[actionName];
      console.log('Playing action:', actionName, action);

      if (action) {
        mixerRef.current = new THREE.AnimationMixer(scene);
        action.reset().play();
      }
    }

    return () => mixerRef.current?.stopAllAction(); // コンポーネントがアンマウントされたときにアニメーションを停止
  }, [cameras, actions, scene, onCameraData, animations]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return <primitive ref={groupRef} object={scene} />;
};

export default Test_MVP
