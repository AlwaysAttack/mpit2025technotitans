// hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from 'react';
import { useOrders, Order } from '../providers/OrdersProvider';

export function useWebSocket() {
  const { addOrder, acceptOrder } = useOrders();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Для демо используем локальное состояние
    // В реальном приложении подключись к WebSocket серверу
    console.log('🌐 WebSocket hook initialized (demo mode)');
    
    // Эмуляция получения заказов
    const interval = setInterval(() => {
      console.log('🔍 Checking for new orders...');
    }, 5000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendOrder = useCallback((order: Order) => {
    console.log('📤 WebSocket отправляет заказ:', order.id);
    console.log('📍 От:', order.startAddress);
    console.log('🎯 До:', order.endAddress);
    console.log('💰 Цена:', order.price);
    // В реальном приложении отправляй через WebSocket
    // socket.send(JSON.stringify({ type: 'NEW_ORDER', order }));
  }, []);

  return { sendOrder };
}