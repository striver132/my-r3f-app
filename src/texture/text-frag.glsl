precision highp float;

uniform float time;
uniform vec3 colorA;     // 主冷蓝
uniform vec3 colorB;     // 深蓝底色
uniform float intensity; // 发光强度
uniform float speed;     // 动画速度
uniform float scale;     // 图案尺度
uniform float opacity;   // 透明度

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

// --- 轻量噪声（不依赖纹理） ---
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

// 一条“镭射线”：越靠近线中心越亮
float laserLine(float x, float width) {
  float d = abs(fract(x) - 0.5) * 2.0;      // 0..1（0 在中心）
  float core = pow(max(0.0, 1.0 - d), 8.0); // 很尖的内核
  float glow = pow(max(0.0, 1.0 - d), 2.0); // 外发光
  return core + 0.35 * glow;
}

void main() {
  // UV 轻微扭曲，制造“镭射抖动”
  vec2 uv = vUv;
  float t = time * speed;
  float n = fbm(uv * (3.0 * scale) + vec2(0.0, t * 0.6));
  uv += (n - 0.5) * 0.03;

  // 主扫描线（横向条纹 + 时间滚动）
  float x = uv.x * (10.0 * scale) + t * 1.2;
  float stripes = laserLine(x, 0.06);

  // 叠加一组斜向干涉纹（增加“镭射干涉感”）
  float diag = (uv.x + uv.y * 0.65) * (8.0 * scale) - t * 0.9;
  float interference = laserLine(diag, 0.08);

  // 低频能量起伏（让亮度更“活”）
  float energy = 0.55 + 0.45 * sin(t * 1.7 + n * 6.2831);

  // Fresnel 边缘增亮（更像能量包裹在几何体表面）
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  float beam = (0.9 * stripes + 0.7 * interference) * energy;
  float glow = beam * (0.6 + 2.2 * fresnel);

  // 细碎闪点（“镭射颗粒”）
  float spark = smoothstep(0.92, 1.0, noise(uv * (24.0 * scale) + t * 2.5));
  glow += spark * (0.35 + 0.65 * fresnel);

  // 轻微“色散”/RGB 分离：让镭射更“电”
  float ca = (noise(uv * 6.0 + t) - 0.5) * 0.004;
  vec2 uvr = uv + vec2(ca, 0.0);
  vec2 uvg = uv;
  vec2 uvb = uv - vec2(ca, 0.0);
  float r = glow + 0.12 * laserLine((uvr.y - uvr.x) * (6.0 * scale) + t, 0.1);
  float g = glow + 0.08 * laserLine((uvg.y - uvg.x) * (6.0 * scale) + t * 1.05, 0.1);
  float b = glow + 0.16 * laserLine((uvb.y - uvb.x) * (6.0 * scale) + t * 1.1, 0.1);

  // 颜色：冷蓝系渐变 + 亮部偏青
  vec3 base = mix(colorB, colorA, clamp(glow, 0.0, 1.0));
  vec3 laser = base * vec3(0.85, 0.98, 1.25);
  vec3 col = laser * intensity;

  // 让 RGB 分离稍微影响最终色彩
  col += vec3(r * 0.18, g * 0.12, b * 0.22) * intensity;

  // 输出（建议材质使用 AdditiveBlending）
  float alpha = clamp(opacity * (0.25 + glow), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}