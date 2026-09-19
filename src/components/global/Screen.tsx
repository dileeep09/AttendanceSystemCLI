import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@theme/index';

export default function Screen({ children, scroll = true }: React.PropsWithChildren<{ scroll?: boolean }>) {
  if (!scroll) {
    return <SafeAreaView edges={['top',]} style={styles.safe}>{children}</SafeAreaView>;
  }
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
});
