import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@theme/index';

export default function SearchInput({ value, onChangeText, placeholder = 'Search' }: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, marginLeft: spacing.sm, color: colors.text, fontSize: 15 },
});
