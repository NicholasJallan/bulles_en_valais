// The schematic map of the Rhône (Places, E10): the frame of the drawing, a few points of the
// river from Sion to its mouth, and the east end of Lake Geneva. Drawn by hand from the lie of the
// valley, not a survey: no base map, so no OSM or swisstopo licence (S09).
import type { MapFrame } from '../lib/geo.ts';

type LatLng = readonly [lat: number, lng: number];

export const RHONE_FRAME: MapFrame = {
  north: 46.53,
  south: 46.06,
  west: 6.52,
  east: 7.42,
  width: 600,
};

/** The river, upstream first: Sion, the bend of Martigny, then down the Chablais to the lake. */
export const RHONE: readonly LatLng[] = [
  [46.226, 7.355],
  [46.19, 7.28],
  [46.168, 7.22],
  [46.14, 7.15],
  [46.106, 7.077],
  [46.15, 7.012],
  [46.214, 7.0],
  [46.258, 6.952],
  [46.3, 6.925],
  [46.35, 6.893],
  [46.388, 6.858],
];

/** The east end of Lake Geneva (Haut-Lac), closed into a shape. */
export const LAKE: readonly LatLng[] = [
  [46.386, 6.856],
  [46.398, 6.927],
  [46.433, 6.911],
  [46.461, 6.843],
  [46.49, 6.72],
  [46.508, 6.62],
  [46.505, 6.52],
  [46.43, 6.52],
  [46.402, 6.59],
  [46.41, 6.73],
  [46.392, 6.805],
];
