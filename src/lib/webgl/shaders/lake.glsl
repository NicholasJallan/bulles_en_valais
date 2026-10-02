// The lake of the hero photo (E1), inserted into surface.frag at #include <lake>, after the
// #define MAX_RIPPLES of ripples.ts (surface.ts). Every water pixel is traced back to its point of
// the lake, in metres: the same camera as src/lib/webgl/lake.ts (imageToWater), which holds the
// calibration and its tests.

uniform vec3 uLakeLens;   // aspect, focal (image heights), roll (slope of the horizon)
uniform vec3 uLakeCamera; // height above the water (m), sine and cosine of the pitch
uniform vec3 uRipples[MAX_RIPPLES]; // x, z on the water (m), age (s); negative age: empty slot
uniform vec4 uRingWave;   // wavenumber (rad/m), speeds of the crests and of the ring (m/s), lifetime (s)
uniform vec3 uWindWaves;   // wavelengths of the wind ripples (m), longest first
uniform vec3 uWindDrift;   // speed of their crests (m/s)

const float TAU = 6.2831853;
/** Lines of sight past the far shore (about 220 m) stop here. */
const float MAX_REACH = 400.0;
/** Valley wind from the north-west: towards the camera and to the left, in lake coordinates. */
const vec2 WIND = vec2(-0.6, -0.8);
const float GUST_SIZE = 30.0;
/** Typical slope of each octave of wind ripples: a calm winter day. */
const vec3 WIND_SLOPE = vec3(0.004, 0.0045, 0.005);
/** A ripple is drawn while its wavelength spans 8 pixels or more, blurred under 3. */
const vec2 RESOLVED = vec2(0.12, 0.33);
/** Steepest slope of a ring at its birth, and how it spreads and fades. */
const float RING_SLOPE = 0.24;
const float RING_WIDTH = 0.1;
const float RING_SPREAD = 0.09;
const float RING_DAMPING = 0.3;
const float RING_FALLOFF = 0.35;
/** Share of its lifetime after which a ring fades out. */
const float RING_FADE = 0.6;
/** How much the crests of the rings brighten the bed beneath them. */
const float FOCUS_GAIN = 2.4;
const float TROUGH_SHADE = 0.35;
/** 1 − 1/n: how much a tilted surface bends the view of the lake bed. */
const float REFRACTION = 0.25;
/** The bed slopes down from the shore: 10 cm of water 2 m away, then 16 cm more per metre. */
const vec3 BED = vec3(2.0, 0.1, 0.16);
/** The bed fades out under this much water (m). */
const float CLARITY = 0.8;
/** The photo already holds the blur of a calm day: only part of it is added, under the gusts. */
const float BLUR_GAIN = 0.4;
const float MAX_BLUR = 0.01;

struct Lake {
  vec2 point;    // x, z on the water (m)
  vec2 ray;      // direction of the line of sight, levelled: x right, y down (focal = 1)
  float grazing; // sine of the angle between the line of sight and the water
};

struct Waves {
  vec2 slope;     // slope of the surface the pixel shows sharply
  float variance; // slopes too fine for the pixel: they blur the reflection
  float focus;    // crests of the rings: they focus the light on the bed
};

Lake lakeAt(vec2 imageUv) {
  float aspect = uLakeLens.x;
  float focal = uLakeLens.y;
  float cosRoll = inversesqrt(1.0 + uLakeLens.z * uLakeLens.z);
  float sinRoll = uLakeLens.z * cosRoll;
  float across = (imageUv.x - 0.5) * aspect;
  float down = 0.5 - imageUv.y;
  vec2 ray = vec2(across * cosRoll + down * sinRoll, -across * sinRoll + down * cosRoll) / focal;
  float descent = ray.y * uLakeCamera.z + uLakeCamera.y;
  float reach = uLakeCamera.x / max(descent, uLakeCamera.x / MAX_REACH);
  vec2 point = vec2(ray.x, uLakeCamera.z - ray.y * uLakeCamera.y) * reach;
  return Lake(point, ray, max(descent, 0.0) / length(vec3(ray, 1.0)));
}

/** 1 while a wavelength spans enough pixels of the water, 0 once it would flicker. */
float shown(float footprint, float wavelength) {
  return 1.0 - smoothstep(RESOLVED.x, RESOLVED.y, footprint / wavelength);
}

// Wind ripples: three octaves of noise slopes, crests across the wind, drifting with it, under
// gusts (cat's paws) that wander over the lake.
void addWind(inout Waves waves, vec2 point, float footprint, float t) {
  vec2 across = vec2(-WIND.y, WIND.x);
  // Gusts about 30 m across, at their mean far away, where a pixel covers as much lake.
  float gust = 0.5 + 0.5 * snoise(vec3(point * 0.035 - WIND * t * 0.04, t * 0.03));
  gust = mix(0.5, gust, shown(footprint, GUST_SIZE));
  float strength = 0.4 + 0.9 * smoothstep(0.2, 0.85, gust);
  for (int i = 0; i < 3; i++) {
    float slope = WIND_SLOPE[i] * strength;
    float sharp = shown(footprint, uWindWaves[i]);
    waves.variance += (1.0 - sharp) * slope * slope * 0.5;
    if (sharp < 0.01) continue;
    vec2 q = vec2(dot(point, across) * 0.5, dot(point, WIND) - uWindDrift[i] * t) / uWindWaves[i];
    vec3 at = vec3(q, t * 0.15 + float(i) * 7.3);
    vec2 noise = vec2(snoise(at), snoise(at + vec3(19.1, 3.7, 0.0)));
    waves.slope += (WIND * noise.x + across * 0.35 * noise.y) * slope * sharp;
  }
}

