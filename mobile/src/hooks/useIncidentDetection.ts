import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase';
import { Incident, INCIDENT_THRESHOLDS } from '../types';
import { LocationData } from '../types';

interface UseIncidentDetectionOptions {
  totalG: number;
  location: LocationData | null;
}

interface IncidentDetectionResult {
  isAlerting: boolean;
  lastIncident: Incident | null;
  triggerPanic: () => Promise<void>;
}

/**
 * Monitors G-force readings and triggers an incident when freefall or high
 * impact is detected. Also exposes a manual panic trigger.
 *
 * Inserts incident records into the Supabase `incidents` table.
 */
export function useIncidentDetection({
  totalG,
  location,
}: UseIncidentDetectionOptions): IncidentDetectionResult {
  const [isAlerting, setIsAlerting] = useState(false);
  const [lastIncident, setLastIncident] = useState<Incident | null>(null);

  // Cooldown flag to avoid flooding Supabase with repeated inserts
  const cooldownRef = useRef(false);

  const recordIncident = useCallback(
    async (type: 'freefall' | 'impact' | 'panic', gForce: number) => {
      if (!location) return;

      const incident: Omit<Incident, 'id'> = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
        max_g_force: gForce,
        incident_type: type,
      };

      setLastIncident(incident as Incident);
      setIsAlerting(true);

      const { error } = await supabase.from('incidents').insert(incident);
      if (error) {
        console.error('[UVision] Failed to insert incident:', error.message);
      }

      // Keep the alert visible for the configured duration
      setTimeout(() => setIsAlerting(false), INCIDENT_THRESHOLDS.ALERT_DISPLAY_DURATION_MS);
    },
    [location],
  );

  useEffect(() => {
    if (cooldownRef.current) return;

    const isFreefall = totalG < INCIDENT_THRESHOLDS.FREEFALL_G;
    const isImpact = totalG > INCIDENT_THRESHOLDS.IMPACT_G;

    if (isFreefall || isImpact) {
      cooldownRef.current = true;
      const type = isFreefall ? 'freefall' : 'impact';
      recordIncident(type, totalG).finally(() => {
        // Cooldown before the next automatic detection
        setTimeout(() => {
          cooldownRef.current = false;
        }, INCIDENT_THRESHOLDS.INCIDENT_DETECTION_COOLDOWN_MS);
      });
    }
  }, [totalG, recordIncident]);

  const triggerPanic = useCallback(async () => {
    await recordIncident('panic', totalG);
  }, [recordIncident, totalG]);

  return { isAlerting, lastIncident, triggerPanic };
}
