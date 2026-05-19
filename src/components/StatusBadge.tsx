import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface StatusBadgeProps {
  label: string;
  isActive: boolean;
  activeColor?: string;
  inactiveColor?: string;
}


export function StatusBadge({
  label,
  isActive,
  activeColor = COLORS.success,
  inactiveColor = COLORS.textMuted,
}: StatusBadgeProps) {
  const bgColor = isActive ? activeColor : inactiveColor;

  return (
    <View style={[styles.badge, { backgroundColor: `${bgColor}20` }]}>
      <View style={[styles.dot, { backgroundColor: bgColor }]} />
      <Text style={[styles.label, { color: bgColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
