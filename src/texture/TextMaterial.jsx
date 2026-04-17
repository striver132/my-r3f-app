import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vert from './text-vert.glsl?raw'
import frag from './text-frag.glsl?raw'

const TextMaterial = shaderMaterial(
  {
    time: 0,
    colorA: new THREE.Color('#2fd5ff'),
    colorB: new THREE.Color('#0a1a3a'),
    intensity: 1.2,
    speed: 1.0,
    scale: 1.0,
    opacity: 0.85,
  },
  vert,
  frag,
)

extend({ TextMaterial })
export { TextMaterial }
