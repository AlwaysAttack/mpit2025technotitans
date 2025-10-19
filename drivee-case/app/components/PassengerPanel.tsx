import React, { useEffect, useRef } from 'react';
import { View, Dimensions, Animated } from 'react-native';
import { IdlePanel } from './PassengerPanel/IdlePanel';
import { ProgressPanel } from './PassengerPanel/ProgressPanel';
import { SearchingDriverPanel } from './PassengerPanel/SearchingDriverPanel';
import { BookingState, BookingContext } from '../hooks/usePassengerPanel';
import { useOrderSync } from '../hooks/useOrderSync';
import { Order } from '../types/order';
import { useOfferSync, Offer } from '../hooks/useOfferSync';



const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type TripType = 'ride' | 'intercity' | 'courier';

interface PassengerPanelProps {
  mapState: any;
  selectedPrice: string;
  currentOrder: Order | null;
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
  onCancelOrder?: () => void;
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
  panelContext,
  currentOrder,
  onCancelOrder
}: PassengerPanelProps) {
  const heightAnim = useRef(new Animated.Value(280)).current;
  const { removeOrder } = useOrderSync();
  const { offers, addOffer, updateOffer, removeOffer } = useOfferSync();

  const handleSelectOffer = (offer: Offer) => {
    console.log('Выбран оффер:', offer.id);
    // Например, обновляем статус оффера на accepted
    updateOffer(offer.id, { status: 'accepted' });
  };

  // Обработчик отмены заказа
  const handleCancelOrder = () => {
    if (currentOrder) {
      removeOrder(currentOrder.id);
      sendPanel({ type: 'CANCEL_ORDER' }); // переводим панель в idle
      if (onCancelOrder) onCancelOrder(); // вызываем внешний колбэк, если есть
    }
  };

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

  // Плавная анимация изменения высоты панели
  useEffect(() => {
    const targetHeight = getTargetHeight();
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [panelState, heightAnim]);

  const renderPanelContent = () => {
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
        return (
          <SearchingDriverPanel
            startAddress={mapState.currentAddress || 'Адрес не указан'}
            endAddress={mapState.destinationAddress || 'Адрес не указан'}
            distance={mapState.routeInfo ? formatDistance(mapState.routeInfo.distance) : 'Не рассчитано'}
            duration={mapState.routeInfo ? formatDuration(mapState.routeInfo.duration) : 'Не рассчитано'}
            price={selectedPrice}
            onCancelOrder={handleCancelOrder}
            onSelectOffer={handleSelectOffer}
            offers={offers}
          />
        );

      case 'driver_assigned':
      case 'in_progress':
        return (
          <ProgressPanel
            state={panelState}
            context={panelContext}
            onRideCompleted={() => sendPanel({ type: 'RIDE_COMPLETED' })}
            onReset={() => sendPanel({ type: 'CANCEL_ORDER' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Animated.View
      style={{ height: heightAnim }}
      className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg"
    >
      {renderPanelContent()}
    </Animated.View>
  );
}
