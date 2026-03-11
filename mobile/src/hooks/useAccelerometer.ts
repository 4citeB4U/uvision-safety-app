import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { AccelerometerData, INCIDENT_THRESHOLDS } from '../types';

/**
 * Subscribes to the device accelerometer at 10 Hz (100 ms interval).
 * Returns the latest reading and the computed total G-force magnitude.
 */
export function useAccelerometer() {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 1 });
  const [totalG, setTotalG] = useState<number>(1);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  useEffect(() => {
    Accelerometer.setUpdateInterval(INCIDENT_THRESHOLDS.ACCELEROMETER_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener((reading) => {
      const magnitude = Math.sqrt(
        reading.x * reading.x + reading.y * reading.y + reading.z * reading.z,
      );
      setData(reading);
      setTotalG(magnitude);
    });

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { data, totalG };
}
