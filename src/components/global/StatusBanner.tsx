import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme/index';

export default function StatusBanner({ type, title, message }: {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message?: string;
}) {
  const palette = {
    success: { background: colors.successSoft, foreground: colors.success },
    warning: { background: colors.warningSoft, foreground: colors.warning },
    danger: { background: colors.dangerSoft, foreground: colors.danger },
    info: { background: colors.infoSoft, foreground: colors.info },
  }[type];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: palette.foreground }]}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: spacing.md, borderRadius: 14, marginBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  copy: { flex: 1, marginLeft: spacing.sm },
  title: { ...typography.bodyMedium },
  message: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
