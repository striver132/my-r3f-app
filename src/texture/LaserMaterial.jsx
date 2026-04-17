import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vert from './laser.vert.glsl?raw'
import frag from './laser.frag.glsl?raw'

const LaserMaterial = shaderMaterial(
  {
    uTime: 0,
    uHit: 0,
    uColor: new THREE.Color('#2fd5ff'),
  },
  vert,
  frag,
)

extend({ LaserMaterial })

export { LaserMaterial }
