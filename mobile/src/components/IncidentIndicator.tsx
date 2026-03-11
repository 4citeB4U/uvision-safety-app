import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface IncidentIndicatorProps {
  isAlerting: boolean;
  totalG: number;
}

/**
 * Visual status indicator that pulses red during an alert and stays green
 * when the system is operating normally.
 */
export function IncidentIndicator({ isAlerting, totalG }: IncidentIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAlerting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isAlerting, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: isAlerting ? '#ff2222' : '#00e676' },
          { opacity: pulseAnim },
        ]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.status, { color: isAlerting ? '#ff2222' : '#00e676' }]}>
          {isAlerting ? '⚠ INCIDENT DETECTED' : '✓ MONITORING'}
        </Text>
        <Text style={styles.gForce}>{totalG.toFixed(2)} G</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  textContainer: {
    gap: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  gForce: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
});
