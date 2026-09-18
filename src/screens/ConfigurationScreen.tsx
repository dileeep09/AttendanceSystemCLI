import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import OfficeMap from '@components/Map/OfficeMap';
import Card from '@globalComponents/Card';
import PrimaryButton from '@globalComponents/PrimaryButton';
import Screen from '@globalComponents/Screen';
import StatusBanner from '@globalComponents/StatusBanner';
import { useAppData } from '@contexts/AppDataContext';
import { useLocation } from '@contexts/LocationContext';
import { colors, spacing, typography } from '@theme/index';
import { BuildingConfig } from '@types/domain';

export default function ConfigurationScreen() {
  const { building, saveBuilding } = useAppData();
  const { location } = useLocation();
  const [form, setForm] = useState<BuildingConfig>(() => building);
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(building), [form, building]);

  const update = <K extends keyof BuildingConfig>(key: K, value: BuildingConfig[K]) => {
    setForm(previous => ({ ...previous, [key]: value }));
  };

  const handleSave = () => {
    if (!form.companyName.trim() || !form.buildingName.trim() || !form.address.trim()) {
      Alert.alert('Missing details', 'Company name, building name and address are required.');
      return;
    }

    setSaving(true);
    saveBuilding({ ...form, updatedAt: new Date().toISOString() });
    setSaving(false);
    Alert.alert('Configuration saved', 'The office location and building details are now active.');
  };

  const useCurrentLocation = () => {
    if (!location) {
      Alert.alert('Location unavailable', 'Wait for GPS tracking to become active, then try again.');
      return;
    }
    setForm(previous => ({ ...previous, location: { latitude: location.latitude, longitude: location.longitude } }));
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CONFIGURATION</Text>
          <Text style={styles.title}>Office setup</Text>
          <Text style={styles.subtitle}>Configure the building used for attendance validation.</Text>
        </View>

        <StatusBanner type="info" title="100 meter geofence" message="The radius is fixed to the assignment requirement and is not editable." />

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Company details</Text>
          <Field label="Company name" value={form.companyName} onChangeText={value => update('companyName', value)} placeholder="e.g. Acme Technologies" />
          <Field label="Building name" value={form.buildingName} onChangeText={value => update('buildingName', value)} placeholder="e.g. Acme Tower" />
          <Field label="Address" value={form.address} onChangeText={value => update('address', value)} placeholder="Office address" multiline />
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Building location</Text>
              <Text style={styles.sectionSubtitle}>Tap anywhere on the map to place the office marker.</Text>
            </View>
            <PrimaryButton title="Use GPS" onPress={useCurrentLocation} variant="secondary" />
          </View>

          <OfficeMap
            building={form}
            selectedLocation={form.location}
            currentLocation={location}
            editable
            onSelectLocation={coordinates => update('location', coordinates)}
            height={320}
          />

          <View style={styles.coordinates}>
            <Coordinate label="Latitude" value={form.location.latitude.toFixed(6)} />
            <Coordinate label="Longitude" value={form.location.longitude.toFixed(6)} />
            <Coordinate label="Radius" value={`${form.geofenceRadiusMeters} m`} />
          </View>
        </Card>

        <PrimaryButton title="Save configuration" onPress={handleSave} loading={saving} disabled={!dirty || saving} />
        <Text style={styles.note}>Changes are stored locally with MMKV and remain available without a backend.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline = false }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, multiline && styles.multiline]}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function Coordinate({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.coordinate}>
      <Text style={styles.coordinateLabel}>{label}</Text>
      <Text style={styles.coordinateValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.lg },
  eyebrow: { ...typography.caption, color: colors.primary, letterSpacing: 1.2 },
  title: { ...typography.title, color: colors.text, marginTop: 3 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.heading, color: colors.text },
  sectionSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  field: { marginTop: spacing.lg },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, color: colors.text, backgroundColor: colors.background, fontSize: 15 },
  multiline: { minHeight: 84, paddingTop: spacing.md },
  coordinates: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  coordinate: { flex: 1 },
  coordinateLabel: { ...typography.caption, color: colors.textSecondary },
  coordinateValue: { ...typography.bodyMedium, color: colors.text, marginTop: 2 },
  note: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
});
