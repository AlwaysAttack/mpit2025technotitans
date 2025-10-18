import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Car, Clock, MapPin, User, Star, Phone, MessageCircle } from 'lucide-react-native';
import { BookingState } from '../../machines/bookingMachine';

interface ProgressPanelProps {
  state: BookingState;
  context: any;
  onRideCompleted: () => void;
  onReset: () => void;
}

export function ProgressPanel({ state, context, onRideCompleted, onReset }: ProgressPanelProps) {
  
  const getStatusText = () => {
    switch (state) {
      case 'searching_driver':
        return 'Ищем водителя';
      case 'driver_assigned':
        return 'Водитель в пути';
      case 'in_progress':
        return 'Поездка началась';
      default:
        return 'Статус поездки';
    }
  };

  const getDriverInfo = () => ({
    name: 'Иван Петров',
    rating: 4.8,
    car: 'Kia Rio',
    license: 'A123BC',
    phone: '+7 (999) 123-45-67',
    eta: '5 мин', // время до прибытия
  });

  const driverInfo = getDriverInfo();

  return (
    <View className="flex-1 p-5">
      {/* Заголовок статуса */}
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {getStatusText()}
        </Text>
        {state === 'searching_driver' && (
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            Это может занять несколько минут
          </Text>
        )}
      </View>

      {/* Информация о водителе */}
      {(state === 'driver_assigned' || state === 'in_progress') && (
        <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-green-500 rounded-full items-center justify-center mr-3">
                <Icon as={User} className="size-6 text-white" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  {driverInfo.name}
                </Text>
                <View className="flex-row items-center">
                  <Icon as={Star} className="size-4 text-yellow-500 mr-1" />
                  <Text className="text-gray-600 dark:text-gray-300">
                    {driverInfo.rating}
                  </Text>
                </View>
              </View>
            </View>
            
            <View className="items-end">
              <Text className="text-gray-900 dark:text-white font-medium">
                {driverInfo.car}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {driverInfo.license}
              </Text>
            </View>
          </View>

          {/* Кнопки связи */}
          <View className="flex-row justify-between">
            <Button variant="ghost" className="flex-1 mr-2">
              <Icon as={Phone} className="size-5 text-green-500 mr-2" />
              <Text>Позвонить</Text>
            </Button>
            <Button variant="ghost" className="flex-1 ml-2">
              <Icon as={MessageCircle} className="size-5 text-blue-500 mr-2" />
              <Text>Сообщение</Text>
            </Button>
          </View>
        </View>
      )}

      {/* Информация о поездке */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Icon as={MapPin} className="size-4 text-green-500 mr-2" />
            <Text className="text-gray-900 dark:text-white font-medium">Откуда</Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300 text-sm text-right flex-1 ml-2">
            {context.destination?.startAddress || 'Текущее местоположение'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Icon as={MapPin} className="size-4 text-red-500 mr-2" />
            <Text className="text-gray-900 dark:text-white font-medium">Куда</Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300 text-sm text-right flex-1 ml-2">
            {context.destination?.address || 'Пункт назначения'}
          </Text>
        </View>

        {context.routeInfo && (
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <Icon as={Clock} className="size-4 text-blue-500 mr-2" />
              <Text className="text-gray-900 dark:text-white font-medium">В пути</Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-300">
              {Math.round(context.routeInfo.duration / 60)} мин
            </Text>
          </View>
        )}
      </View>

      {/* Прогресс бар */}
      {state === 'searching_driver' && (
        <View className="items-center mb-6">
          <View className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <View className="bg-green-500 h-2 rounded-full w-1/3"></View>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Поиск ближайшего водителя...
          </Text>
        </View>
      )}

      {/* Время до прибытия */}
      {state === 'driver_assigned' && (
        <View className="items-center mb-6">
          <View className="flex-row items-center">
            <Icon as={Car} className="size-6 text-green-500 mr-2" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Прибудет через {driverInfo.eta}
            </Text>
          </View>
        </View>
      )}

      {/* Кнопки действий */}
      <View className="flex-1 justify-end">
        {state === 'in_progress' ? (
          <Button 
            className="rounded-2xl h-14 bg-green-500"
            onPress={onRideCompleted}
          >
            <Text className="text-white text-lg font-semibold">Завершить поездку</Text>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            className="rounded-2xl h-14 border border-gray-300 dark:border-gray-600"
            onPress={onReset}
          >
            <Text className="text-red-500 text-lg font-semibold">Отменить поездку</Text>
          </Button>
        )}
      </View>
    </View>
  );
}