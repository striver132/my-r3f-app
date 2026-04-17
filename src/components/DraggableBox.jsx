export default function DraggableBox({
  meshRef,
  materialRef,
  position,
  color,
  dragState,
}) {
  const { isDraggingRef, activeMeshRef, planeRef, offsetRef, tmpVec3Ref } = dragState

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        isDraggingRef.current = true
        activeMeshRef.current = meshRef.current
        e.target?.setPointerCapture?.(e.pointerId)

        const mesh = activeMeshRef.current
        if (!mesh) return

        // 锁定当前高度平面，保证拖拽时只在水平面移动
        planeRef.current.set(planeRef.current.normal, -mesh.position.y)
        const hit = e.ray.intersectPlane(planeRef.current, tmpVec3Ref.current)
        if (!hit) return

        // 记录鼠标命中点与物体中心的偏移，避免拖拽瞬间跳动
        offsetRef.current.copy(hit).sub(mesh.position)
      }}
      onPointerMove={(e) => {
        if (!isDraggingRef.current) return
        if (activeMeshRef.current !== meshRef.current) return
        e.stopPropagation()

        const mesh = activeMeshRef.current
        if (!mesh) return

        const hit = e.ray.intersectPlane(planeRef.current, tmpVec3Ref.current)
        if (!hit) return

        mesh.position.copy(hit).sub(offsetRef.current)
      }}
      onPointerUp={(e) => {
        if (activeMeshRef.current === meshRef.current) {
          isDraggingRef.current = false
          activeMeshRef.current = null
        }
        e.target?.releasePointerCapture?.(e.pointerId)
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial ref={materialRef} color={color} />
    </mesh>
  )
}
