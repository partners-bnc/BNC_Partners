// ── Simplex 3D noise (Ashima / Stefan Gustavson) ──
// Compact GLSL port — public domain

export const noiseGLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Curl noise for organic drift
vec3 curlNoise(vec3 p) {
  float e = 0.1;
  float n1, n2;
  vec3 curl;

  n1 = snoise(p + vec3(0, e, 0));
  n2 = snoise(p - vec3(0, e, 0));
  float a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(0, 0, e));
  n2 = snoise(p - vec3(0, 0, e));
  float b = (n1 - n2) / (2.0 * e);

  curl.x = a - b;

  n1 = snoise(p + vec3(0, 0, e));
  n2 = snoise(p - vec3(0, 0, e));
  a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(e, 0, 0));
  n2 = snoise(p - vec3(e, 0, 0));
  b = (n1 - n2) / (2.0 * e);

  curl.y = a - b;

  n1 = snoise(p + vec3(e, 0, 0));
  n2 = snoise(p - vec3(e, 0, 0));
  a = (n1 - n2) / (2.0 * e);

  n1 = snoise(p + vec3(0, e, 0));
  n2 = snoise(p - vec3(0, e, 0));
  b = (n1 - n2) / (2.0 * e);

  curl.z = a - b;

  return curl;
}
`;

// ── Vertex Shader ──
export const vertexShader = /* glsl */ `
${noiseGLSL}

uniform float uTime;
uniform float uSize;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uLevel;
uniform float uPixelRatio;
uniform float uRadius;

attribute vec3 direction;
attribute float seed;
attribute float aSize;

varying float vAlpha;

// Perspective attenuation constant. Tuned so a resting dot renders at a few
// CSS pixels for the demo camera; the clamp below is applied in CSS space
// (before uPixelRatio) so it never silently saturates the audio size boost.
const float ATTEN = 16.0;

void main() {
  vec3 pos = position;

  // ── Idle organic drift (curl noise) ──
  // Keep drift subtle so the spherical boundary stays coherent
  float t = uTime * 0.10;
  vec3 noiseCoord = pos * 0.8 + vec3(seed * 80.0, t, t * 0.6);
  vec3 drift = curlNoise(noiseCoord) * 0.035;

  // Very subtle shimmer
  float shimmer = snoise(vec3(seed * 40.0, t * 1.5, 0.0)) * 0.012;
  drift += direction * shimmer;

  pos += drift;

  // ── Audio-driven expansion ──
  float bandReact;
  if (seed < 0.33) {
    bandReact = uBass;
  } else if (seed < 0.66) {
    bandReact = uMid;
  } else {
    bandReact = uTreble;
  }

  // Push outward along direction, scaled by band + overall level
  float expansion = bandReact * 0.45 + uLevel * 0.25;
  pos += direction * expansion;

  // ── Audio-driven jitter ──
  float jitterAmp = uLevel * 0.06;
  vec3 jitter = vec3(
    snoise(vec3(seed * 200.0, uTime * 5.0, 0.0)),
    snoise(vec3(seed * 200.0, 0.0, uTime * 5.0)),
    snoise(vec3(0.0, seed * 200.0, uTime * 5.0))
  ) * jitterAmp;
  pos += jitter;

  // ── Soft safety bound ──
  // Give the shell real room to breathe with the audio, then only rein in
  // points that overshoot far past that generous ceiling (prevents runaway
  // particles without flattening the expansion).
  float currentDist = length(pos);
  float maxRadius = uRadius * (1.15 + uLevel * 1.5);
  if (currentDist > maxRadius) {
    pos = normalize(pos) * maxRadius;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // ── Point size ──
  // Compute in CSS pixels, clamp in CSS space, THEN scale by device pixel
  // ratio. This keeps the audio size boost and per-point size visible.
  float baseSize = uSize * aSize;
  float audioSizeBoost = 1.0 + uLevel * 0.6;
  float cssSize = baseSize * audioSizeBoost * (ATTEN / -mvPosition.z);
  cssSize = clamp(cssSize, 1.0, 6.0);
  gl_PointSize = cssSize * uPixelRatio;

  gl_Position = projectionMatrix * mvPosition;

  // Normalised distance from center (original, undisplaced position)
  float dist = length(position) / uRadius;

  // Alpha: brighter in the center, dimmer (but present) at the edge
  vAlpha = mix(0.85, 0.55, smoothstep(0.3, 1.0, dist));
}
`;

// ── Fragment Shader ──
export const fragmentShader = /* glsl */ `
uniform float uLevel;

varying float vAlpha;

void main() {
  // Soft circular dot from square point sprite
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  // Discard outside circle
  if (dist > 0.5) discard;

  // Smooth soft edge
  float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
  alpha *= vAlpha;

  // Neutral greyish-white at rest; shift each grain to a light red while
  // there is active speech (driven by overall audio level).
  vec3 restColor = vec3(0.82, 0.83, 0.85);
  vec3 speakColor = vec3(1.0, 0.55, 0.55);
  float redMix = smoothstep(0.12, 0.40, uLevel);
  vec3 color = mix(restColor, speakColor, redMix);

  gl_FragColor = vec4(color, alpha);
}
`;
