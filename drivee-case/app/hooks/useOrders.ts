// hooks/useOrders.ts
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'status' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date(),
    };

    setOrders(prev => [...prev, newOrder]);
    console.log('📦 Новый заказ создан:', newOrder);
    return newOrder;
  }, []);

  const acceptOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' } : order
    ));
    console.log('✅ Заказ принят:', orderId);
  }, []);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    console.log('❌ Заказ отменен:', orderId);
  }, []);

  const getPendingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const value: OrdersContextType = {
    orders,
    addOrder,
    acceptOrder,
    cancelOrder,
    getPendingOrders,
  };

//   return (
//     <OrdersContext.Provider value={value}>
//       {children}
//     </OrdersContext.Provider>
//   );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}