import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, RussianRuble, X, Search, Dot, SlidersHorizontalIcon } from 'lucide-react-native';

type TripType = 'ride' | 'intercity' | 'courier';

interface IdlePanelProps {
  state: string;
  context: any;
  mapState: any;
  onSearchPress: () => void;
  onPricePress: () => void;
  onClearDestination: () => void;
  onTripTypeChange: (type: TripType) => void;
  onStartOrder: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
}

export function IdlePanel({
  state,
  context,
  mapState,
  onSearchPress,
  onPricePress,
  onClearDestination,
  onTripTypeChange,
  onStartOrder,
  formatDistance,
  formatDuration
}: IdlePanelProps) {
  
  const tripTabs = [
    { id: 'ride' as TripType, label: 'Поездка' },
    { id: 'intercity' as TripType, label: 'Межгород' },
    { id: 'courier' as TripType, label: 'Курьер' },
  ];

  // Проверяем все условия для активации кнопки
  const isOrderButtonEnabled = 
    mapState.destination && // Маршрут установлен
    mapState.routeInfo &&   // Информация о маршруте есть
    context.price !== 'Предложите цену' && // Цена указана
    context.numericPrice >= 60; // Цена не меньше минимальной

  console.log('🔍 Order button conditions:', {
    destination: !!mapState.destination,
    routeInfo: !!mapState.routeInfo,
    price: context.price,
    numericPrice: context.numericPrice,
    isEnabled: isOrderButtonEnabled
  });

  return (
    <View className="p-5">
      <View className="flex-row rounded-2xl p-1 mb-4 bg-gray-100 dark:bg-gray-700">
        {tripTabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex-1 rounded-xl ${
              context.tripType === tab.id ? 'bg-white dark:bg-gray-600' : ''
            }`}
            onPress={() => onTripTypeChange(tab.id)}
          >
            <Text className={
              context.tripType === tab.id 
                ? 'font-semibold text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300'
            }>
              {tab.label}
            </Text>
          </Button>
        ))}
      </View>

      <View className="gap-3 mb-4">
        <TouchableOpacity 
          className="flex-row items-center justify-between rounded-2xl p-3 bg-gray-100 dark:bg-gray-700"
          onPress={onSearchPress}
        >
          <View className="flex-row items-center flex-1">
            <Icon as={MapPin} className="size-4 ml-1 mr-2 text-gray-500 dark:text-gray-400" />
            <View className="flex-row gap-2 justify-center items-center">
              <Text className={`text-sm ${
                mapState.destination 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {mapState.destinationAddress || 'Куда?'}
              </Text>
              {mapState.routeInfo && (
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDistance(mapState.routeInfo.distance)}
                </Text>
              )}
            </View>
          </View>
          {mapState.destination ? (
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                onClearDestination();
              }}
              className="p-1"
            >
              <Icon as={X} className="size-4 text-gray-500 dark:text-gray-400" />
            </TouchableOpacity>
          ) : (
            <Icon as={Search} className="size-4 mr-2 text-gray-500 dark:text-gray-400" />
          )}
        </TouchableOpacity>

        <View 
          className="flex-row items-center justify-between rounded-2xl p-4 bg-gray-100 dark:bg-gray-700"
          onTouchEnd={onPricePress}
        >
          <View>
            <View className="flex-row items-center">
              <Icon as={RussianRuble} className="size-4 mr-2 text-gray-900 dark:text-white" />
              <Text className="text-gray-500 dark:text-gray-400">
                {context.price}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Button 
          className={`flex-1 rounded-2xl h-15 ${
            isOrderButtonEnabled ? 'bg-green-500' : 'bg-gray-400'
          }`}
          onPress={onStartOrder}
          disabled={!isOrderButtonEnabled} // Используем новое условие
        >
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-white text-lg font-semibold">Заказать</Text>
            <Icon as={Dot} className="size-5 text-white" />
            <Text className="text-white text-lg">
              {mapState.routeInfo ? formatDuration(mapState.routeInfo.duration) : ''}
            </Text>
          </View>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-2xl bg-gray-100 dark:bg-gray-700"
        >
          <Icon as={SlidersHorizontalIcon} className="size-5 text-gray-900 dark:text-white" />
        </Button>
      </View>
    </View>
  );
}