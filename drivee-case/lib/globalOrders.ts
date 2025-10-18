// lib/globalOrders.ts
import { Order } from "@/app/providers/OrdersProvider";

// Глобальный массив заказов
export let globalOrders: Order[] = [];

export const addGlobalOrder = (order: Order) => {
  globalOrders.push(order);
  console.log('🌍 Global order added. Total orders:', globalOrders.length);
};

export const getGlobalPendingOrders = () => {
  return globalOrders.filter(order => order.status === 'pending');
};

export const acceptGlobalOrder = (orderId: string) => {
  globalOrders = globalOrders.map(order => 
    order.id === orderId ? { ...order, status: 'accepted' } : order
  );
};