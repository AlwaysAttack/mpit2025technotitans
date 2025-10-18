declare module '*.svg' {
    import React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
  }


// src/types/react-native-maps.d.ts
declare module 'react-native-maps/lib/sharedTypes' {
  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
  
  export interface LatLng {
    latitude: number;
    longitude: number;
  }
  
  export interface Point {
    x: number;
    y: number;
  }
}

declare module 'react-native-maps/lib/MapView.types' {
  import { ReactNode } from 'react';
  import { Region, LatLng } from './sharedTypes';
  
  export interface MapViewProps {
    region?: Region;
    initialRegion?: Region;
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    onMapReady?: () => void;
    showsUserLocation?: boolean;
    showsCompass?: boolean;
    showsScale?: boolean;
    showsMyLocationButton?: boolean;
    mapPadding?: { top: number; right: number; bottom: number; left: number };
    customMapStyle?: any[];
    children?: ReactNode;
  }
}

declare module 'react-native-maps/lib/sharedTypesInternal' {
  export interface Camera {
    center: {
      latitude: number;
      longitude: number;
    };
    pitch?: number;
    heading?: number;
    altitude?: number;
    zoom?: number;
  }
}

declare module 'react-native-maps/lib/MapViewNativeComponent' {
  import { HostComponent } from 'react-native';
  import { MapViewProps } from './MapView.types';
  
  const MapViewNativeComponent: HostComponent<MapViewProps>;
  export default MapViewNativeComponent;
}

declare module 'react-native-maps/lib/AnimatedRegion' {
  import { Animated } from 'react-native';
  import { Region } from './sharedTypes';
  
  class AnimatedRegion extends Animated.Value {
    constructor(region: Region);
    setValue(value: Region): void;
    setOffset(offset: Region): void;
    flattenOffset(): void;
    stopAnimation(callback?: (value: Region) => void): void;
    addListener(callback: (value: Region) => void): string;
    removeListener(id: string): void;
    removeAllListeners(): void;
    spring(config: any): Animated.CompositeAnimation;
    timing(config: any): Animated.CompositeAnimation;
  }
  
  export default AnimatedRegion;
}