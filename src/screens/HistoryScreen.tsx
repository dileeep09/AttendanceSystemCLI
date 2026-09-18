import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import SearchInput from '@globalComponents/SearchBar';
import Card from '@globalComponents/Card';
import Screen from '@globalComponents/Screen';
import { useAppData } from '@contexts/AppDataContext';
import { colors, spacing, typography } from '@theme/index';
import { formatDateTime, formatDistance } from '@utils/format';

export default function HistoryScreen() {
  const { attendance } = useAppData();
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return attendance;
    return attendance.filter(record =>
      formatDateTime(record.checkedInAt).toLowerCase().includes(normalized) ||
      formatDistance(record.distanceMeters).toLowerCase().includes(normalized),
    );
  }, [attendance, query]);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HISTORY</Text>
        <Text style={styles.title}>Attendance records</Text>
        <Text style={styles.subtitle}>{attendance.length} locally stored check-in{attendance.length === 1 ? '' : 's'}</Text>
      </View>

      <View style={styles.search}><SearchInput value={query} onChangeText={setQuery} placeholder="Search attendance" /></View>

      <FlatList
        data={filteredRecords}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredRecords.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card>
            <Ionicons name="calendar-outline" size={28} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>{query ? 'No matching records' : 'No attendance yet'}</Text>
            <Text style={styles.emptyText}>{query ? 'Try a different search term.' : 'Once you check in, your attendance will appear here.'}</Text>
          </Card>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.record}>
            <View style={styles.iconBox}><Ionicons name="checkmark-circle" size={22} color={colors.success} /></View>
            <View style={styles.recordCopy}>
              <Text style={styles.recordTitle}>Checked in</Text>
              <Text style={styles.recordDate}>{formatDateTime(item.checkedInAt)}</Text>
              <Text style={styles.recordMeta}>{formatDistance(item.distanceMeters)} from office · GPS {item.accuracyMeters ? `±${Math.round(item.accuracyMeters)}m` : '—'}</Text>
            </View>
            <Text style={styles.index}>#{attendance.length - index}</Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  eyebrow: { ...typography.caption, color: colors.primary, letterSpacing: 1.2 },
  title: { ...typography.title, color: colors.text, marginTop: 3 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  search: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl },
  emptyList: { padding: spacing.lg, paddingTop: spacing.md },
  record: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  recordCopy: { flex: 1, marginLeft: spacing.md },
  recordTitle: { ...typography.bodyMedium, color: colors.text },
  recordDate: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  recordMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  index: { ...typography.caption, color: colors.textSecondary },
  emptyTitle: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
