import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import OfficeMap from '@components/Map/OfficeMap';
import Card from '@globalComponents/Card';
import PrimaryButton from '@globalComponents/PrimaryButton';
import Screen from '@globalComponents/Screen';
import StatusBanner from '@globalComponents/StatusBanner';
import { useAppData } from '@contexts/AppDataContext';
import { useLocation } from '@contexts/LocationContext';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { AttendanceValidationError, checkIn, checkOut } from '@services/attendanceService';
import { evaluateGeofence } from '@services/geofenceService';
import { colors, spacing, typography } from '@theme/index';
import { formatDistance, formatDuration, formatDurationShort, formatTime } from '@utils/format';
import { getGreeting } from '@utils/greetings';
import { LocationStatus } from '@types/domain';

export default function AttendanceScreen() {
  const { building, attendance, addAttendance, updateAttendance } = useAppData();
  const { location, status, errorMessage, retry } = useLocation();
  const { isOffline } = useNetworkStatus();
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const geofence = useMemo(() => (location ? evaluateGeofence(location, building) : null), [location, building]);

  const activeRecord = attendance.find((record) => !record.checkedOutAt);
  const latestRecord = attendance[0];
  const elapsedMs = activeRecord ? Math.max(0, now - new Date(activeRecord.checkedInAt).getTime()) : 0;

  useEffect(() => {
    if (!activeRecord) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeRecord?.id]);

  async function openLocationSettings(): Promise<void> {
    if (Platform.OS === 'android') {
      if (status === 'permission-denied') {
        await Linking.openSettings();
        return;
      }

      if (status === 'gps-disabled') {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      }
    }
    await Linking.openSettings();
  }

  const handleAttendanceAction = () => {
    if (!activeRecord && (!location || !geofence?.inside)) return;
    setAttendanceActionLoading(true);
    try {
      if (activeRecord) {
        const record = checkOut(location, location?.accuracy ?? null);
        updateAttendance(record);
        Alert.alert(
          'Clocked out',
          `Clock out: ${formatTime(record.checkedOutAt!)}\nWorked: ${formatDurationShort(record.totalDurationMs ?? 0)}`,
        );
      } else {
        const record = checkIn(location, location.accuracy);
        addAttendance(record);
        setNow(Date.now());
        Alert.alert('Clocked in', `Clock in: ${formatTime(record.checkedInAt)}.`);
      }
    } catch (error) {
      if (error instanceof AttendanceValidationError) {
        Alert.alert(activeRecord ? 'Clock-out unavailable' : 'Clock-in unavailable', error.message);
      } else {
        Alert.alert('Attendance failed', 'Unable to save the attendance record locally.');
      }
    } finally {
      setAttendanceActionLoading(false);
    }
  };

  const statusBanner = (() => {
    if (status === 'gps-disabled') {
      return {
        type: 'warning' as const,
        title: 'Location services are off',
        message: errorMessage ?? 'Turn on Location in device settings to continue.',
      };
    }

    if (status === 'permission-denied') {
      return {
        type: 'danger' as const,
        title: 'Location permission is required',
        message: errorMessage ?? 'Allow location access in device settings to continue.',
      };
    }

    if (status === 'requesting-permission') {
      return {
        type: 'info' as const,
        title: 'Getting your location',
        message: 'Please wait while we determine your current location.',
      };
    }

    if (status === 'timeout' || status === 'error' || status === 'unavailable') {
      return {
        type: 'danger' as const,
        title: 'Unable to get your location',
        message: errorMessage ?? 'Please try again.',
      };
    }

    if (isOffline) {
      return {
        type: 'info' as const,
        title: 'Offline mode',
        message: 'Attendance records are saved locally. Map tiles may be unavailable without network access.',
      };
    }

    return null;
  })();

  const showSettingsAction = status === 'gps-disabled' || status === 'permission-denied';
  const showRetryAction = status === 'timeout' || status === 'error' || status === 'unavailable';

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ATTENDANCE</Text>
          <Text style={styles.title}>{activeRecord ? 'You are clocked in' : getGreeting()}</Text>
          <Text style={styles.subtitle}>
            {building.companyName} · {building.buildingName}
          </Text>
        </View>
        <View
          style={[
            styles.statusIcon,
            activeRecord
              ? styles.statusIconActive
              : geofence?.inside
                ? styles.statusIconInside
                : styles.statusIconOutside,
          ]}
        >
          <Ionicons
            name={activeRecord ? 'time' : geofence?.inside ? 'checkmark' : 'location-outline'}
            size={22}
            color={activeRecord ? colors.primary : geofence?.inside ? colors.success : colors.warning}
          />
        </View>
      </View>

      {statusBanner ? <StatusBanner {...statusBanner} /> : null}

      {showSettingsAction ? (
        <PrimaryButton title="Open Location Settings" onPress={() => void openLocationSettings()} variant="secondary" />
      ) : null}

      {showRetryAction ? <PrimaryButton title="Try Again" onPress={() => void retry()} variant="secondary" /> : null}

      {status === 'requesting-permission' ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>Getting your location</Text>
          <Text style={styles.loadingText}>Please wait. We need your current location to validate attendance.</Text>
        </Card>
      ) : null}

      <OfficeMap building={building} currentLocation={location} height={320} />

      <Card style={styles.locationCard}>
        <View style={styles.rowBetween}>
          <View style={styles.statusCopy}>
            <View style={styles.inline}>
              <View
                style={[styles.statusDot, { backgroundColor: geofence?.inside ? colors.success : colors.warning }]}
              />
              <Text style={styles.statusTitle}>
                {status === 'requesting-permission'
                  ? 'Waiting for location'
                  : geofence?.inside
                    ? 'Inside office geofence'
                    : 'Outside office geofence'}
              </Text>
            </View>
            <Text style={styles.distance}>{formatDistance(geofence?.distanceMeters ?? null)}</Text>
            <Text style={styles.helper}>
              {geofence
                ? `Attendance actions are available within ${building.geofenceRadiusMeters} m of the office.`
                : 'Your distance from the office will appear here once a location is available.'}
            </Text>
          </View>
          {/* <View style={styles.accuracyBlock}>
            <Text style={styles.accuracyValue}>{location?.accuracy ? `${Math.round(location.accuracy)}m` : '—'}</Text>
            <Text style={styles.accuracyLabel}>GPS accuracy</Text>
          </View> */}
        </View>
      </Card>

      {activeRecord ? (
        <Card style={styles.timerCard}>
          <Text style={styles.sectionLabel}>CURRENT SESSION</Text>
          <Text style={styles.timer}>{formatDuration(elapsedMs)}</Text>
          <Text style={styles.timerHelper}>Clocked in at {formatTime(activeRecord.checkedInAt)}</Text>
        </Card>
      ) : null}

      <PrimaryButton
        title={activeRecord ? 'Clock out' : geofence?.inside ? 'Clock in' : 'Move inside the geofence to clock in'}
        onPress={handleAttendanceAction}
        loading={attendanceActionLoading}
        disabled={
          activeRecord ? attendanceActionLoading : !geofence?.inside || attendanceActionLoading || status !== 'tracking'
        }
        variant={activeRecord ? 'danger' : 'primary'}
      />

      {status === 'tracking' && !activeRecord && !geofence?.inside ? (
        <Text style={styles.actionHint}>
          You must be within {building.geofenceRadiusMeters} m of the office to clock in.
        </Text>
      ) : null}

      <Card style={styles.lastCheckin}>
        <View style={styles.rowBetween}>
          <View style={styles.lastCopy}>
            <Text style={styles.sectionLabel}>LATEST ATTENDANCE</Text>
            {latestRecord ? (
              <>
                <Text style={styles.lastValue}>
                  {formatTime(latestRecord.checkedInAt)}
                  {latestRecord.checkedOutAt ? ` – ${formatTime(latestRecord.checkedOutAt)}` : ' – Active'}
                </Text>
                <Text style={styles.lastMeta}>
                  {latestRecord.totalDurationMs !== undefined
                    ? `Worked ${formatDurationShort(latestRecord.totalDurationMs)}`
                    : 'Currently working'}
                </Text>
              </>
            ) : (
              <Text style={styles.lastValue}>No attendance yet</Text>
            )}
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
  statusIconActive: { backgroundColor: colors.infoSoft },
  statusIconInside: { backgroundColor: colors.successSoft },
  statusIconOutside: { backgroundColor: colors.warningSoft },
  loadingCard: { alignItems: 'center', marginBottom: spacing.md },
  loadingTitle: { ...typography.bodyMedium, color: colors.text, marginTop: spacing.md },
  loadingText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
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
  timerCard: { alignItems: 'center', marginBottom: spacing.md },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, letterSpacing: 0.8 },
  timer: { fontSize: 42, lineHeight: 48, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  timerHelper: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  actionHint: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  lastCheckin: { marginTop: spacing.lg },
  lastCopy: { flex: 1 },
  lastValue: { ...typography.heading, color: colors.text, marginTop: 3 },
  lastMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  footerNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xl },
  footerText: { ...typography.caption, color: colors.textSecondary, marginLeft: spacing.xs, textAlign: 'center' },
});
