// components/DriverPanel/DriverIdlePanel.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Star, Clock, MapPin, Navigation } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../types/order';

interface OrderDisplay extends Order {
  passengerName?: string;
  rating?: number;
  timeToArrival?: string;
}

interface DriverIdlePanelProps {
  earnings: number;
  onShowOrders: () => void;
  incomingOrders: OrderDisplay[];
  onAcceptOrder: (order: OrderDisplay) => void;
}

export function DriverIdlePanel({ 
  earnings, 
  incomingOrders, 
  onAcceptOrder 
}: DriverIdlePanelProps) {
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    }
    return `${(meters / 1000).toFixed(1)} км`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} мин`;
  };

  const renderOrderCard = (order: OrderDisplay) => (
    <View 
      key={order.id}
      className={`p-4 rounded-xl ${colors.card} border ${colors.border} mb-3`}
    >
      <View className="flex-row justify-between items-start">
        {/* Левая часть - информация о заказе */}
        <View className="flex-1 mr-3">
          {/* Первая строка: имя и рейтинг */}
          <View className="flex-row items-center mb-1">
            <Text className={`text-base font-bold ${colors.textPrimary} mr-2`}>
              {order.passengerName || 'Пассажир'}
            </Text>
            <View className="flex-row items-center">
              <Icon as={Star} className="size-3 text-yellow-500 mr-1" />
              <Text className={`text-xs ${colors.textSecondary}`}>
                {order.rating || '4.9'}
              </Text>
            </View>
          </View>

          {/* Вторая строка: расстояние и время */}
          <View className="flex-row items-center mb-2">
            <Text className={`text-sm ${colors.textSecondary} mr-3`}>
              {formatDistance(order.distance)}
            </Text>
            <View className="flex-row items-center">
              <Icon as={Clock} className="size-3 text-blue-500 mr-1" />
              <Text className={`text-xs ${colors.textSecondary}`}>
                {order.timeToArrival || `${formatDuration(order.duration)} от вас`}
              </Text>
            </View>
          </View>

          {/* Адреса */}
          <View className="space-y-1">
            <View className="flex-row items-start">
              <Icon as={MapPin} className="size-3 text-green-500 mt-0.5 mr-2" />
              <Text className={`text-xs ${colors.textPrimary} flex-1`} numberOfLines={1}>
                {order.startAddress}
              </Text>
            </View>
            <View className="flex-row items-start">
              <Icon as={MapPin} className="size-3 text-red-500 mt-0.5 mr-2" />
              <Text className={`text-xs ${colors.textPrimary} flex-1`} numberOfLines={1}>
                {order.endAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Правая часть - цена и кнопка */}
        <View className="items-end">
          <Text className="text-xl font-bold text-green-500 mb-2">
            {order.price}₽
          </Text>
          <Button 
            onPress={() => onAcceptOrder(order)}
            className="px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">Перейти</Text>
          </Button>
        </View>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${colors.background}`}>
      {/* Шапка */}
      <View className={`p-4 border-b ${colors.border}`}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className={`text-lg font-bold ${colors.textPrimary}`}>
              Новые заказы
            </Text>
            <Text className={`text-sm ${colors.textSecondary}`}>
              За месяц: <Text className="text-green-500">+{earnings}₽</Text>
            </Text>
          </View>
          <View className="bg-green-500 px-3 py-1 rounded-full">
            <Text className="text-white font-semibold text-xs">Онлайн</Text>
          </View>
        </View>
      </View>

      {/* Список заказов */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {incomingOrders.length === 0 ? (
            <View className={`p-6 rounded-xl ${colors.card} border ${colors.border} items-center`}>
              <Text className={`text-center ${colors.textSecondary} mb-1`}>
                Заказов пока нет
              </Text>
              <Text className={`text-center text-xs ${colors.textSecondary}`}>
                Новые заказы появятся здесь
              </Text>
            </View>
          ) : (
            incomingOrders.map(renderOrderCard)
          )}
        </View>
      </ScrollView>
    </View>
  );
}