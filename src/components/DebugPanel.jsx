import { useMemo, useState } from 'react'

function Slider({ label, value, min, max, step, onChange }) {
  const display = useMemo(() => {
    if (Number.isInteger(step)) return String(value)
    const digits = String(step).includes('.') ? String(step).split('.')[1].length : 0
    return Number(value).toFixed(Math.min(3, digits))
  }, [step, value])

  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ opacity: 0.9 }}>{label}</span>
        <span style={{ opacity: 0.75, fontVariantNumeric: 'tabular-nums' }}>{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </label>
  )
}

export default function DebugPanel({
  shader,
  effect,
  setShader,
  setEffect,
  onTrigger,
}) {
  const [open, setOpen] = useState(true)
  const presets = useMemo(
    () => [
      {
        id: 'slow',
        name: '慢扫',
        shader: { speed: 0.06, bandWidth: 0.12, softness: 0.65, sweepIntensity: 1.3, baseIntensity: 0.22 },
        effect: { duration: 2.2, startOpacity: 0.95, startSweepIntensity: 2.2, endSweepIntensity: 1.1 },
      },
      {
        id: 'fast',
        name: '快扫',
        shader: { speed: 0.28, bandWidth: 0.12, softness: 0.55, sweepIntensity: 1.6, baseIntensity: 0.25 },
        effect: { duration: 0.9, startOpacity: 0.95, startSweepIntensity: 2.6, endSweepIntensity: 1.4 },
      },
      {
        id: 'narrow',
        name: '窄光带',
        shader: { speed: 0.14, bandWidth: 0.06, softness: 0.42, sweepIntensity: 2.2, baseIntensity: 0.2 },
        effect: { duration: 1.3, startOpacity: 0.95, startSweepIntensity: 3.2, endSweepIntensity: 1.8 },
      },
      {
        id: 'wide',
        name: '宽光带',
        shader: { speed: 0.12, bandWidth: 0.22, softness: 0.72, sweepIntensity: 1.1, baseIntensity: 0.28 },
        effect: { duration: 1.6, startOpacity: 0.95, startSweepIntensity: 1.8, endSweepIntensity: 0.9 },
      },
    ],
    [],
  )

  return (
    <div
      style={{
        position: 'fixed',
        top: 14,
        left: 14,
        width: 320,
        zIndex: 20,
        color: 'rgba(255,255,255,0.92)',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      <div
        style={{
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.12)',
          background:
            'linear-gradient(180deg, rgba(16,18,24,0.78) 0%, rgba(10,12,18,0.62) 100%)',
          boxShadow:
            '0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'transparent',
            border: 0,
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          <span style={{ letterSpacing: 0.2 }}>Debug / 触碰动效</span>
          <span style={{ opacity: 0.75 }}>{open ? '–' : '+'}</span>
        </button>

        {open ? (
          <div style={{ padding: 14, display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ opacity: 0.75 }}>Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setShader((s) => ({ ...s, ...p.shader }))
                      setEffect((e) => ({ ...e, ...p.effect }))
                    }}
                    style={{
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background:
                        'linear-gradient(180deg, rgba(120,190,255,0.18) 0%, rgba(120,190,255,0.08) 100%)',
                      padding: '10px 12px',
                      color: 'inherit',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ opacity: 0.75 }}>Shader</div>
              <Slider
                label="axisX"
                value={shader.axisX}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, axisX: v }))}
              />
              <Slider
                label="axisY"
                value={shader.axisY}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, axisY: v }))}
              />
              <Slider
                label="axisZ"
                value={shader.axisZ}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, axisZ: v }))}
              />
              <Slider
                label="minAlong"
                value={shader.minAlong}
                min={-5}
                max={5}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, minAlong: v }))}
              />
              <Slider
                label="maxAlong"
                value={shader.maxAlong}
                min={-5}
                max={5}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, maxAlong: v }))}
              />
              <Slider
                label="speed"
                value={shader.speed}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, speed: v }))}
              />
              <Slider
                label="bandWidth"
                value={shader.bandWidth}
                min={0}
                max={0.5}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, bandWidth: v }))}
              />
              <Slider
                label="softness"
                value={shader.softness}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, softness: v }))}
              />
              <Slider
                label="loop"
                value={shader.loop}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, loop: v }))}
              />
              <Slider
                label="baseIntensity"
                value={shader.baseIntensity}
                min={0}
                max={2}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, baseIntensity: v }))}
              />
              <Slider
                label="sweepIntensity"
                value={shader.sweepIntensity}
                min={0}
                max={5}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, sweepIntensity: v }))}
              />
              <Slider
                label="opacity"
                value={shader.opacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, opacity: v }))}
              />
              <Slider
                label="darkFactor"
                value={shader.darkFactor}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setShader((s) => ({ ...s, darkFactor: v }))}
              />
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ opacity: 0.75 }}>Effect</div>
              <Slider
                label="duration"
                value={effect.duration}
                min={0.1}
                max={4}
                step={0.01}
                onChange={(v) => setEffect((e) => ({ ...e, duration: v }))}
              />
              <Slider
                label="startOpacity"
                value={effect.startOpacity}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => setEffect((e) => ({ ...e, startOpacity: v }))}
              />
              <Slider
                label="startSweepIntensity"
                value={effect.startSweepIntensity}
                min={0}
                max={6}
                step={0.01}
                onChange={(v) =>
                  setEffect((e) => ({ ...e, startSweepIntensity: v }))
                }
              />
              <Slider
                label="endSweepIntensity"
                value={effect.endSweepIntensity}
                min={0}
                max={6}
                step={0.01}
                onChange={(v) =>
                  setEffect((e) => ({ ...e, endSweepIntensity: v }))
                }
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => onTrigger('#ff69b4')}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background:
                    'linear-gradient(180deg, rgba(255,105,180,0.28) 0%, rgba(255,105,180,0.12) 100%)',
                  padding: '10px 12px',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                播放(粉)
              </button>
              <button
                type="button"
                onClick={() => onTrigger('#32cd32')}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background:
                    'linear-gradient(180deg, rgba(50,205,50,0.26) 0%, rgba(50,205,50,0.12) 100%)',
                  padding: '10px 12px',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                播放(绿)
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
