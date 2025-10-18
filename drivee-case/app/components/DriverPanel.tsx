// components/DriverPanel.tsx
import React, { useEffect, useRef } from 'react';
import { View, Dimensions, Animated } from 'react-native';
import { DriverIdlePanel } from './DriverPanel/DriverIdlePanel';
// import { OrderListPanel } from './DriverPanel/OrderListPanel';
// import { OrderDetailsPanel } from './DriverPanel/OrderDetailsPanel';
// import { TripProgressPanel } from './DriverPanel/TripProgressPanel';
import { DriverState, DriverContext } from '../hooks/useDriverPanel';
import { useOrders, Order } from '../providers/OrdersProvider';
 // Добавляем импорт Order

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DriverPanelProps {
  panelState: DriverState;
  sendPanel: (event: any) => void;
  panelContext: DriverContext;
  mapState: any;
  incomingOrders: Order[]; // Добавляем пропс для заказов
  onAcceptOrder: (order: Order) => void; // Обработчик принятия заказа
  onNavigateToPassenger?: () => void;
  onStartTrip?: () => void;
  onCompleteTrip?: () => void;
}

export function DriverPanel({
  panelState,
  sendPanel,
  panelContext,
  mapState,
  incomingOrders,
  onAcceptOrder,
}: DriverPanelProps) {
  const heightAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.7)).current;

  const getTargetHeight = () => {
    switch (panelState) {
      case 'idle':
        return SCREEN_HEIGHT * 0.7;
      case 'order_list':
      case 'order_details':
        return SCREEN_HEIGHT * 0.8;
      case 'navigating_to_passenger':
      case 'waiting_for_passenger':
      case 'trip_in_progress':
        return SCREEN_HEIGHT * 0.4;
      case 'trip_completed':
        return SCREEN_HEIGHT * 0.5;
      default:
        return SCREEN_HEIGHT * 0.7;
    }
  };

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
    console.log('🔄 Rendering driver panel for state:', panelState);
    
    switch (panelState) {
      case 'idle':
        return (
          <DriverIdlePanel
            earnings={panelContext.earnings || 2750}
            onShowOrders={() => sendPanel({ type: 'SHOW_ORDERS' })}
            incomingOrders={incomingOrders} // Передаем заказы
            onAcceptOrder={onAcceptOrder} // Передаем обработчик
          />
        );
      
    //   case 'order_list':
    //     return (
    //       <OrderListPanel
    //         orders={panelContext.orders}
    //         onSelectOrder={(order) => sendPanel({ type: 'SELECT_ORDER', order })}
    //         onBack={() => sendPanel({ type: 'BACK_TO_IDLE' })}
    //       />
    //     );
      
    //   case 'order_details':
    //     return (
    //       <OrderDetailsPanel
    //         order={panelContext.currentOrder}
    //         onAcceptOrder={() => {
    //           sendPanel({ type: 'ACCEPT_ORDER' });
    //           onNavigateToPassenger?.();
    //         }}
    //         onBack={() => sendPanel({ type: 'BACK_TO_LIST' })}
    //       />
    //     );
      
      case 'navigating_to_passenger':
      case 'waiting_for_passenger':
    //   case 'trip_in_progress':
    //     return (
    //       <TripProgressPanel
    //         state={panelState}
    //         order={panelContext.currentOrder}
    //         mapState={mapState}
    //         onArriveAtPickup={() => sendPanel({ type: 'ARRIVE_AT_PICKUP' })}
    //         onPassengerEntered={() => {
    //           sendPanel({ type: 'PASSENGER_ENTERED' });
    //           onStartTrip?.();
    //         }}
    //         onCompleteTrip={() => {
    //           sendPanel({ type: 'COMPLETE_TRIP' });
    //           onCompleteTrip?.();
    //         }}
    //         onCancelOrder={() => sendPanel({ type: 'CANCEL_ORDER' })}
    //       />
    //     );
      
    //   case 'trip_completed':
    //     return (
    //       <TripProgressPanel
    //         state={panelState}
    //         order={panelContext.currentOrder}
    //         mapState={mapState}
    //         onBackToIdle={() => sendPanel({ type: 'BACK_TO_IDLE' })}
    //       />
    //     );
        
      default:
        return (
          <DriverIdlePanel
            earnings={panelContext.earnings || 2750}
            onShowOrders={() => sendPanel({ type: 'SHOW_ORDERS' })}
            incomingOrders={incomingOrders}
            onAcceptOrder={onAcceptOrder}
          />
        );
    }
  };

  return (
    <Animated.View 
      style={{ height: heightAnim }}
      className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg overflow-hidden"
    >
      {renderPanelContent()}
    </Animated.View>
  );
}