precision highp float;

uniform float uTime;
uniform float uHit;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vPos;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;

  float t = uTime;

  float stripes = sin((uv.y + t * 0.8) * 80.0) * 0.5 + 0.5;
  stripes = smoothstep(0.6, 1.0, stripes);

  float diag = sin((uv.x * 1.2 + uv.y * 0.7 - t * 0.6) * 55.0) * 0.5 + 0.5;
  diag = smoothstep(0.65, 1.0, diag);

  float noise = hash21(uv * vec2(90.0, 140.0) + t * 0.2);
  noise = smoothstep(0.7, 1.0, noise);

  float glow = 1.0 - smoothstep(0.25, 1.1, length(p));
  glow = pow(glow, 1.6);

  float laser = (stripes * 0.75 + diag * 0.65) * (0.65 + noise * 0.7);
  laser *= 0.6 + glow * 1.4;

  vec3 base = uColor;
  vec3 hit = vec3(1.0, 0.95, 0.35);
  vec3 col = mix(base, hit, clamp(uHit, 0.0, 1.0));

  vec3 finalCol = col * (0.15 + laser * 1.4) + vec3(0.05, 0.12, 0.18) * glow;
  float alpha = clamp(0.35 + laser * 0.75 + glow * 0.2, 0.0, 1.0);

  gl_FragColor = vec4(finalCol, alpha);
}
