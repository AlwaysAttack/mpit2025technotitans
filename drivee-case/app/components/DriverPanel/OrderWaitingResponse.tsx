// components/DriverPanel/OrderWaitingResponse.tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

interface OrderWaitingResponseProps {
  offerId?: string; // теперь необязательный
  onCancel: () => void;
}

export function OrderWaitingResponse({ offerId, onCancel }: OrderWaitingResponseProps) {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-lg font-semibold mb-4">Ожидание пассажира...</Text>
      <Text className="text-center mb-6">
        {offerId
          ? `Мы ожидаем подтверждения пассажира по вашему офферу ${offerId}`
          : 'Мы ожидаем подтверждения пассажира'}
      </Text>
      <Button onPress={onCancel} className="bg-red-500 px-6 py-3 rounded-lg">
        <Text className="text-white font-semibold">Отменить</Text>
      </Button>
    </View>
  );
}
