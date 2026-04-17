import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SweepMaterial as SweepMaterialImpl } from '../texture/SweepMaterial'
import DraggableBox from './DraggableBox'
import HitEffectBox from './HitEffectBox'
import GlbModel from './GlbModel'

const carGlbUrl = new URL('../assets/modle-glb/mercedes_glb_amg.glb', import.meta.url).href

export default function Scene({ shader, effect, manualTrigger }) {
  // 两个可拖拽物体
  const meshARef = useRef(null)
  const movableMatARef = useRef(null)
  const meshBRef = useRef(null)
  const movableMatBRef = useRef(null)

  // 目标物体：基础层 + 特效层
  const targetFxMatRef = useRef(new SweepMaterialImpl())
  const targetBaseRef = useRef(null)
  const targetFxRef = useRef(null)

  // 统一拖拽状态（多个拖拽物体复用）
  const isDraggingRef = useRef(false)
  const activeMeshRef = useRef(null)
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const offsetRef = useRef(new THREE.Vector3())
  const tmpVec3Ref = useRef(new THREE.Vector3())

  // 碰撞检测缓存
  const movableABoxRef = useRef(new THREE.Box3())
  const movableBBoxRef = useRef(new THREE.Box3())
  const targetBoxRef = useRef(new THREE.Box3())
  const isCollidingARef = useRef(false)
  const isCollidingBRef = useRef(false)

  // 特效播放状态
  const effectStartRef = useRef(-1)
  const effectPlayingRef = useRef(false)
  const lastManualTriggerIdRef = useRef(0)
  const axisTmpRef = useRef(new THREE.Vector3(1, 0, 0))
  const tmpColorARef = useRef(new THREE.Color())
  const tmpColorBRef = useRef(new THREE.Color())

  targetFxMatRef.current.transparent = true
  targetFxMatRef.current.depthWrite = false
  targetFxMatRef.current.blending = THREE.AdditiveBlending

  const dragState = {
    isDraggingRef,
    activeMeshRef,
    planeRef,
    offsetRef,
    tmpVec3Ref,
  }

  const movers = [
    { meshRef: meshARef, matRef: movableMatARef, boxRef: movableABoxRef, stateRef: isCollidingARef },
    { meshRef: meshBRef, matRef: movableMatBRef, boxRef: movableBBoxRef, stateRef: isCollidingBRef },
  ]

  useFrame((state) => {
    const target = targetBaseRef.current
    const targetFx = targetFxRef.current
    const targetFxMat = targetFxMatRef.current
    if (!target || !targetFx || !targetFxMat) return

    const shaderCfg = shader ?? {}
    const effectCfg = effect ?? {}

    const axis = axisTmpRef.current.set(
      shaderCfg.axisX ?? 1,
      shaderCfg.axisY ?? 0,
      shaderCfg.axisZ ?? 0,
    )
    if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0)
    axis.normalize()

    targetFxMat.axisWorld.copy(axis)
    targetFxMat.speed = shaderCfg.speed ?? 0.12
    targetFxMat.bandWidth = shaderCfg.bandWidth ?? 0.12
    targetFxMat.softness = shaderCfg.softness ?? 0.55
    targetFxMat.loop = shaderCfg.loop ?? 1
    targetFxMat.baseIntensity = shaderCfg.baseIntensity ?? 0.25
    targetFxMat.opacity = shaderCfg.opacity ?? 0.9
    if (!effectPlayingRef.current) {
      targetFxMat.sweepIntensity = shaderCfg.sweepIntensity ?? 1.4
    }

    targetBoxRef.current.setFromObject(target)

    {
      // 用目标物体的世界包围盒自动计算 minAlong / maxAlong，保证扫光确实能“走完整个模型”
      const bb = targetBoxRef.current
      const min = bb.min
      const max = bb.max
      const corners = [
        [min.x, min.y, min.z],
        [min.x, min.y, max.z],
        [min.x, max.y, min.z],
        [min.x, max.y, max.z],
        [max.x, min.y, min.z],
        [max.x, min.y, max.z],
        [max.x, max.y, min.z],
        [max.x, max.y, max.z],
      ]
      let minAlong = Infinity
      let maxAlong = -Infinity
      for (const c of corners) {
        const along = axis.x * c[0] + axis.y * c[1] + axis.z * c[2]
        if (along < minAlong) minAlong = along
        if (along > maxAlong) maxAlong = along
      }
      if (!Number.isFinite(minAlong) || !Number.isFinite(maxAlong) || maxAlong <= minAlong) {
        minAlong = -1
        maxAlong = 1
      }
      targetFxMat.minAlong = minAlong
      targetFxMat.maxAlong = maxAlong
    }
    let triggered = false


    if (manualTrigger && manualTrigger.id !== lastManualTriggerIdRef.current) {
      lastManualTriggerIdRef.current = manualTrigger.id
      triggered = true
      const colorA = tmpColorARef.current
      const colorB = tmpColorBRef.current
      colorA.set(manualTrigger.color || '#2fd5ff')
      colorB.copy(colorA).multiplyScalar(shaderCfg.darkFactor ?? 0.22)
      targetFxMat.sweepColor.copy(colorA)
      targetFxMat.baseColor.copy(colorB)
    }

    // 只在“碰撞进入”时触发一次特效
    let triggerMat = null
    for (const mover of movers) {
      const mesh = mover.meshRef.current
      if (!mesh) continue

      mover.boxRef.current.setFromObject(mesh)
      const isColliding = mover.boxRef.current.intersectsBox(targetBoxRef.current)
      const wasColliding = mover.stateRef.current
      mover.stateRef.current = isColliding

      if (isColliding && !wasColliding) {
        triggerMat = mover.matRef.current
      }
    }

    if (triggerMat && !triggered) {
      const colorA = tmpColorARef.current
      const colorB = tmpColorBRef.current
      if (triggerMat?.color) {
        colorA.copy(triggerMat.color)
      } else {
        colorA.set('#2fd5ff')
      }
      colorB.copy(colorA).multiplyScalar(shaderCfg.darkFactor ?? 0.22)
      targetFxMat.sweepColor.copy(colorA)
      targetFxMat.baseColor.copy(colorB)
      triggered = true
    }

    if (triggered) {
      effectStartRef.current = state.clock.elapsedTime
      effectPlayingRef.current = true
      targetFx.visible = true
      targetFxMat.opacity = effectCfg.startOpacity ?? 0.95
      targetFxMat.sweepIntensity = effectCfg.startSweepIntensity ?? 2.0
    }

    if (!effectPlayingRef.current) return

    const t = state.clock.elapsedTime - effectStartRef.current
    const duration = Math.max(0.0001, effectCfg.duration ?? 1.2)
    const progress = Math.min(t / duration, 1)
    targetFxMat.time = t
    const startOpacity = effectCfg.startOpacity ?? 0.95
    const startSweepIntensity = effectCfg.startSweepIntensity ?? 2.0
    const endSweepIntensity = effectCfg.endSweepIntensity ?? 1.0
    targetFxMat.opacity = startOpacity * (1 - progress)
    targetFxMat.sweepIntensity =
      startSweepIntensity + (endSweepIntensity - startSweepIntensity) * progress

    if (progress >= 1) {
      effectPlayingRef.current = false
      targetFx.visible = false
      targetFxMat.opacity = 0.0
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <HitEffectBox
        baseRef={targetBaseRef}
        fxRef={targetFxRef}
        fxMatRef={targetFxMatRef}
        renderBase={() => (
          // 使用 GLB 作为目标外观，碰撞检测仍走 targetBaseRef 包围盒
          <GlbModel
            url={carGlbUrl}
            scale={0.02}
            position={[0.45, -0.45, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
        )}
        renderFx={({ fxMatRef }) => (
          <GlbModel
            url={carGlbUrl}
            material={fxMatRef.current}
            scale={0.02}
            position={[0.45, -0.45, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
        )}
      />

      <DraggableBox
        meshRef={meshARef}
        materialRef={movableMatARef}
        position={[2, 0, 0]}
        color="hotpink"
        dragState={dragState}
      />
      <DraggableBox
        meshRef={meshBRef}
        materialRef={movableMatBRef}
        position={[-2, 0, 0]}
        color="limegreen"
        dragState={dragState}
      />
    </>
  )
}
