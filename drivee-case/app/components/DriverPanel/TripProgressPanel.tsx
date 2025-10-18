// components/DriverPanel/TripProgressPanel.tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Car, MapPin, Clock, CheckCircle, Navigation } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../hooks/useOrders';
import { DriverState } from '../../hooks/useDriverPanel';

interface TripProgressPanelProps {
  state: DriverState;
  order: Order | null;
  mapState?: any;
  onArriveAtPickup?: () => void;
  onPassengerEntered?: () => void;
  onCompleteTrip?: () => void;
  onCancelOrder?: () => void;
  onBackToIdle?: () => void;
}

export function TripProgressPanel({
  state,
  order,
  onArriveAtPickup,
  onPassengerEntered,
  onCompleteTrip,
  onCancelOrder,
  onBackToIdle,
}: TripProgressPanelProps) {
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  const renderContent = () => {
    switch (state) {
      case 'navigating_to_passenger':
        return (
          <View className="p-6">
            <View className="items-center mb-6">
              <Icon as={Navigation} className="size-12 text-blue-500 mb-3" />
              <Text className={`text-xl font-semibold mb-2 ${colors.textPrimary}`}>
                Едем к пассажиру
              </Text>
              <Text className={`text-center ${colors.textSecondary}`}>
                {order?.startAddress}
              </Text>
            </View>
            <Button onPress={onArriveAtPickup} className="bg-green-500 py-3 rounded-xl">
              <Text className="text-white font-semibold">Прибыл на место</Text>
            </Button>
          </View>
        );

      case 'waiting_for_passenger':
        return (
          <View className="p-6">
            <View className="items-center mb-6">
              <Icon as={Clock} className="size-12 text-yellow-500 mb-3" />
              <Text className={`text-xl font-semibold mb-2 ${colors.textPrimary}`}>
                Ожидаем пассажира
              </Text>
              <Text className={`text-center ${colors.textSecondary}`}>
                Пассажир подойдет к автомобилю
              </Text>
            </View>
            <Button onPress={onPassengerEntered} className="bg-green-500 py-3 rounded-xl">
              <Text className="text-white font-semibold">Пассажир в автомобиле</Text>
            </Button>
          </View>
        );

      case 'trip_in_progress':
        return (
          <View className="p-6">
            <View className="items-center mb-6">
              <Icon as={Car} className="size-12 text-green-500 mb-3" />
              <Text className={`text-xl font-semibold mb-2 ${colors.textPrimary}`}>
                Поездка началась
              </Text>
              <Text className={`text-center ${colors.textSecondary}`}>
                Следуйте к {order?.endAddress}
              </Text>
            </View>
            <Button onPress={onCompleteTrip} className="bg-green-500 py-3 rounded-xl">
              <Text className="text-white font-semibold">Завершить поездку</Text>
            </Button>
          </View>
        );

      case 'trip_completed':
        return (
          <View className="p-6">
            <View className="items-center mb-6">
              <Icon as={CheckCircle} className="size-12 text-green-500 mb-3" />
              <Text className={`text-xl font-semibold mb-2 ${colors.textPrimary}`}>
                Поездка завершена!
              </Text>
              <Text className={`text-lg text-green-500 font-bold mb-2`}>
                +{order?.price}P
              </Text>
              <Text className={`text-center ${colors.textSecondary}`}>
                Спасибо за поездку!
              </Text>
            </View>
            <Button onPress={onBackToIdle} className="bg-green-500 py-3 rounded-xl">
              <Text className="text-white font-semibold">Вернуться к заказам</Text>
            </Button>
          </View>
        );

      default:
        return (
          <View className="p-6">
            <Text className={`text-center ${colors.textSecondary}`}>
              Неизвестное состояние: {state}
            </Text>
          </View>
        );
    }
  };

  return (
    <View className={`flex-1 ${colors.background}`}>
      {renderContent()}
      {state !== 'trip_completed' && onCancelOrder && (
        <View className="p-6 border-t border-gray-700">
          <Button variant="outline" onPress={onCancelOrder} className="py-3 rounded-xl">
            <Text className={colors.textPrimary}>Отменить</Text>
          </Button>
        </View>
      )}
    </View>
  );
}