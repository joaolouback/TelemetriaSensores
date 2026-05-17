import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants';

interface SensorCardProps {
  title: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Reusable card component for displaying sensor data.
 */
export function SensorCard({
  title,
  color = COLORS.primary,
  icon,
  isActive,
  children,
  style,
}: SensorCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </View>
        {isActive !== undefined && (
          <View style={[styles.indicator, { backgroundColor: isActive ? COLORS.success : COLORS.textMuted }]} />
        )}
      </View>
      <View style={[styles.accent, { backgroundColor: color }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  color?: string;
}

/**
 * Single data row inside a SensorCard.
 */
export function DataRow({ label, value, color }: DataRowProps) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  accent: {
    height: 2,
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 1,
    opacity: 0.6,
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});
