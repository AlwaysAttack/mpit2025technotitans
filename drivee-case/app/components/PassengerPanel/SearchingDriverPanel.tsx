// components/PassengerPanel/SearchingDriverPanel.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, Clock, Car, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface SearchingDriverPanelProps {
  startAddress: string;
  endAddress: string;
  distance: string;
  duration: string;
  price: string;
  onCancelOrder: () => void;
}

export function SearchingDriverPanel({
    startAddress,
    endAddress,
    distance,
    duration,
    price,
    onCancelOrder
  }: SearchingDriverPanelProps) {
    const { colorScheme } = useColorScheme();
  
    const colors = {
      background: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
      card: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
      textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
      textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    };
  
    return (
      <View className={`flex-1 rounded-2xl ${colors.background}`}>
        {/* Хедер с кнопкой отмены - без верхнего отступа */}
        <View className={`flex-row items-center justify-between p-6 border-b ${colors.border}`}>
          <Text className={`text-xl font-semibold ${colors.textPrimary}`}>Ищем водителя...</Text>
          <Button
            variant="destructive"
            onPress={onCancelOrder}
            className="rounded-full"
          >
            <Text>Отменить</Text>
          </Button>
        </View>
  
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Детали заказа */}
        <View className="p-6">
          <View className={`rounded-2xl p-6 ${colors.card} border ${colors.border} shadow-sm`}>
            <Text className={`text-lg font-semibold mb-4 ${colors.textPrimary}`}>
              Детали поездки
            </Text>
            
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

              {/* Детали времени и цены */}
              <View className="flex-row justify-between pt-4 border-t border-gray-700">
                <View className="flex-row items-center">
                  <Icon as={Clock} className={`size-5 mr-2 ${colors.textSecondary}`} />
                  <Text className={colors.textSecondary}>В пути</Text>
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

        {/* Заявки от водителей */}
        <View className="px-6 pb-6">
          <Text className={`text-lg font-semibold mb-4 ${colors.textPrimary}`}>
            Заявки
          </Text>
          
          {/* Пустышка для заявок */}
          <View className={`rounded-2xl p-6 ${colors.card} border ${colors.border} items-center justify-center`}>
            <Icon as={Car} className={`size-12 mb-3 ${colors.textSecondary}`} />
            <Text className={`text-center text-lg font-medium mb-2 ${colors.textPrimary}`}>
              Ожидаем заявки от водителей
            </Text>
            <Text className={`text-center ${colors.textSecondary}`}>
              Как только водители начнут откликаться, они появятся здесь
            </Text>
          </View>
        </View>
        </ScrollView>
      </View>
    );
  }