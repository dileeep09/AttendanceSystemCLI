import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@theme/index';

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const backgroundColor = variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surface : colors.primary;
  const textColor = variant === 'secondary' ? colors.text : colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: variant === 'secondary' ? colors.border : backgroundColor },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: typography.button,
  disabled: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.99 }] },
});
