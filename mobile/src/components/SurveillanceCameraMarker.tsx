import React from 'react';
import { Callout, Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';
import { SurveillanceCamera } from '../types';

interface SurveillanceCameraMarkerProps {
  camera: SurveillanceCamera;
}

/**
 * Map marker for a surveillance camera node from the Overpass API.
 */
export function SurveillanceCameraMarker({ camera }: SurveillanceCameraMarkerProps) {
  const cameraName = camera.tags.name ?? camera.tags.description ?? `Camera #${camera.id}`;

  return (
    <Marker
      key={camera.id}
      coordinate={{ latitude: camera.lat, longitude: camera.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {/* Custom cyan camera icon */}
      <View style={styles.markerContainer}>
        <Text style={styles.markerIcon}>📷</Text>
      </View>

      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>Surveillance Camera</Text>
          <Text style={styles.calloutBody}>{cameraName}</Text>
          {camera.tags.operator ? (
            <Text style={styles.calloutMeta}>Operator: {camera.tags.operator}</Text>
          ) : null}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#00e5ff',
    padding: 4,
  },
  markerIcon: {
    fontSize: 16,
  },
  callout: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#00e5ff',
    minWidth: 160,
  },
  calloutTitle: {
    color: '#00e5ff',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  calloutBody: {
    color: '#ffffff',
    fontSize: 12,
  },
  calloutMeta: {
    color: '#aaaaaa',
    fontSize: 11,
    marginTop: 2,
  },
});
