import { useState, useRef, useCallback } from 'react';
import { Coordinate } from '../components/MapComponent';
import type MapView from 'react-native-maps';

export type RouteInfo = {
  distance: number;
  duration: number;
};

export type MapState = {
  userLocation: Coordinate | null;
  destination: Coordinate | null;
  routeCoordinates: Coordinate[];
  routeInfo: RouteInfo | null;
  currentAddress: string;
  destinationAddress: string;
};

export function useMapNavigation() {
  const mapRef = useRef<MapView>(null);
  
  const [mapState, setMapState] = useState<MapState>({
    userLocation: null,
    destination: null,
    routeCoordinates: [],
    routeInfo: null,
    currentAddress: '',
    destinationAddress: '',
  });

  const updateUserLocation = useCallback((location: Coordinate | null, address?: string) => {
    setMapState(prev => ({
      ...prev,
      userLocation: location,
      currentAddress: address || prev.currentAddress,
    }));
  }, []);

  const setDestination = useCallback((destination: Coordinate, address?: string) => {
    setMapState(prev => ({
      ...prev,
      destination,
      destinationAddress: address || prev.destinationAddress,
    }));
  }, []);

  const setRoute = useCallback((coordinates: Coordinate[], routeInfo?: RouteInfo) => {
    setMapState(prev => ({
      ...prev,
      routeCoordinates: coordinates,
      routeInfo: routeInfo || prev.routeInfo,
    }));
  }, []);

  const clearDestination = useCallback(() => {
    setMapState(prev => ({
      ...prev,
      destination: null,
      destinationAddress: 'Куда?',
      routeCoordinates: [],
      routeInfo: null,
    }));
  }, []);

  const resetMap = useCallback(() => {
    setMapState({
      userLocation: null,
      destination: null,
      routeCoordinates: [],
      routeInfo: null,
      currentAddress: '',
      destinationAddress: '',
    });
  }, []);

  // Центрирование карты на пользователе
  const centerMapOnUser = useCallback(() => {
    if (mapState.userLocation && mapRef.current) {
      const region = {
        ...mapState.userLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [mapState.userLocation]);

  // Подгон карты под маркеры
  const fitMapToMarkers = useCallback(() => {
    if (mapState.userLocation && mapState.destination && mapRef.current) {
      const coordinates = [mapState.userLocation, mapState.destination];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  }, [mapState.userLocation, mapState.destination]);

  // Подгон карты под маршрут
  // В useMapNavigation.ts обновим fitMapToRoute
const fitMapToRoute = useCallback(() => {
  if (mapState.routeCoordinates.length > 0 && mapRef.current) {
    mapRef.current.fitToCoordinates(mapState.routeCoordinates, {
      edgePadding: { 
        top: 100, 
        right: 50, 
        bottom: 300, // Увеличиваем снизу чтобы не перекрывало панель
        left: 50 
      },
      animated: true,
    });
  }
}, [mapState.routeCoordinates]);

  // Расчет маршрута через OSRM API
  const calculateRoute = useCallback(async (start: Coordinate, end: Coordinate) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();
  
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          longitude: coord[0],
          latitude: coord[1],
        }));
        
        setRoute(coordinates, {
          distance: route.distance,
          duration: route.duration,
        });
        
        // Гарантированное выравнивание после установки состояния
        setTimeout(() => {
          if (mapRef.current && coordinates.length > 0) {
            console.log('🗺️ Fitting map to route coordinates:', coordinates.length);
            mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      const distance = calculateDistance(start, end);
      const duration = calculateDuration(distance);
      
      setRoute([start, end], { distance, duration });
      
      // Выравнивание по маркерам при ошибке
      setTimeout(() => {
        if (mapRef.current && start && end) {
          console.log('🗺️ Fitting map to markers (fallback)');
          mapRef.current.fitToCoordinates([start, end], {
            edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
            animated: true,
          });
        }
      }, 300);
    }
  }, [setRoute, mapRef]);
  
  
  // Вспомогательные функции
  const calculateDistance = (start: Coordinate, end: Coordinate): number => {
    const R = 6371e3;
    const φ1 = (start.latitude * Math.PI) / 180;
    const φ2 = (end.latitude * Math.PI) / 180;
    const Δφ = ((end.latitude - start.latitude) * Math.PI) / 180;
    const Δλ = ((end.longitude - start.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateDuration = (distance: number): number => {
    const averageSpeed = 40;
    return (distance / 1000) / averageSpeed * 3600;
  };

  return {
    mapState,
    mapRef,
    updateUserLocation,
    setDestination,
    setRoute,
    clearDestination,
    resetMap,
    centerMapOnUser,
    fitMapToMarkers,
    fitMapToRoute,
    calculateRoute,
  };
}

export default useMapNavigation;