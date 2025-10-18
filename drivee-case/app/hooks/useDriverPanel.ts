// hooks/useDriverPanel.ts
import { useState, useCallback } from 'react';
import { Order } from '../types/order'

export type DriverState = 
  | 'idle'
  | 'order_list'
  | 'order_details'
  | 'navigating_to_passenger'
  | 'waiting_for_passenger'
  | 'trip_in_progress'
  | 'trip_completed';

export interface DriverContext {
  selectedOrder: Order | null;
  orders: any[];
  earnings: number;
  mapState?: any; // Добавляем опциональное поле для mapState
}

export function useDriverPanel(initialContext: Partial<DriverContext> = {}) {
  const [state, setState] = useState<DriverState>('idle');
  const [context, setContext] = useState<DriverContext>({
    selectedOrder: null,
    orders: [],
    earnings: 0,
    ...initialContext,
  });

  const send = useCallback((event: any) => {
    console.log('📤 Driver panel event:', event, 'from state:', state);
    
    setState(currentState => {
      let nextState = currentState;
      
      switch (currentState) {
        case 'idle':
          if (event.type === 'SELECT_ORDER') nextState = 'order_details';
          break;
        case 'order_list':
          if (event.type === 'SELECT_ORDER') nextState = 'order_details';
          if (event.type === 'BACK_TO_IDLE') nextState = 'idle';
          break;
        case 'order_details':
          if (event.type === 'ACCEPT_ORDER') nextState = 'navigating_to_passenger';
          if (event.type === 'BACK_TO_LIST') nextState = 'idle';
          break;
        case 'navigating_to_passenger':
          if (event.type === 'ARRIVE_AT_PICKUP') nextState = 'waiting_for_passenger';
          if (event.type === 'CANCEL_ORDER') nextState = 'order_list';
          break;
        case 'waiting_for_passenger':
          if (event.type === 'PASSENGER_ENTERED') nextState = 'trip_in_progress';
          if (event.type === 'CANCEL_ORDER') nextState = 'order_list';
          break;
        case 'trip_in_progress':
          if (event.type === 'COMPLETE_TRIP') nextState = 'trip_completed';
          break;
        case 'trip_completed':
          if (event.type === 'BACK_TO_IDLE') nextState = 'idle';
          break;
        default:
          nextState = currentState;
      }
      
      if (nextState !== currentState) {
        console.log('🔄 Driver state transition:', currentState, '→', nextState);
      }
      
      return nextState;
    });

    // Обновляем контекст на основе событий
    if (event.type === 'SELECT_ORDER') {
      setContext(prev => ({ ...prev, selectedOrder: event.order }));
    } else if (event.type === 'ACCEPT_ORDER') {
      setContext(prev => ({ ...prev, currentOrder: context.selectedOrder }));
    } 
  }, [state, context.selectedOrder]);

  const updateContext = useCallback((updates: Partial<DriverContext>) => {
    console.log('🔄 Updating driver context with:', updates);
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    context,
    send,
    updateContext,
  };
}