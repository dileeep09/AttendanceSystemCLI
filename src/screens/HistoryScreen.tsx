import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import SearchInput from '@globalComponents/SearchBar';
import Card from '@globalComponents/Card';
import Screen from '@globalComponents/Screen';
import { useAppData } from '@contexts/AppDataContext';
import { colors, spacing, typography } from '@theme/index';
import { formatDateTime, formatDistance, formatDurationShort, formatTime } from '@utils/format';

export default function HistoryScreen() {
  const { attendance } = useAppData();
  const [query, setQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return attendance;
    return attendance.filter(record =>
      formatDateTime(record.checkedInAt).toLowerCase().includes(normalized) ||
      formatDistance(record.distanceMeters).toLowerCase().includes(normalized) ||
      (record.checkedOutAt ? formatDateTime(record.checkedOutAt).toLowerCase().includes(normalized) : false),
    );
  }, [attendance, query]);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HISTORY</Text>
        <Text style={styles.title}>Attendance records</Text>
        <Text style={styles.subtitle}>{attendance.length} locally stored session{attendance.length === 1 ? '' : 's'}</Text>
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
            <Text style={styles.emptyText}>{query ? 'Try a different search term.' : 'Once you clock in, your attendance will appear here.'}</Text>
          </Card>
        }
        renderItem={({ item, index }) => (
          <Card style={styles.record}>
            <View style={[styles.iconBox, item.checkedOutAt ? styles.completedIcon : styles.activeIcon]}>
              <Ionicons name={item.checkedOutAt ? 'checkmark-circle' : 'time'} size={22} color={item.checkedOutAt ? colors.success : colors.primary} />
            </View>
            <View style={styles.recordCopy}>
              <Text style={styles.recordTitle}>{item.checkedOutAt ? 'Completed' : 'Active session'}</Text>
              <Text style={styles.recordDate}>{formatTime(item.checkedInAt)}{item.checkedOutAt ? ` – ${formatTime(item.checkedOutAt)}` : ' – In progress'}</Text>
              <Text style={styles.recordMeta}>
                {item.totalDurationMs !== undefined ? `Worked ${formatDurationShort(item.totalDurationMs)}` : `Started ${formatDateTime(item.checkedInAt)}`}
                {' · '}{formatDistance(item.distanceMeters)} from office
              </Text>
              <Text style={styles.recordMeta}>
                GPS {item.accuracyMeters ? `±${Math.round(item.accuracyMeters)}m` : '—'}
              </Text>
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
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  completedIcon: { backgroundColor: colors.successSoft },
  activeIcon: { backgroundColor: colors.infoSoft },
  recordCopy: { flex: 1, marginLeft: spacing.md },
  recordTitle: { ...typography.bodyMedium, color: colors.text },
  recordDate: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  recordMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  index: { ...typography.caption, color: colors.textSecondary },
  emptyTitle: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  emptyText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});
