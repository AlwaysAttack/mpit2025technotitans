// hooks/useOrderSync.ts
import { useState, useEffect } from 'react';
import { Order } from '../types/order';

const SERVER_URL = 'http://192.168.0.106:3000/orders'; // локальный сервер

export function useOrderSync() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(SERVER_URL);
      const data: Order[] = await res.json();
      setOrders(data.filter(o => o.status === 'searching'));
      console.log('🌍 Orders fetched:', data.length);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const addOrder = async (order: Order) => {
    try {
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      console.log('🌍 Added order:', order.id);
      fetchOrders();
    } catch (err) {
      console.error('Error adding order:', err);
    }
  };

  const acceptOrder = async (orderId: string, driverId = 'driver-1') => {
    try {
      const orderRes = await fetch(`${SERVER_URL}/${orderId}`);
      const order: Order = await orderRes.json();
      const updatedOrder = { ...order, status: 'driver_assigned', driverId };
      await fetch(`${SERVER_URL}/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      console.log('✅ Accepted order:', orderId);
      fetchOrders();
    } catch (err) {
      console.error('Error accepting order:', err);
    }
  };

  // ➖ Удаление заказа
  const removeOrder = async (orderId: string) => {
    try {
      await fetch(`${SERVER_URL}/${orderId}`, { method: 'DELETE' });
      console.log('🗑 Removed order:', orderId);
      fetchOrders();
    } catch (err) {
      console.error('Error removing order:', err);
    }
  };

  return { orders, addOrder, acceptOrder, removeOrder };
}
