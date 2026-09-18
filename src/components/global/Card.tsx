import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@theme/index';

export default function Card({ children, style }: React.PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
