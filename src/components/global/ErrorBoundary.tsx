import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@theme/index';
import PrimaryButton from './PrimaryButton';

type Props = React.PropsWithChildren<{ fallbackTitle?: string }>;
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled application error', error, info.componentStack);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.fallbackTitle ?? 'Something went wrong'}</Text>
        <Text style={styles.message}>
          The application hit an unexpected error. You can retry without losing locally stored attendance data.
        </Text>
        {this.state.error?.message ? <Text style={styles.detail}>{this.state.error.message}</Text> : null}
        <PrimaryButton title="Try again" onPress={this.handleReset} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.background },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  message: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  detail: { ...typography.caption, color: colors.danger, marginBottom: spacing.xl },
});
