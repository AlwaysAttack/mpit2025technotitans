// components/DriverPanel/OrderListPanel.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Order } from '../../hooks/useOrders';

interface OrderListPanelProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onBack: () => void;
}

export function OrderListPanel({ orders, onSelectOrder, onBack }: OrderListPanelProps) {
  const { colorScheme } = useColorScheme();

  const colors = {
    background: colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    card: colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    textPrimary: colorScheme === 'dark' ? 'text-white' : 'text-gray-900',
    textSecondary: colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    border: colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  };

  return (
    <View className={`flex-1 ${colors.background}`}>
      {/* Хедер */}
      <View className={`flex-row items-center p-6 border-b ${colors.border}`}>
        <Button variant="ghost" onPress={onBack} className="mr-4">
          <Icon as={ArrowLeft} className="size-5" />
        </Button>
        <Text className={`text-xl font-semibold ${colors.textPrimary}`}>
          Все заказы ({orders.length})
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text className={`text-lg ${colors.textSecondary} text-center`}>
              Нет доступных заказов
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {orders.map((order) => (
              <View
                key={order.id}
                className={`p-4 rounded-2xl ${colors.card} border ${colors.border} mb-3 shadow-sm`}
              >
                <Text className={`text-lg font-semibold mb-2 ${colors.textPrimary}`}>
                  {order.startAddress} → {order.endAddress}
                </Text>
                <Text className={`text-green-500 font-bold text-lg mb-2`}>
                  {order.price}P
                </Text>
                <Button 
                  onPress={() => onSelectOrder(order)}
                  className="bg-green-500 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Выбрать</Text>
                </Button>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}