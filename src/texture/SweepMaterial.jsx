import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import vert from './sweep.vert.glsl?raw'
import frag from './sweep.frag.glsl?raw'

const SweepMaterial = shaderMaterial(
  {
    time: 0,
    axisWorld: new THREE.Vector3(1, 0, 0),
    minAlong: -1,
    maxAlong: 1,
    speed: 0.12,
    bandWidth: 0.12,
    softness: 0.55,
    loop: 1,
    baseColor: new THREE.Color('#0a1a3a'),
    sweepColor: new THREE.Color('#2fd5ff'),
    baseIntensity: 0.25,
    sweepIntensity: 1.4,
    opacity: 0.9,
  },
  vert,
  frag,
)

extend({ SweepMaterial })

export { SweepMaterial }
