// components/DriverPanel/OrderDetailsPanel.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Keyboard, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, Clock, User, ArrowLeft, Crown } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../types/order';
import { PeakLogo } from '../../components/PeakLogo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OrderDetailsPanelProps {
  order: Order;
  onBack: () => void;
  onSubmitPrice: (price: number) => void;
  onShowRoute: (startLocation: { latitude: number; longitude: number }, endLocation: { latitude: number; longitude: number }) => void;
}

export function OrderDetailsPanel({ 
  order, 
  onBack, 
  onSubmitPrice,
  onShowRoute 
}: OrderDetailsPanelProps) {
  const { colorScheme } = useColorScheme();
  const [proposedPrice, setProposedPrice] = useState(order.price.toString());
  const [isPeakTime, setIsPeakTime] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    inputBackground: colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50',
  };

  // Обработка клавиатуры
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Показываем маршрут при открытии панели
  useEffect(() => {
    if (order.startLocation && order.endLocation) {
      onShowRoute(order.startLocation, order.endLocation);
    }
  }, [order, onShowRoute]);

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

  // Быстрые ставки в абсолютных значениях
  const quickBids = [20, 50, 100];

  const handleQuickBid = (amount: number) => {
    const newPrice = order.price + amount;
    setProposedPrice(newPrice.toString());
  };

  const handlePriceInput = (text: string) => {
    // Оставляем только цифры
    const numericValue = text.replace(/[^0-9]/g, '');
    setProposedPrice(numericValue);
  };

  const handlePeakPrice = () => {
    // Автоматическая peak-цена (+15% от базовой)
    const peakPrice = Math.round(order.price * 1.15);
    setProposedPrice(peakPrice.toString());
    setIsPeakTime(true);
  };

  const handleSubmitPrice = () => {
    const numericPrice = parseInt(proposedPrice) || order.price;
    onSubmitPrice(numericPrice);
  };

  return (
    <View 
      className={`flex-1 ${colors.background}`}
      style={{ 
        marginBottom: keyboardHeight > 0 ? keyboardHeight - 34 : 0 // safe area adjustment
      }}
    >
      {/* Шапка с кнопкой назад */}
      <View className={`flex-row items-center p-3 border-b ${colors.border}`}>
        <Button
          size="icon"
          variant="ghost"
          onPress={onBack}
          className="mr-2"
        >
          <Icon as={ArrowLeft} className="size-5" />
        </Button>
        <Text className={`text-base font-semibold ${colors.textPrimary}`}>
          Детали заказа
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: 16,
          flexGrow: keyboardHeight > 0 ? 0 : 1 // Не растягиваем при клавиатуре
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Компактная информация о маршруте и пассажире */}
        <View className="p-3">
          <View className={`rounded-lg p-3 ${colors.card} border ${colors.border}`}>
            {/* Аватар, детали и цена в одной строке */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-2">
                  <Icon as={User} className="size-4 text-blue-600 dark:text-blue-400" />
                </View>
                <View className="flex-1">
                  <Text className={`text-sm font-medium ${colors.textPrimary}`}>
                    Алексей
                  </Text>
                  <Text className={`text-xs ${colors.textSecondary}`}>
                    ★ 4.9
                  </Text>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="text-lg font-bold text-green-500">
                  {order.price}₽
                </Text>
              </View>
            </View>

            {/* Пункт A и Б компактно */}
            <View className="space-y-1 mb-2">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-green-500 items-center justify-center mr-2">
                  <Text className="text-white text-xs font-bold">A</Text>
                </View>
                <Text className={`text-xs ${colors.textPrimary} flex-1`} numberOfLines={1}>
                  {order.startAddress}
                </Text>
              </View>

              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 items-center justify-center mr-2">
                  <Text className="text-white text-xs font-bold">Б</Text>
                </View>
                <Text className={`text-xs ${colors.textPrimary} flex-1`} numberOfLines={1}>
                  {order.endAddress}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Icon as={Clock} className="size-4 text-green-500 mr-1" />
                <Text className={`text-xs ${colors.textPrimary}`}>
                  {formatDuration(order.duration)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Icon as={MapPin} className="size-4 text-green-500 mr-1" />
                <Text className={`text-xs ${colors.textPrimary}`}>
                  {formatDistance(order.distance)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Input для цены и Peak-цена */}
        <View className="px-3 mb-3">
          <View className={`rounded-lg p-3 ${colors.card} border ${colors.border}`}>
            <View className="flex-row items-center space-x-2 gap-2">
              <View className={`flex-1 flex-row items-center rounded-lg px-3 py-2 ${colors.inputBackground}`}>
                <TextInput
                  value={proposedPrice}
                  onChangeText={handlePriceInput}
                  placeholder="Предложите свою цену"
                  placeholderTextColor={colors.textSecondary}
                  className={`flex-1 text-base ${colors.textPrimary}`}
                  keyboardType="numeric"
                />
                <Text className={`text-sm ${colors.textSecondary} ml-1`}>₽</Text>
              </View>
              
              {/* Кнопка Peak-цена как в PriceModal */}
              <Button 
                onPress={handlePeakPrice}
                variant="ghost"
                className={`rounded-2xl px-3 py-2 ${isPeakTime ? 'bg-yellow-400' : colorScheme === 'dark' ? 'bg-white' : 'bg-gray-900'}`}
              >
                <View className="flex-row items-center justify-center gap-1">
                  <Text className={`text-xs font-semibold ${isPeakTime ? 'text-black' : colorScheme === 'dark' ? 'text-black' : 'text-white'}`}>
                    Peak-цена
                  </Text>
                  <PeakLogo />
                </View>
              </Button>
            </View>
          </View>
        </View>

        {/* Кнопки быстрых ставок */}
        <View className="px-3 mb-3">
          <View className={`rounded-lg p-3 ${colors.card} border ${colors.border}`}>
            <View className="flex-row justify-between space-x-2">
              {quickBids.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className={`flex-1 py-2 ${colors.border}`}
                  onPress={() => handleQuickBid(amount)}
                >
                  <View className="items-center">
                    <Text className="text-xs text-green-500 font-medium">
                      +{amount}₽
                    </Text>
                  </View>
                </Button>
              ))}
            </View>
          </View>
        </View>

        {/* Кнопка предложить */}
        <View className="px-3">
          <Button
            onPress={handleSubmitPrice}
            className="bg-green-500 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-base">Предложить</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}