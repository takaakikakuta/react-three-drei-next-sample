'use client'

import { Box, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'

function Experience() {
  return (
   <>
    <Canvas camera={{ fov: 75, position: [0, 0, 5] }}> 
        <OrbitControls/>
        <Box>
            <meshStandardMaterial/>
        </Box>
    </Canvas>
   </>
  )
}

export default Experience
