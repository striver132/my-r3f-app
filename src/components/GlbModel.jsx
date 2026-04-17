import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

export default function GlbModel({ url, material, ...props }) {
  const { scene } = useGLTF(url)

  // 克隆场景，避免多个实例共享同一对象导致状态互相影响
  const clonedScene = useMemo(() => {
    const cloned = clone(scene)
    if (material) {
      cloned.traverse((obj) => {
        if (obj.isMesh) obj.material = material
      })
    }
    return cloned
  }, [scene, material])

  return <primitive object={clonedScene} {...props} />
}
