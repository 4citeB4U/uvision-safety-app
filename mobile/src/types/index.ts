/** A recorded safety incident */
export interface Incident {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  max_g_force: number;
  incident_type: 'freefall' | 'impact' | 'panic';
}

/** Raw 3-axis accelerometer reading in G-force units */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

/** Current device location */
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

/** Surveillance camera from Overpass API */
export interface SurveillanceCamera {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

/** Overpass API response shape */
export interface OverpassResponse {
  elements: Array<{
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: Record<string, string>;
  }>;
}

/** Thresholds for incident detection */
export const INCIDENT_THRESHOLDS = {
  /** Total G-force below this value is considered freefall */
  FREEFALL_G: 0.2,
  /** Total G-force above this value is considered a high-impact event */
  IMPACT_G: 4.0,
  /** Accelerometer update interval in milliseconds (10 Hz) */
  ACCELEROMETER_INTERVAL_MS: 100,
  /** Alert display duration in milliseconds after an incident is detected */
  ALERT_DISPLAY_DURATION_MS: 5_000,
  /** Automatic detection cooldown in milliseconds (prevents Supabase flooding) */
  INCIDENT_DETECTION_COOLDOWN_MS: 10_000,
  /** Panic button lock-out duration in milliseconds after a manual trigger */
  PANIC_BUTTON_COOLDOWN_MS: 3_000,
  /** Search radius for nearby surveillance cameras in meters */
  CAMERA_SEARCH_RADIUS_M: 500,
  /** Minimum location change in degrees before re-fetching surveillance cameras (~50 m) */
  CAMERA_FETCH_DISTANCE_THRESHOLD_DEG: 0.0005,
} as const;
