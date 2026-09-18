import React, { useMemo, useRef } from 'react';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { BuildingConfig, Coordinates, LocationSnapshot } from '@types/domain';
import { colors } from '@theme/index';

const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

type Props = {
  building: BuildingConfig;
  currentLocation?: LocationSnapshot | null;
  editable?: boolean;
  selectedLocation?: Coordinates;
  onSelectLocation?: (coordinates: Coordinates) => void;
  height?: number;
};

export default function OfficeMap({
  building,
  currentLocation,
  editable = false,
  selectedLocation,
  onSelectLocation,
  height = 300,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const officeLocation = selectedLocation ?? building.location;

  const initialRegion = useMemo<Region>(() => ({
    ...officeLocation,
    ...DEFAULT_DELTA,
  }), [officeLocation]);

  const animateTo = (coordinates: Coordinates) => {
    mapRef.current?.animateToRegion({ ...coordinates, ...DEFAULT_DELTA }, 350);
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={Boolean(currentLocation)}
        showsMyLocationButton
        onPress={event => {
          if (!editable || !onSelectLocation) return;
          const coordinates = event.nativeEvent.coordinate;
          onSelectLocation(coordinates);
          animateTo(coordinates);
        }}
      >
        <Circle
          center={officeLocation}
          radius={building.geofenceRadiusMeters}
          fillColor="rgba(37, 99, 235, 0.12)"
          strokeColor="rgba(37, 99, 235, 0.55)"
          strokeWidth={2}
        />
        <Marker coordinate={officeLocation} title={building.buildingName} description={`${building.geofenceRadiusMeters}m attendance geofence`} />
        {currentLocation ? (
          <Marker coordinate={currentLocation} title="Your location" pinColor={colors.success} />
        ) : null}
      </MapView>
      {editable ? <View pointerEvents="none" style={styles.hint}><View style={styles.hintDot} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  hint: { position: 'absolute', top: 12, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  hintDot: { width: 0, height: 0 },
});
