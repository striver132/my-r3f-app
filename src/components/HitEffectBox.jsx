import * as THREE from 'three'

export default function HitEffectBox({
  baseRef,
  fxRef,
  fxMatRef,
  renderBase,
  renderFx,
}) {
  return (
    <>
      {/* 常驻外观层：支持外部传入任意模型/几何体 */}
      <group ref={baseRef} position={[0, 0, 0]}>
        {renderBase ? (
          renderBase()
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="royalblue" />
          </mesh>
        )}
      </group>

      {/* 碰撞特效层：默认是 box + textMaterial，也可外部替换 */}
      <group ref={fxRef} position={[0, 0, 0]} visible={false}>
        {renderFx ? (
          renderFx({ fxMatRef })
        ) : (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <textMaterial
              ref={fxMatRef}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
      </group>
    </>
  )
}
