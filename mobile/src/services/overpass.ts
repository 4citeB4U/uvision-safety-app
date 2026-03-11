import { SurveillanceCamera, OverpassResponse, INCIDENT_THRESHOLDS } from '../types';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetches surveillance cameras near the given coordinates using the
 * OpenStreetMap Overpass API (tag: man_made=surveillance).
 */
export async function fetchNearbyCameras(
  latitude: number,
  longitude: number,
  radiusMeters: number = INCIDENT_THRESHOLDS.CAMERA_SEARCH_RADIUS_M,
): Promise<SurveillanceCamera[]> {
  const query = `
    [out:json][timeout:10];
    node["man_made"="surveillance"](around:${radiusMeters},${latitude},${longitude});
    out body;
  `;

  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
  }

  const data: OverpassResponse = await response.json();

  return data.elements
    .filter((el) => el.type === 'node' && el.lat != null && el.lon != null)
    .map((el) => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      tags: el.tags ?? {},
    }));
}
