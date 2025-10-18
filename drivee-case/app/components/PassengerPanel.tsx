import React, { useEffect, useRef } from 'react';
import { View, Dimensions, Animated } from 'react-native';
import { IdlePanel } from './PassengerPanel/IdlePanel';
import { ProgressPanel } from './PassengerPanel/ProgressPanel';
import { SearchingDriverPanel } from './PassengerPanel/SearchingDriverPanel';
import { BookingState, BookingContext } from '../hooks/usePassengerPanel';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TripType = 'ride' | 'intercity' | 'courier';

interface PassengerPanelProps {
  mapState: any;
  selectedPrice: string;
  onSearchPress: () => void;
  onPricePress: () => void;
  onClearDestination: () => void;
  onTripTypeChange: (type: TripType) => void;
  onPriceSubmit: (price: number) => void;
  onStartOrder: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
  panelState: BookingState;
  sendPanel: (event: any) => void;
  panelContext: BookingContext;
}

export function PassengerPanel({
  mapState,
  selectedPrice,
  onSearchPress,
  onPricePress,
  onClearDestination,
  onTripTypeChange,
  onPriceSubmit,
  onStartOrder,
  formatDistance,
  formatDuration,
  panelState,
  sendPanel,
  panelContext
}: PassengerPanelProps) {
  // Анимационное значение для высоты
  const heightAnim = useRef(new Animated.Value(280)).current;

  const getTargetHeight = () => {
    switch (panelState) {
      case 'idle':
      case 'destination_set':
        return 280;
      case 'searching_driver':
        return SCREEN_HEIGHT - 100;
      case 'driver_assigned':
      case 'in_progress':
        return SCREEN_HEIGHT * 0.4;
      default:
        return 280;
    }
  };

  // Анимация при изменении состояния
  useEffect(() => {
    const targetHeight = getTargetHeight();
    
    // Плавное изменение высоты
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();

  }, [panelState, heightAnim]);

  const renderPanelContent = () => {
    console.log('🔄 Rendering panel content for state:', panelState);
    
    switch (panelState) {
      case 'idle':
      case 'destination_set':
        return (
          <IdlePanel
            state={panelState}
            context={panelContext}
            mapState={mapState}
            onSearchPress={onSearchPress}
            onPricePress={onPricePress}
            onClearDestination={onClearDestination}
            onTripTypeChange={onTripTypeChange}
            onStartOrder={onStartOrder}
            formatDistance={formatDistance}
            formatDuration={formatDuration}
          />
        );
      
      case 'searching_driver':
        console.log('🚗 Rendering SearchingDriverPanel');
        return (
          <SearchingDriverPanel
            startAddress={mapState.currentAddress || 'Адрес не указан'}
            endAddress={mapState.destinationAddress || 'Адрес не указан'}
            distance={mapState.routeInfo ? formatDistance(mapState.routeInfo.distance) : 'Не рассчитано'}
            duration={mapState.routeInfo ? formatDuration(mapState.routeInfo.duration) : 'Не рассчитано'}
            price={selectedPrice}
            onCancelOrder={() => sendPanel({ type: 'CANCEL_ORDER' })}
          />
        );
      
      case 'driver_assigned':
      case 'in_progress':
        return (
          <ProgressPanel
            state={panelState}
            context={panelContext}
            onRideCompleted={() => sendPanel({ type: 'RIDE_COMPLETED' })}
            onReset={() => sendPanel({ type: 'RESET' })}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      style={{ 
        height: heightAnim
      }}
      className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg"
    >
      {renderPanelContent()}
    </Animated.View>
  );
}