// Water temperature of the HUD, from the depth (I-05: 21 °C at the surface, 8 °C at the bottom,
// a thermocline around 15 m). Decorative but plausible: a summer day in a Valais lake.

/** [depth in metres, temperature in °C], sorted by depth. */
export const TEMPERATURE_PROFILE = [
  [0, 21],
  [5, 20],
  [10, 16],
  [15, 11],
  [20, 9],
  [30, 8],
  [40, 8],
] as const satisfies readonly (readonly [number, number])[];

/** Temperature at a depth, interpolated linearly in the table and held beyond its ends. */
export function temperatureAt(depth: number): number {
  if (Number.isNaN(depth)) throw new RangeError('A depth is a number of metres');
  const [top] = TEMPERATURE_PROFILE;
  if (depth <= top[0]) return top[1];
  for (let index = 1; index < TEMPERATURE_PROFILE.length; index += 1) {
    const [toDepth, toCelsius] = TEMPERATURE_PROFILE[index] ?? top;
    if (depth > toDepth) continue;
    const [fromDepth, fromCelsius] = TEMPERATURE_PROFILE[index - 1] ?? top;
    return fromCelsius + ((toCelsius - fromCelsius) * (depth - fromDepth)) / (toDepth - fromDepth);
  }
  return TEMPERATURE_PROFILE[TEMPERATURE_PROFILE.length - 1]?.[1] ?? top[1];
}
