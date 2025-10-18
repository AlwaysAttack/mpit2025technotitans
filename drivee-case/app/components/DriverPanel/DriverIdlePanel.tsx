// components/DriverPanel/DriverIdlePanel.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Star, MessageCircle, User, Calendar, Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../providers/OrdersProvider';

interface DriverIdlePanelProps {
  earnings: number;
  onShowOrders: () => void;
  incomingOrders: Order[];
  onAcceptOrder: (order: Order) => void;
}

const testOrders: Order[] = [
  {
    id: 'test-1',
    passengerName: 'Тестовый Пассажир',
    rating: 4.8,
    carModel: 'Любой',
    timeToArrival: '5 мин',
    price: 300,
    startAddress: 'ул. Тестовая, 1',
    endAddress: 'пр. Тестовый, 15',
    distance: 2000,
    duration: 300,
    passengerId: 'test',
    status: 'pending',
    createdAt: new Date(),
    startLocation: { latitude: 55.7558, longitude: 37.6173 },
    endLocation: { latitude: 55.7602, longitude: 37.6185 },
  }
];



export function DriverIdlePanel({ 
  earnings, 
  onShowOrders, 
  incomingOrders, 
  onAcceptOrder 
}: DriverIdlePanelProps) {
  const { colorScheme } = useColorScheme();
  const displayOrders = incomingOrders.length > 0 ? incomingOrders : testOrders;
  console.log('🚗 Водитель видит заказов:', displayOrders.length);
  console.log('🚗 DriverIdlePanel перерендер. Заказов:', incomingOrders.length);
console.log('📋 incomingOrders:', JSON.stringify(incomingOrders, null, 2));


if (incomingOrders.length > 0) {
  console.log('✅ Первый заказ:', {
    id: incomingOrders[0].id,
    name: incomingOrders[0].passengerName,
    price: incomingOrders[0].price,
    from: incomingOrders[0].startAddress,
    to: incomingOrders[0].endAddress
  });
}

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  const renderOrderCard = (order: Order) => (
    <View 
      key={order.id}
      className={`p-4 rounded-2xl ${colors.card} border ${colors.border} mb-3 shadow-sm`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center">
          <Text className={`text-lg font-semibold ${colors.textPrimary}`}>
            {order.passengerName}
          </Text>
          <View className="flex-row items-center ml-2">
            <Icon as={Star} className="size-4 text-yellow-500 mr-1" />
            <Text className={`text-sm ${colors.textSecondary}`}>
              {order.rating}
            </Text>
          </View>
        </View>
        <Text className={`text-lg font-bold text-green-500`}>
          {order.price}P
        </Text>
      </View>

      <View className="mb-2">
        <Text className={`text-sm ${colors.textPrimary}`} numberOfLines={1}>
          📍 {order.startAddress}
        </Text>
        <Text className={`text-sm ${colors.textPrimary}`} numberOfLines={1}>
          🎯 {order.endAddress}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Icon as={MessageCircle} className="size-4 text-blue-500 mr-2" />
          <Text className={`text-sm ${colors.textSecondary}`}>
            {order.timeToArrival}
          </Text>
        </View>
        <Button 
          onPress={() => onAcceptOrder(order)}
          className="bg-green-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Принять</Text>
        </Button>
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${colors.background}`}>
      <View className={`p-6 border-b ${colors.border}`}>
        <Text className={`text-2xl font-bold mb-2 ${colors.textPrimary}`}>
          Добро пожаловать, Алексей!
        </Text>
        
        <Text className={`text-lg ${colors.textPrimary} mb-6`}>
          За этот месяц: <Text className="text-green-500 font-semibold">+{earnings}P</Text>
        </Text>
        
        <View className="flex-row justify-between gap-2">
          <Button variant="ghost" className="flex-1">
            <Text className={colors.textPrimary}>Открыть профиль</Text>
          </Button>
          <Button variant="ghost" className="flex-1">
            <Text className={colors.textPrimary}>Посмотреть график</Text>
          </Button>
          <Button variant="ghost" className="flex-1">
            <Text className={colors.textPrimary}>История поездок</Text>
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6">
          <Text className={`text-xl font-semibold mb-4 ${colors.textPrimary}`}>
            Новые заказы ({incomingOrders.length})
          </Text>
          
          {incomingOrders.length === 0 ? (
            <View className={`p-8 rounded-2xl ${colors.card} border ${colors.border} items-center`}>
              <Text className={`text-center ${colors.textSecondary}`}>
                Заказов пока нет
              </Text>
            </View>
          ) : (
            incomingOrders.map((order) => renderOrderCard(order))
          )}
        </View>
      </ScrollView>
    </View>
  );
  
}

