import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import DebugPanel from './components/DebugPanel'
import Scene from './components/Scene'

export default function App() {
  const [shader, setShader] = useState({
    axisX: 1,
    axisY: 0,
    axisZ: 0,
    minAlong: -1,
    maxAlong: 1,
    speed: 0.12,
    bandWidth: 0.12,
    softness: 0.55,
    loop: 1,
    baseIntensity: 0.25,
    sweepIntensity: 1.4,
    opacity: 0.9,
    darkFactor: 0.22,
  })
  const [effect, setEffect] = useState({
    duration: 1.2,
    startOpacity: 0.95,
    startSweepIntensity: 2.0,
    endSweepIntensity: 1.0,
  })
  const [manualTrigger, setManualTrigger] = useState({ id: 0, color: '#2fd5ff' })

  return (
    <>
      <Canvas
        orthographic
        camera={{ position: [3, 3, 3], zoom: 120, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <Scene shader={shader} effect={effect} manualTrigger={manualTrigger} />
        </Suspense>
      </Canvas>
      <DebugPanel
        shader={shader}
        effect={effect}
        setShader={setShader}
        setEffect={setEffect}
        onTrigger={(color) =>
          setManualTrigger((t) => ({ id: t.id + 1, color }))
        }
      />
    </>
  )
}
