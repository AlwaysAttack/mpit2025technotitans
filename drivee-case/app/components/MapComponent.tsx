import React, { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import MapView, { UrlTile, Marker, Polyline, type Region } from 'react-native-maps';
import { useColorScheme } from 'nativewind';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteInfo = {
  distance: number;
  duration: number;
};

export type MapData = {
  userLocation: Coordinate | null;
  destination: Coordinate | null;
  routeCoordinates: Coordinate[];
  routeInfo: RouteInfo | null;
  currentAddress: string;
  destinationAddress: string;
};

interface MapComponentProps {
  data: MapData;
  onMapReady?: () => void;
  onRegionChange?: (region: Region) => void;
  style?: any;
  showUserLocation?: boolean;
  mapPadding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const MapComponent = forwardRef<MapView, MapComponentProps>(({
  data,
  onMapReady,
  onRegionChange,
  style,
  showUserLocation = true,
  mapPadding = { top: 0, bottom: 0, left: 0, right: 0 }
}, ref) => {
  const { colorScheme } = useColorScheme();
  const { userLocation, destination, routeCoordinates, currentAddress, destinationAddress } = data;

  // Альтернативные OSM тайлы для мобильных приложений
  const DARK_OSM_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
  const LIGHT_OSM_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

  const initialRegion: Region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const tileUrl = useMemo(() => colorScheme === 'dark' ? DARK_OSM_TILE : LIGHT_OSM_TILE, [colorScheme]);

  const getCurrentRegion = (): Region => {
    if (userLocation) {
      return {
        ...userLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    return initialRegion;
  };

  const isValidCoordinate = (coord: Coordinate | null): coord is Coordinate => {
    return coord !== null &&
      typeof coord.latitude === 'number' &&
      typeof coord.longitude === 'number' &&
      !isNaN(coord.latitude) &&
      !isNaN(coord.longitude);
  };

  return (
    <View style={style}>
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        region={getCurrentRegion()}
        showsUserLocation={showUserLocation}
        showsCompass={true}
        showsScale={true}
        mapPadding={mapPadding}
        onMapReady={onMapReady}
        onRegionChangeComplete={onRegionChange}
      >
        <UrlTile
          urlTemplate={tileUrl}
          maximumZ={19}
          flipY={false}
        />

        {isValidCoordinate(userLocation) && (
          <Marker
            coordinate={userLocation}
            title="Ваше местоположение"
            description={currentAddress}
          />
        )}

        {isValidCoordinate(destination) && (
          <Marker
            coordinate={destination}
            title="Пункт назначения"
            description={destinationAddress}
            pinColor="red"
          />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates.filter(isValidCoordinate)}
            strokeColor="#3B82F6"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Лицензия OSM */}
      <View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.7)', padding: 3, borderRadius: 3 }}>
        <Text style={{ fontSize: 10 }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
