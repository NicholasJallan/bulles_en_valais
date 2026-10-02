#version 300 es
// Bulles en Valais, hero surface (E1, E2). Written for this site; the only borrowed code is the
// simplex noise of webgl-noise (MIT, see noise.glsl), inserted at the #include line below.
//
// Above the water line: the photo, with the lake moving in it. Every water pixel is traced back to
// its point of the lake, in metres (src/lib/webgl/lake.ts: the camera calibrated on the photo and
// the swisstopo orthophoto), so that the wind ripples and the rings of the pointer live on the
// water and reach the screen through the perspective of the photo: wide and flat far away, round
// near the shore. Their slopes move the reflection (strongly, and mostly up and down) and the lake
// bed seen through the water (a little), weighed by Fresnel; ripples finer than the pixels that
// see them turn into a glossy blur instead of flickering. Below the water line (it rises with
// uImmersion): the same photo seen from under the surface: refracted, washed out, tinted, with
// light shafts coming down, caustics and particles in suspension.

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uImage;
uniform sampler2D uMask;
uniform float uTime;
uniform float uImmersion;
uniform vec2 uResolution;
// object-fit: cover of the <img> (src/lib/webgl/viewport.ts).
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
// Palette colours, gamma-encoded sRGB (src/lib/color/palette.ts).
uniform vec3 uTint;
uniform vec3 uDeep;
uniform vec3 uLight;

in vec2 vUv;
out vec4 fragColor;

#include <noise>

// The water line rises a little faster than the hero scrolls away, so that it crosses the whole
// screen; the margin keeps its waves out of sight at uImmersion = 0. Mirrored in hero.ts.
const float LEVEL_GAIN = 1.15;
const float LEVEL_MARGIN = 0.04;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

vec2 toImage(vec2 uv) {
  return uv * uCoverScale + uCoverOffset;
}

// Caustics: the product of two ridged noises, the first one warping the second, sharpened.
float caustics(vec2 p, float t) {
  float warp = snoise(vec3(p * 0.6, t * 0.5));
  float a = 1.0 - abs(snoise(vec3(p + warp * 0.5, t)));
  float b = 1.0 - abs(snoise(vec3(p * 1.6 - warp * 0.3, t * 0.8 + 11.0)));
  return pow(a * b, 5.0);
}

#include <lake>

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Particles in suspension: at most one soft dot per cell, slowly sinking and twinkling.
float particles(vec2 uv, float aspect, float t) {
  vec2 p = vec2(uv.x * aspect, uv.y + t * 0.012) * 18.0;
  vec2 cell = floor(p);
  float seed = hash(cell);
  vec2 jitter = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float dist = length(fract(p) - 0.5 - jitter * 0.7);
  float size = mix(0.02, 0.06, seed);
  float twinkle = 0.5 + 0.5 * sin(t * (0.5 + seed) + seed * 6.2832);
  return step(0.55, seed) * smoothstep(size, 0.0, dist) * twinkle;
}

// Slanted shafts of daylight coming down from the surface.
float shafts(vec2 uv, float t) {
  float x = uv.x + (1.0 - uv.y) * 0.25;
  float n = snoise(vec3(x * 7.0, 0.0, t * 0.07)) * 0.5 + 0.5;
  return n * n * n * smoothstep(0.1, 1.0, uv.y);
}

vec3 sampleSoft(vec2 at, vec2 spread) {
  return texture(uImage, at).rgb * 0.4
    + texture(uImage, at + vec2(spread.x, 0.0)).rgb * 0.15
    + texture(uImage, at - vec2(spread.x, 0.0)).rgb * 0.15
    + texture(uImage, at + vec2(0.0, spread.y)).rgb * 0.15
    + texture(uImage, at - vec2(0.0, spread.y)).rgb * 0.15;
}

vec3 underwater(vec2 uv, vec2 at, float aspect, float t) {
  vec2 refraction = vec2(
    snoise(vec3(uv * 3.0, t * 0.25)),
    snoise(vec3(uv * 3.0 + 5.2, t * 0.25))
  ) * 0.01;
  vec3 color = sampleSoft(at + refraction, 2.5 / uResolution * uCoverScale);
  // Colours wash out, the water lends its own, and it darkens with depth.
  color = mix(vec3(dot(color, LUMA)), color, 0.5);
  color = mix(color, uTint, 0.55);
  color = mix(color, uDeep, 0.05 + (1.0 - uv.y) * 0.3 * uImmersion);
  color += uLight * shafts(uv, t) * 0.3;
  color += uLight * caustics(vec2(uv.x * aspect, uv.y) * 6.0, t * 0.45) * 0.16
    * smoothstep(0.2, 1.0, uv.y);
  color += uLight * particles(uv, aspect, t) * 0.4;
  return color;
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float pixel = 1.0 / max(uResolution.y, 1.0);
  vec2 imageUv = toImage(uv);
  float water = texture(uMask, imageUv).r;
  // Derivatives outside any branch: metres of lake per pixel of the screen, along x and along y.
  Lake lake = lakeAt(imageUv);
  mat2 metresPerPixel = mat2(dFdx(lake.point), dFdy(lake.point));

  float level = uImmersion * LEVEL_GAIN - LEVEL_MARGIN;
  float line = level + 0.012 * sin(uv.x * 9.0 + t * 1.1) + 0.006 * sin(uv.x * 23.0 - t * 1.7);
  float under = smoothstep(line + pixel * 1.5, line - pixel * 1.5, uv.y);

  vec3 color = texture(uImage, imageUv).rgb;
  if (water > 0.001 && under < 1.0) {
    color = mix(color, lakeColor(imageUv, lake, metresPerPixel, t), water);
  }

  if (uImmersion > 0.0) {
    color = mix(color, underwater(uv, imageUv, aspect, t), under);
    // The meniscus: a thin bright line where the surface meets the lens.
    float meniscus = exp(-pow((uv.y - line) / (pixel * 2.5), 2.0));
    color = mix(color, uLight, meniscus * 0.35);
  }
  fragColor = vec4(color, 1.0);
}
