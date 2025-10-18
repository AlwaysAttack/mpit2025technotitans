// providers/OrdersProvider.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { globalOrders, addGlobalOrder, getGlobalPendingOrders, acceptGlobalOrder } from '../../lib/globalOrders';

export interface Order {
  id: string;
  passengerName: string;
  rating: number;
  carModel: string;
  timeToArrival: string;
  price: number;
  startAddress: string;
  endAddress: string;
  distance: number;
  duration: number;
  passengerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'createdAt'>) => Order;
  acceptOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  getPendingOrders: () => Order[];
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

interface OrdersProviderProps {
  children: ReactNode;
}

export function OrdersProvider({ children }: OrdersProviderProps) {
  const [orders, setOrders] = useState<Order[]>(globalOrders);

  // Синхронизируем локальное состояние с глобальным при изменении
  useEffect(() => {
    const syncWithGlobal = () => {
      setOrders([...globalOrders]);
    };
    
    // Можно добавить механизм подписки на изменения globalOrders
    // Пока просто синхронизируем при каждом рендере
    syncWithGlobal();
  }, [globalOrders.length]); // Следим за изменением количества заказов

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date(),
    };

    // Добавляем в глобальное состояние
    addGlobalOrder(newOrder);
    // Синхронизируем локальное состояние
    setOrders([...globalOrders]);
    
    console.log('📦 Новый заказ создан:', newOrder);
    console.log('🌍 Всего заказов в глобальном состоянии:', globalOrders.length);
    return newOrder;
  }, []);

  const acceptOrder = useCallback((orderId: string) => {
    // Обновляем глобальное состояние
    acceptGlobalOrder(orderId);
    // Синхронизируем локальное состояние
    setOrders([...globalOrders]);
    
    console.log('✅ Заказ принят:', orderId);
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    // Обновляем глобальное состояние
    // cancelGlobalOrder(orderId);
    // Синхронизируем локальное состояние
    setOrders([...globalOrders]);
    
    console.log('❌ Заказ отменен:', orderId);
  }, []);

  const getPendingOrders = useCallback(() => {
    // Используем глобальное состояние для получения заказов
    return getGlobalPendingOrders();
  }, []);

  const value: OrdersContextType = {
    orders,
    addOrder,
    acceptOrder,
    cancelOrder,
    getPendingOrders,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}