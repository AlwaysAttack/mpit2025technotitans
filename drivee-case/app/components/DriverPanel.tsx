// components/DriverPanel.tsx
import React, { useEffect, useRef } from 'react';
import { View, Dimensions, Animated } from 'react-native';
import { DriverIdlePanel } from './DriverPanel/DriverIdlePanel';
import { OrderDetailsPanel } from './DriverPanel/OrderDetailsPanel';
import { DriverState, DriverContext } from '../hooks/useDriverPanel';
import { Order } from '../types/order';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DriverPanelProps {
  panelState: DriverState;
  sendPanel: (event: any) => void;
  panelContext: DriverContext;
  mapState: any;
  incomingOrders: Order[];
  onAcceptOrder: (order: Order) => void;
  onShowRoute?: (startLocation: { latitude: number; longitude: number }, endLocation: { latitude: number; longitude: number }) => void;
}

export function DriverPanel({
  panelState,
  sendPanel,
  panelContext,
  mapState,
  incomingOrders,
  onAcceptOrder,
  onShowRoute
}: DriverPanelProps) {
  const heightAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.7)).current;

  const getTargetHeight = () => {
    switch (panelState) {
      case 'idle':
        return SCREEN_HEIGHT * 0.7;
      case 'order_details': // Детали заказа
        return SCREEN_HEIGHT * 0.45;
      // case 'ordering':
      // case 'confirming':
      //   return SCREEN_HEIGHT * 0.6;
      // case 'searching_driver':
      // case 'driver_assigned':
      //   return SCREEN_HEIGHT * 0.5;
      // case 'in_progress':
      //   return SCREEN_HEIGHT * 0.4;
      // case 'completed':
      //   return SCREEN_HEIGHT * 0.5;
      // default:
      //   return SCREEN_HEIGHT * 0.7;
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

  const handleShowRoute = (startLocation: { latitude: number; longitude: number }, endLocation: { latitude: number; longitude: number }) => {
    if (onShowRoute) {
      onShowRoute(startLocation, endLocation);
    }
  };

  const handleSubmitPrice = (price: number) => {
    console.log('💰 Предложена цена:', price);
    sendPanel({ type: 'START_ORDER', price });
  };

  const renderPanelContent = () => {
    console.log('🔄 Rendering driver panel for state:', panelState);
    
    switch (panelState) {
      case 'idle':
        return (
          <DriverIdlePanel
            earnings={panelContext.earnings}
            incomingOrders={incomingOrders}
            onAcceptOrder={(order) => {
              sendPanel({ type: 'SELECT_ORDER', order });
            }}
          />
        );
      
      case 'order_details':
        return (
          <OrderDetailsPanel
            order={panelContext.selectedOrder!}
            onBack={() => sendPanel({ type: 'BACK_TO_LIST' })}
            onSubmitPrice={handleSubmitPrice}
            onShowRoute={handleShowRoute}
          />
        );
      
      // case 'ordering':
      //   return (
      //     <View className="flex-1 justify-center items-center p-6">
      //       <Text className="text-lg font-semibold mb-4">Подтверждение заказа</Text>
      //       <Text className="text-center mb-4">Цена: {panelContext.price}₽</Text>
      //       <Button 
      //         onPress={() => sendPanel({ type: 'CONFIRM_ORDER' })}
      //         className="bg-green-500 px-6 py-3 rounded-lg"
      //       >
      //         <Text className="text-white font-semibold">Подтвердить заказ</Text>
      //       </Button>
      //       <Button 
      //         onPress={() => sendPanel({ type: 'CANCEL_ORDER' })}
      //         variant="outline"
      //         className="mt-2"
      //       >
      //         <Text>Назад</Text>
      //       </Button>
      //     </View>
      //   );
      
      // case 'searching_driver':
      //   return (
      //     <View className="flex-1 justify-center items-center p-6">
      //       <Text className="text-lg font-semibold mb-4">Поиск пассажира...</Text>
      //       <Text className="text-center mb-4">Ожидаем подтверждения</Text>
      //     </View>
      //   );
      
      // Остальные состояния можно добавить позже
      default:
        return (
          <DriverIdlePanel
            earnings={panelContext.earnings}
            incomingOrders={incomingOrders}
            onAcceptOrder={(order) => sendPanel({ type: 'SET_DESTINATION', order })}
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