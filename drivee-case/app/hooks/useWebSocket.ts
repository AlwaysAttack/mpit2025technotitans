// hooks/useWebSocket.ts
import { useCallback } from 'react';
import { Order } from '../types/order';
import { useOrderSync } from './useOrderSync';

export function useWebSocket() {
  const { addOrder } = useOrderSync();

  const sendOrder = useCallback((order: Order) => {
    console.log('📤 Эмуляция отправки заказа:', order.id);
    addOrder(order); // имитация доставки на "сервер"
  }, []);

  return { sendOrder };
}
