import { useEffect, useState } from 'react';
import * as ExpoLocation from 'expo-location';
import { LocationData } from '../types';

/**
 * Requests location permissions and subscribes to continuous GPS updates.
 * Returns the current location and a flag indicating whether permission was granted.
 */
export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscriber: ExpoLocation.LocationSubscription | null = null;

    async function startTracking() {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. UVision requires location access to function.');
        return;
      }
      setPermissionGranted(true);

      subscriber = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
      );
    }

    startTracking().catch((err) => setError(String(err)));

    return () => {
      subscriber?.remove();
    };
  }, []);

  return { location, permissionGranted, error };
}
