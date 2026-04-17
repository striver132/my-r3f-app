precision highp float;

uniform float time;

// 扫光控制
uniform vec3 axisWorld;     // 世界空间方向（单位向量）
uniform float minAlong;     // 包围盒投影 min
uniform float maxAlong;     // 包围盒投影 max
uniform float speed;        // 移动速度（建议 0.05~0.25）
uniform float bandWidth;    // 光带宽度（0~1，建议 0.08~0.18）
uniform float softness;     // 边缘柔和（建议 0.35~0.7）
uniform float loop;         // 1.0 循环；0.0 走到头就停

// 颜色
uniform vec3 baseColor;     // 车漆底色（或你希望的暗底）
uniform vec3 sweepColor;    // 扫光颜色（冷蓝/白）
uniform float baseIntensity; // 底色亮度
uniform float sweepIntensity;// 扫光亮度
uniform float opacity;

varying vec3 vWorldPos;
varying vec3 vWorldNormal;

float sat1(float x) { return clamp(x, 0.0, 1.0); }

// 三角形光带（中心最亮，两侧衰减），width 控制半宽
float bandTri(float x, float center, float width) {
  float d = abs(x - center);
  return sat1(1.0 - d / max(width, 1e-5));
}

void main() {
  // 1) 计算点在“尾→头”轴上的归一化位置 s: [0..1]
  float along = dot(vWorldPos, normalize(axisWorld));
  float denom = max(maxAlong - minAlong, 1e-5);
  float s = (along - minAlong) / denom;

  // 2) 光带中心随时间移动：0→1（可循环）
  float p = time * speed;
  float center = mix(sat1(p), fract(p), step(0.5, loop)); // loop=1 取 fract；loop=0 取 clamp

  // 3) 光带形状 + 柔边
  float tri = bandTri(s, center, bandWidth);
  // 让中心更尖，边缘更柔
  float core = pow(tri, mix(6.0, 2.0, sat1(softness)));
  float halo = pow(tri, 1.5) * 0.6;
  float sweep = core + halo;

  // 4) Fresnel：让扫光更贴合曲面边缘（更“打光”）
  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  sweep *= (0.75 + 1.25 * fresnel);

  // 5) 输出颜色（作为“自发光”/叠加也很好看）
  vec3 col = baseColor * baseIntensity;
  col += sweepColor * (sweep * sweepIntensity);

  float a = sat1(opacity);
  gl_FragColor = vec4(col, a);
}
