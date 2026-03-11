import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { IncidentIndicator } from '../components/IncidentIndicator';
import { PanicButton } from '../components/PanicButton';
import { SurveillanceCameraMarker } from '../components/SurveillanceCameraMarker';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { useIncidentDetection } from '../hooks/useIncidentDetection';
import { useLocation } from '../hooks/useLocation';
import { fetchNearbyCameras } from '../services/overpass';
import { SurveillanceCamera } from '../types';

const MAP_INITIAL_ZOOM_DELTA = 0.01;

/**
 * Main Safety HUD screen. Displays:
 *  - Full-screen map with user location and surveillance camera overlays
 *  - G-force / incident status bar
 *  - Panic button
 *  - Red alert overlay when an incident is active
 */
export function SafetyHUDScreen() {
  const { data: accelData, totalG } = useAccelerometer();
  const { location, error: locationError } = useLocation();
  const { isAlerting, lastIncident, triggerPanic } = useIncidentDetection({ totalG, location });

  const [cameras, setCameras] = useState<SurveillanceCamera[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isPanicking, setIsPanicking] = useState(false);

  const mapRef = useRef<MapView>(null);
  const alertOverlayOpacity = useRef(new Animated.Value(0)).current;

  // Animate the red alert overlay
  useEffect(() => {
    Animated.timing(alertOverlayOpacity, {
      toValue: isAlerting ? 0.35 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isAlerting, alertOverlayOpacity]);

  // Fetch nearby cameras whenever location changes (throttled by 50 m movement)
  const lastCameraFetchRef = useRef<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    if (!location) return;

    const prev = lastCameraFetchRef.current;
    if (prev) {
      const dist = Math.sqrt(
        Math.pow(location.latitude - prev.lat, 2) + Math.pow(location.longitude - prev.lon, 2),
      );
      // Skip fetch if moved less than the configured threshold
      if (dist < INCIDENT_THRESHOLDS.CAMERA_FETCH_DISTANCE_THRESHOLD_DEG) return;
    }

    lastCameraFetchRef.current = { lat: location.latitude, lon: location.longitude };

    fetchNearbyCameras(location.latitude, location.longitude)
      .then(setCameras)
      .catch((err) => setCameraError(String(err)));
  }, [location]);

  const handlePanic = async () => {
    setIsPanicking(true);
    await triggerPanic();
    setTimeout(() => setIsPanicking(false), INCIDENT_THRESHOLDS.PANIC_BUTTON_COOLDOWN_MS);
  };

  const mapRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: MAP_INITIAL_ZOOM_DELTA,
        longitudeDelta: MAP_INITIAL_ZOOM_DELTA,
      }
    : undefined;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* ── Map ── */}
      {mapRegion ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={mapRegion}
          customMapStyle={darkMapStyle}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
        >
          {/* User location marker */}
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.userMarker, isAlerting && styles.userMarkerAlert]} />
            </Marker>
          )}

          {/* Surveillance camera markers */}
          {cameras.map((cam) => (
            <SurveillanceCameraMarker key={cam.id} camera={cam} />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            {locationError ?? 'Acquiring GPS signal…'}
          </Text>
        </View>
      )}

      {/* ── Red alert overlay ── */}
      <Animated.View
        style={[styles.alertOverlay, { opacity: alertOverlayOpacity }]}
        pointerEvents="none"
      />

      {/* ── HUD chrome ── */}
      <SafeAreaView style={styles.hud} pointerEvents="box-none">
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>UVISION</Text>
          <IncidentIndicator isAlerting={isAlerting} totalG={totalG} />
        </View>

        {/* Accelerometer debug row */}
        <View style={styles.accelRow}>
          <Text style={styles.accelLabel}>
            X: <Text style={styles.accelValue}>{accelData.x.toFixed(2)}</Text>
          </Text>
          <Text style={styles.accelLabel}>
            Y: <Text style={styles.accelValue}>{accelData.y.toFixed(2)}</Text>
          </Text>
          <Text style={styles.accelLabel}>
            Z: <Text style={styles.accelValue}>{accelData.z.toFixed(2)}</Text>
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} pointerEvents="none" />

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Camera count badge */}
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraBadgeIcon}>📷</Text>
            <Text style={styles.cameraBadgeText}>{cameras.length}</Text>
          </View>

          {/* Panic button */}
          <PanicButton onPress={handlePanic} disabled={isPanicking} />

          {/* Last incident info */}
          {lastIncident ? (
            <View style={styles.lastIncidentBadge}>
              <Text style={styles.lastIncidentLabel}>LAST EVENT</Text>
              <Text style={styles.lastIncidentType}>{lastIncident.incident_type.toUpperCase()}</Text>
              <Text style={styles.lastIncidentG}>{lastIncident.max_g_force.toFixed(2)} G</Text>
            </View>
          ) : (
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeText}>—</Text>
            </View>
          )}
        </View>

        {/* Error banners */}
        {(locationError ?? cameraError) ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{locationError ?? cameraError}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  mapPlaceholderText: {
    color: '#666666',
    fontSize: 16,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ff0000',
  },
  hud: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  appTitle: {
    color: '#00e5ff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  accelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  accelLabel: {
    color: '#888888',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  accelValue: {
    color: '#cccccc',
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraBadge: {
    width: 72,
    alignItems: 'center',
    gap: 4,
  },
  cameraBadgeIcon: {
    fontSize: 22,
  },
  cameraBadgeText: {
    color: '#00e5ff',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  lastIncidentBadge: {
    width: 72,
    alignItems: 'center',
    gap: 2,
  },
  lastIncidentLabel: {
    color: '#888888',
    fontSize: 9,
    letterSpacing: 1,
  },
  lastIncidentType: {
    color: '#ff4444',
    fontSize: 11,
    fontWeight: '700',
  },
  lastIncidentG: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  userMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#00e676',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userMarkerAlert: {
    backgroundColor: '#ff2222',
    borderColor: '#ffaaaa',
  },
  errorBanner: {
    backgroundColor: 'rgba(200,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Dark map style (Google Maps)
// ─────────────────────────────────────────────────────────────────────────────

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c3e50' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];