// Rings of the pointer: a group of 12 cm ripples whose crests run through it at twice its speed
// (dispersion), widening, spreading and fading as it goes, gone before its slot is freed. The
// centre rises from nothing instead of pinching.
void addRings(inout Waves waves, vec2 point, vec2 footprint) {
  float k = uRingWave.x;
  for (int i = 0; i < MAX_RIPPLES; i++) {
    vec3 ripple = uRipples[i];
    float age = ripple.z;
    if (age < 0.0) continue;
    vec2 d = point - ripple.xy;
    float r = length(d);
    float width = RING_WIDTH + RING_SPREAD * age;
    float front = r - uRingWave.z * age;
    if (abs(front) > 3.0 * width) continue;
    float amplitude = RING_SLOPE * exp(-front * front / (width * width) - age * RING_DAMPING)
      * inversesqrt(1.0 + r / RING_FALLOFF)
      * r * inversesqrt(r * r + width * width)
      * (1.0 - smoothstep(RING_FADE * uRingWave.w, uRingWave.w, age));
    vec2 outward = d / max(r, 1e-4);
    float sharp = shown(dot(abs(outward), footprint), TAU / k);
    float phase = k * (r - uRingWave.y * age);
    waves.slope += outward * amplitude * cos(phase) * sharp;
    waves.variance += (1.0 - sharp) * amplitude * amplitude * 0.5;
    waves.focus += amplitude * sin(phase) * sharp;
  }
}

// A point of the reflection, kept on the water: past the shore, the photo shows the land itself.
vec3 mirrored(vec2 imageUv, vec2 at) {
  return texture(uImage, mix(imageUv, at, texture(uMask, at).r)).rgb;
}

// The reflection, moved by twice the tilt of the surface: mostly up and down, hardly sideways at
// a grazing angle; slopes finer than the pixel smear it vertically.
vec3 reflection(vec2 imageUv, Lake lake, Waves waves) {
  float focal = uLakeLens.y;
  float tanGrazing = lake.grazing * inversesqrt(max(1.0 - lake.grazing * lake.grazing, 1e-4));
  vec2 tilt = 2.0 * focal * vec2(
    -tanGrazing * waves.slope.x,
    waves.slope.y + lake.ray.x * waves.slope.x
  );
  vec2 at = imageUv + vec2(tilt.x / uLakeLens.x, -tilt.y);
  float blur = min(2.0 * focal * sqrt(waves.variance) * BLUR_GAIN, MAX_BLUR);
  return mirrored(imageUv, at) * 0.5
    + mirrored(imageUv, at + vec2(0.0, blur)) * 0.25
    + mirrored(imageUv, at - vec2(0.0, blur)) * 0.25;
}

// The lake bed through the water: shifted by refraction (metres on the bed, back to pixels through
// the perspective), lit by the caustics of the wind and the crests of the rings.
vec3 lakeBed(vec2 imageUv, Lake lake, Waves waves, mat2 metresPerPixel, float footprint, float t) {
  float depth = BED.y + BED.z * max(lake.point.y - BED.x, 0.0);
  float clear = exp(-depth / CLARITY);
  if (clear < 0.02) return texture(uImage, imageUv).rgb;
  vec2 pixels = inverse(metresPerPixel) * (waves.slope * depth * REFRACTION);
  vec3 color = texture(uImage, imageUv + pixels / uResolution * uCoverScale).rgb;
  // Crests gather the light on the bed in thin bright lines; troughs spread it, a little darker.
  float light = FOCUS_GAIN * (max(waves.focus, 0.0) - TROUGH_SHADE * max(-waves.focus, 0.0));
  float fine = clear * shown(footprint, 0.4);
  if (fine > 0.01) light += 0.12 * fine * caustics(lake.point * vec2(3.5, 3.0), t * 0.35);
  return color + uLight * light * clear;
}

/** The water at a pixel of the photo: lake bed and reflection, weighed by Fresnel (Schlick). */
vec3 lakeColor(vec2 imageUv, Lake lake, mat2 metresPerPixel, float t) {
  vec2 footprint = max(abs(metresPerPixel[0]), abs(metresPerPixel[1]));
  float size = length(footprint);
  Waves waves = Waves(vec2(0.0), 0.0, 0.0);
  addWind(waves, lake.point, size, t);
  addRings(waves, lake.point, footprint);
  float fresnel = 0.02 + 0.98 * pow(1.0 - lake.grazing, 5.0);
  vec3 bed = lakeBed(imageUv, lake, waves, metresPerPixel, size, t);
  return mix(bed, reflection(imageUv, lake, waves), fresnel);
}
