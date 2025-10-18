// components/DriverPanel/OrderDetailsPanel.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, MapPin, Clock, Car, Star } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../hooks/useOrders';

interface OrderDetailsPanelProps {
  order: Order | null;
  onAcceptOrder: () => void;
  onBack: () => void;
}

export function OrderDetailsPanel({ order, onAcceptOrder, onBack }: OrderDetailsPanelProps) {
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  if (!order) {
    return (
      <View className={`flex-1 items-center justify-center ${colors.background}`}>
        <Text className={`text-lg ${colors.textSecondary}`}>Заказ не найден</Text>
        <Button onPress={onBack} className="mt-4">
          <Text>Назад</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${colors.background}`}>
      {/* Хедер */}
      <View className={`flex-row items-center p-6 border-b ${colors.border}`}>
        <Button variant="ghost" onPress={onBack} className="mr-4">
          <Icon as={ArrowLeft} className="size-5" />
        </Button>
        <Text className={`text-xl font-semibold ${colors.textPrimary}`}>
          Детали заказа
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Информация о пассажире */}
          <View className={`p-4 rounded-2xl ${colors.card} border ${colors.border} mb-4`}>
            <Text className={`text-lg font-semibold mb-3 ${colors.textPrimary}`}>
              Пассажир
            </Text>
            <View className="flex-row items-center mb-2">
              <Text className={`text-base ${colors.textPrimary} font-medium`}>
                {order.passengerName}
              </Text>
              <View className="flex-row items-center ml-2">
                <Icon as={Star} className="size-4 text-yellow-500 mr-1" />
                <Text className={colors.textSecondary}>{order.rating}</Text>
              </View>
            </View>
          </View>

          {/* Маршрут */}
          <View className={`p-4 rounded-2xl ${colors.card} border ${colors.border} mb-4`}>
            <Text className={`text-lg font-semibold mb-3 ${colors.textPrimary}`}>
              Маршрут
            </Text>
            
            <View className="flex-row items-start mb-3">
              <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mt-0.5 mr-3">
                <Icon as={MapPin} className="size-3 text-white" />
              </View>
              <View className="flex-1">
                <Text className={`text-sm ${colors.textSecondary}`}>Откуда</Text>
                <Text className={`text-base ${colors.textPrimary}`}>{order.startAddress}</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mt-0.5 mr-3">
                <Icon as={MapPin} className="size-3 text-white" />
              </View>
              <View className="flex-1">
                <Text className={`text-sm ${colors.textSecondary}`}>Куда</Text>
                <Text className={`text-base ${colors.textPrimary}`}>{order.endAddress}</Text>
              </View>
            </View>
          </View>

          {/* Детали поездки */}
          <View className={`p-4 rounded-2xl ${colors.card} border ${colors.border} mb-4`}>
            <Text className={`text-lg font-semibold mb-3 ${colors.textPrimary}`}>
              Детали
            </Text>
            
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Icon as={Clock} className={`size-4 mr-2 ${colors.textSecondary}`} />
                <Text className={colors.textSecondary}>Время</Text>
              </View>
              <Text className={colors.textPrimary}>{Math.round(order.duration / 60)} мин</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center">
                <Icon as={Car} className={`size-4 mr-2 ${colors.textSecondary}`} />
                <Text className={colors.textSecondary}>Расстояние</Text>
              </View>
              <Text className={colors.textPrimary}>
                {order.distance < 1000 ? `${order.distance} м` : `${(order.distance / 1000).toFixed(1)} км`}
              </Text>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-700">
              <Text className={`text-lg font-semibold ${colors.textPrimary}`}>Стоимость</Text>
              <Text className={`text-lg font-bold text-green-500`}>{order.price}P</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Кнопка принятия заказа */}
      <View className="p-6 border-t border-gray-700">
        <Button onPress={onAcceptOrder} className="bg-green-500 py-4 rounded-xl">
          <Text className="text-white font-semibold text-lg">Принять заказ</Text>
        </Button>
      </View>
    </View>
  );
}