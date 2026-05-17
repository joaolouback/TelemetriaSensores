import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Styled action button for start/stop/clear operations.
 */
export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ActionButtonProps) {
  const bgColor = disabled
    ? COLORS.surfaceElevated
    : variant === 'success'
    ? COLORS.success
    : variant === 'danger'
    ? COLORS.danger
    : variant === 'outline'
    ? 'transparent'
    : COLORS.primary;

  const textColor = disabled
    ? COLORS.textMuted
    : variant === 'outline'
    ? COLORS.textPrimary
    : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColor },
        variant === 'outline' && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  outline: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
