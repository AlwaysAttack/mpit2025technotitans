// hooks/usePassengerPanel.ts
import { useState, useCallback } from 'react';

export type BookingState = 
  | 'idle'
  | 'destination_set'
  | 'ordering'
  | 'confirming'
  | 'searching_driver'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed';

export interface BookingContext {
  destination: any;
  price: string;
  numericPrice: number;
  tripType: 'ride' | 'intercity' | 'courier';
  routeInfo: any;
}

export function usePassengerPanel(initialContext: Partial<BookingContext> = {}) {
  const [state, setState] = useState<BookingState>('idle');
  const [context, setContext] = useState<BookingContext>({
    destination: null,
    price: 'Предложите цену',
    numericPrice: 0,
    tripType: 'ride',
    routeInfo: null,
    ...initialContext,
  });

  const send = useCallback((event: any) => {
    console.log('📤 Sending event:', event, 'from state:', state);
    
    setState(currentState => {
      let nextState = currentState;
      
      switch (currentState) {
        case 'idle':
          if (event.type === 'SET_DESTINATION') nextState = 'destination_set';
          if (event.type === 'CONFIRM_ORDER') nextState = 'searching_driver'; // Прямой переход!
          break;
        case 'destination_set':
          if (event.type === 'START_ORDER') nextState = 'ordering';
          if (event.type === 'CONFIRM_ORDER') nextState = 'searching_driver'; // И отсюда тоже
          if (event.type === 'CLEAR_DESTINATION') nextState = 'idle';
          break;
        case 'ordering':
          if (event.type === 'CONFIRM_ORDER') nextState = 'confirming';
          if (event.type === 'CANCEL_ORDER') nextState = 'destination_set';
          break;
        case 'confirming':
          if (event.type === 'DRIVER_FOUND') nextState = 'searching_driver';
          if (event.type === 'CANCEL_ORDER') nextState = 'ordering';
          break;
        case 'searching_driver':
          if (event.type === 'DRIVER_ASSIGNED') nextState = 'driver_assigned';
          if (event.type === 'CANCEL_ORDER') nextState = 'idle';
          break;
        case 'driver_assigned':
          if (event.type === 'DRIVER_ARRIVED') nextState = 'in_progress';
          if (event.type === 'CANCEL_ORDER') nextState = 'idle';
          break;
        case 'in_progress':
          if (event.type === 'RIDE_COMPLETED') nextState = 'completed';
          break;
        case 'completed':
          if (event.type === 'RESET') nextState = 'idle';
          break;
        default:
          nextState = currentState;
      }
      
      if (nextState !== currentState) {
        console.log('🔄 State transition:', currentState, '→', nextState);
      } else {
        console.log('⚠️ No state transition for event:', event.type, 'in state:', currentState);
      }
      
      return nextState;
    });
  }, [state]);

  const updateContext = useCallback((updates: Partial<BookingContext>) => {
    console.log('🔄 Updating context with:', updates);
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePrice = useCallback((numericPrice: number) => {
    console.log('💰 Updating price to:', numericPrice);
    setContext(prev => ({
      ...prev,
      price: `${numericPrice}₽`,
      numericPrice: numericPrice,
    }));
  }, []);

  return {
    state,
    context,
    send,
    updateContext,
    updatePrice,
  };
}