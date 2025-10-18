import React from 'react';
import { View, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, Clock, Navigation, RussianRuble, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface OrderConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  price: string;
}

export function OrderConfirmDialog({
  visible,
  onClose,
  onConfirm,
  startAddress,
  endAddress,
  distance,
  duration,
  price
}: OrderConfirmDialogProps) {
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${colors.background}`}>
        {/* Хедер */}
        <View className={`flex-row items-center justify-between p-4 border-b ${colors.border}`}>
          <Text className="text-lg font-semibold flex-1 text-center">Подтверждение заказа</Text>
          <Button
            size="icon"
            variant="ghost"
            onPress={onClose}
          >
            <Icon as={X} className="size-5" />
          </Button>
        </View>

        {/* Содержимое */}
        <View className="flex-1 p-6">
          {/* Маршрут */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold mb-4 ${colors.textPrimary}`}>
              Маршрут
            </Text>
            
            <View className="space-y-3">
              {/* Начальная точка */}
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mt-0.5 mr-3">
                  <Icon as={Navigation} className="size-3 text-white" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${colors.textSecondary} mb-1`}>Откуда</Text>
                  <Text className={`text-base ${colors.textPrimary}`}>{startAddress}</Text>
                </View>
              </View>

              {/* Конечная точка */}
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mt-0.5 mr-3">
                  <Icon as={MapPin} className="size-3 text-white" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${colors.textSecondary} mb-1`}>Куда</Text>
                  <Text className={`text-base ${colors.textPrimary}`}>{endAddress}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Детали поездки */}
          <View className={`rounded-2xl p-4 ${colors.card} border ${colors.border}`}>
            <Text className={`text-lg font-semibold mb-4 ${colors.textPrimary}`}>
              Детали поездки
            </Text>
            
            <View className="space-y-3">
              {/* Расстояние */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Icon as={Navigation} className={`size-4 mr-2 ${colors.textSecondary}`} />
                  <Text className={colors.textSecondary}>Расстояние</Text>
                </View>
                <Text className={`font-semibold ${colors.textPrimary}`}>{distance}</Text>
              </View>

              {/* Время */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Icon as={Clock} className={`size-4 mr-2 ${colors.textSecondary}`} />
                  <Text className={colors.textSecondary}>Время в пути</Text>
                </View>
                <Text className={`font-semibold ${colors.textPrimary}`}>{duration}</Text>
              </View>

              {/* Цена */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
                <View className="flex-row items-center">
                  <Icon as={RussianRuble} className={`size-5 mr-2 ${colors.textPrimary}`} />
                  <Text className={`text-lg font-semibold ${colors.textPrimary}`}>Стоимость</Text>
                </View>
                <Text className={`text-lg font-bold text-green-500`}>{price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Кнопки действий */}
        <View className="p-6 border-t border-gray-200">
          <Button 
            className={`rounded-2xl h-14 bg-green-500 mb-3`}
            onPress={onConfirm}
          >
            <Text className="text-white text-lg font-semibold">Подтвердить заказ</Text>
          </Button>
          
          <Button 
            variant="ghost" 
            className="rounded-2xl h-14"
            onPress={onClose}
          >
            <Text className="text-lg">Отмена</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}