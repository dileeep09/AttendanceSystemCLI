import React, { useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import OfficeMap from '@components/Map/OfficeMap';
import Card from '@globalComponents/Card';
import PrimaryButton from '@globalComponents/PrimaryButton';
import Screen from '@globalComponents/Screen';
import StatusBanner from '@globalComponents/StatusBanner';
import { useAppData } from '@contexts/AppDataContext';
import { useLocation } from '@contexts/LocationContext';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { checkIn, AttendanceValidationError } from '@services/attendanceService';
import { evaluateGeofence } from '@services/geofenceService';
import { colors, spacing, typography } from '@theme/index';
import { formatDistance, formatTime } from '@utils/format';

export default function AttendanceScreen() {
  const { building, attendance, addAttendance } = useAppData();
  const { location, status, errorMessage, retry } = useLocation();
  const { isOffline } = useNetworkStatus();
  const [checkingIn, setCheckingIn] = useState(false);

  const geofence = useMemo(
    () => location ? evaluateGeofence(location, building) : null,
    [location, building],
  );

  const latestRecord = attendance[0];

  const handleCheckIn = () => {
    if (!location || !geofence?.inside) return;
    setCheckingIn(true);
    try {
      const record = checkIn(location, location.accuracy);
      addAttendance(record);
      Alert.alert('Attendance recorded', `Checked in at ${formatTime(record.checkedInAt)}.`);
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        Alert.alert('Check-in unavailable', error.message);
      } else {
        Alert.alert('Check-in failed', 'Unable to save the attendance record locally.');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const statusBanner = (() => {
    if (status === 'permission-denied') return { type: 'danger' as const, title: 'Location permission required', message: errorMessage ?? undefined };
    if (status === 'gps-disabled') return { type: 'warning' as const, title: 'Location services are off', message: errorMessage ?? undefined };
    if (status === 'error' || status === 'unavailable') return { type: 'danger' as const, title: 'Location unavailable', message: errorMessage ?? undefined };
    if (isOffline) return { type: 'info' as const, title: 'Offline mode', message: 'Attendance records remain available locally. Map tiles may be unavailable without network access.' };
    return null;
  })();

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ATTENDANCE</Text>
          <Text style={styles.title}>Good morning</Text>
          <Text style={styles.subtitle}>{building.companyName} · {building.buildingName}</Text>
        </View>
        <View style={[styles.statusIcon, geofence?.inside ? styles.statusIconInside : styles.statusIconOutside]}>
          <Ionicons name={geofence?.inside ? 'checkmark' : 'location-outline'} size={22} color={geofence?.inside ? colors.success : colors.warning} />
        </View>
      </View>

      {statusBanner ? <StatusBanner {...statusBanner} /> : null}

      <OfficeMap building={building} currentLocation={location} height={320} />

      <Card style={styles.locationCard}>
        <View style={styles.rowBetween}>
          <View style={styles.statusCopy}>
            <View style={styles.inline}>
              <View style={[styles.statusDot, { backgroundColor: geofence?.inside ? colors.success : colors.warning }]} />
              <Text style={styles.statusTitle}>{geofence?.inside ? 'Inside office geofence' : 'Outside office geofence'}</Text>
            </View>
            <Text style={styles.distance}>{formatDistance(geofence?.distanceMeters ?? null)}</Text>
            <Text style={styles.helper}>
              {geofence ? `Check-in is allowed within ${building.geofenceRadiusMeters} m of the office.` : 'Waiting for your current GPS location.'}
            </Text>
          </View>
          <View style={styles.accuracyBlock}>
            <Text style={styles.accuracyValue}>{location?.accuracy ? `${Math.round(location.accuracy)}m` : '—'}</Text>
            <Text style={styles.accuracyLabel}>GPS accuracy</Text>
          </View>
        </View>
      </Card>

      <PrimaryButton
        title={geofence?.inside ? 'Check in now' : 'Move inside the geofence'}
        onPress={handleCheckIn}
        loading={checkingIn}
        disabled={!geofence?.inside || checkingIn || status !== 'tracking'}
      />

      {status !== 'tracking' ? (
        <PrimaryButton title="Refresh location" onPress={() => void retry()} variant="secondary" />
      ) : null}

      <Card style={styles.lastCheckin}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.sectionLabel}>LATEST CHECK-IN</Text>
            <Text style={styles.lastValue}>{latestRecord ? formatTime(latestRecord.checkedInAt) : 'No check-in yet'}</Text>
          </View>
          <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
        </View>
      </Card>

      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.footerText}>Attendance is validated on-device using GPS and saved locally.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  eyebrow: { ...typography.caption, color: colors.primary, letterSpacing: 1.2 },
  title: { ...typography.title, color: colors.text, marginTop: 3 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  statusIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusIconInside: { backgroundColor: colors.successSoft },
  statusIconOutside: { backgroundColor: colors.warningSoft },
  locationCard: { marginTop: spacing.lg, marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusCopy: { flex: 1, paddingRight: spacing.md },
  inline: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginRight: spacing.sm },
  statusTitle: { ...typography.bodyMedium, color: colors.text },
  distance: { fontSize: 30, lineHeight: 36, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  helper: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  accuracyBlock: { alignItems: 'flex-end' },
  accuracyValue: { ...typography.bodyMedium, color: colors.text },
  accuracyLabel: { ...typography.caption, color: colors.textSecondary },
  lastCheckin: { marginTop: spacing.lg },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.8 },
  lastValue: { ...typography.heading, color: colors.text, marginTop: 3 },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.xs, textAlign: 'center' },
});
