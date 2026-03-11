import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface PanicButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Large, high-visibility panic button. Scales down on press for tactile feedback.
 */
export function PanicButton({ onPress, disabled = false }: PanicButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Panic button — tap to trigger an emergency alert"
      >
        <Text style={styles.icon}>🆘</Text>
        <Text style={styles.label}>PANIC</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#cc0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ff4444',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
    gap: 4,
  },
  disabled: {
    backgroundColor: '#660000',
    borderColor: '#880000',
    shadowOpacity: 0.2,
  },
  icon: {
    fontSize: 30,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
