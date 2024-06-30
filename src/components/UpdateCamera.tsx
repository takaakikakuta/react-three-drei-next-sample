import { useFrame } from '@react-three/fiber';
import React from 'react'
import * as THREE from 'three';

const UpdateCamera:React.FC<{ cameraPosition: THREE.Vector3, cameraQuaternion: THREE.Quaternion }> = ({ cameraPosition, cameraQuaternion }) => {
    useFrame(({ camera }) => {
        camera.position.copy(cameraPosition);
        camera.quaternion.copy(cameraQuaternion);
        camera.updateProjectionMatrix();
      });
      return null;
}

export default UpdateCamera
