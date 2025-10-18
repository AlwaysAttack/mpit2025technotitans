// components/OrderConfirmDialog.tsx
import React from 'react';
import { View, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, Clock, Car, CheckCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useOrders } from '../providers/OrdersProvider';

interface OrderConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  price: string;
  orderData?: {
    passengerId: string;
    startLocation: { latitude: number; longitude: number };
    endLocation: { latitude: number; longitude: number };
    numericPrice: number;
  };
}

export function OrderConfirmDialog({
  visible,
  onClose,
  onConfirm,
  startAddress,
  endAddress,
  distance,
  duration,
  price,
  orderData
}: OrderConfirmDialogProps) {
  const { colorScheme } = useColorScheme();
  const { addOrder } = useOrders();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  const handleConfirm = () => {
    if (orderData) {
      // Извлекаем числовые значения из форматированных строк
      const distanceMeters = parseInt(distance.replace(/[^\d]/g, '')) || 0;
      const durationSeconds = parseInt(duration.replace(/[^\d]/g, '')) * 60 || 0;

      // Создаем заказ в общей системе
      addOrder({
        passengerName: 'Пассажир',
        rating: 5.0,
        carModel: 'Любой',
        timeToArrival: '5-10 мин',
        price: orderData.numericPrice,
        startAddress,
        endAddress,
        distance: distanceMeters,
        duration: durationSeconds,
        passengerId: orderData.passengerId,
        startLocation: orderData.startLocation,
        endLocation: orderData.endLocation,
      });
    }
    
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${colors.background}`}>
        {/* Заголовок */}
        <View className="p-6 border-b border-gray-700">
          <Text className={`text-2xl font-bold text-center ${colors.textPrimary}`}>
            Подтверждение заказа
          </Text>
        </View>

        {/* Детали поездки */}
        <View className="p-6">
          <View className={`rounded-2xl p-6 ${colors.card} border ${colors.border}`}>
            <View className="flex-row items-center mb-4">
              <Icon as={CheckCircle} className="size-6 text-green-500 mr-3" />
              <Text className={`text-lg font-semibold ${colors.textPrimary}`}>
                Проверьте детали поездки
              </Text>
            </View>

            <View className="space-y-4">
              {/* Откуда */}
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center mt-0.5 mr-4">
                  <Icon as={MapPin} className="size-4 text-white" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${colors.textSecondary} mb-1`}>Откуда</Text>
                  <Text className={`text-base ${colors.textPrimary}`}>{startAddress}</Text>
                </View>
              </View>

              {/* Куда */}
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center mt-0.5 mr-4">
                  <Icon as={MapPin} className="size-4 text-white" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${colors.textSecondary} mb-1`}>Куда</Text>
                  <Text className={`text-base ${colors.textPrimary}`}>{endAddress}</Text>
                </View>
              </View>

              {/* Детали */}
              <View className="flex-row justify-between pt-4 border-t border-gray-700">
                <View className="flex-row items-center">
                  <Icon as={Clock} className={`size-5 mr-2 ${colors.textSecondary}`} />
                  <Text className={colors.textSecondary}>Время</Text>
                </View>
                <Text className={`font-semibold ${colors.textPrimary}`}>{duration}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Icon as={Car} className={`size-5 mr-2 ${colors.textSecondary}`} />
                  <Text className={colors.textSecondary}>Расстояние</Text>
                </View>
                <Text className={`font-semibold ${colors.textPrimary}`}>{distance}</Text>
              </View>
              
              <View className="flex-row justify-between pt-4 border-t border-gray-700">
                <Text className={`text-lg font-semibold ${colors.textPrimary}`}>Стоимость</Text>
                <Text className={`text-lg font-bold text-green-500`}>{price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Кнопки */}
        <View className="p-6 border-t border-gray-700">
          <View className="space-y-3">
            <Button onPress={handleConfirm} className="bg-green-500 py-4 rounded-xl">
              <Text className="text-white font-semibold text-lg">Подтвердить заказ</Text>
            </Button>
            <Button variant="outline" onPress={onClose} className="py-4 rounded-xl">
              <Text className={`font-semibold ${colors.textPrimary}`}>Отмена</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}