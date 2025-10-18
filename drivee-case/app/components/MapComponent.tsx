import React, { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
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

  const DARK_OSM_TILE = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
  const LIGHT_OSM_TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  const initialRegion: Region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mapStyle = useMemo(() => 
    colorScheme === 'dark' ? [
      {
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }]
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#242f3e" }]
      }
    ] : [], 
    [colorScheme]
  );

  const tileUrl = useMemo(() => 
    colorScheme === 'dark' ? DARK_OSM_TILE : LIGHT_OSM_TILE,
    [colorScheme]
  );

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
        showsMyLocationButton={false}
        mapPadding={mapPadding}
        onMapReady={onMapReady}
        onRegionChangeComplete={onRegionChange}
        customMapStyle={mapStyle}
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
    </View>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;