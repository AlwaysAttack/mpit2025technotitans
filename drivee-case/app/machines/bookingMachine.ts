export type BookingState = 
  | 'idle'              // Исходное состояние
  | 'destination_set'   // Назначение выбрано
  | 'ordering'          // Процесс заказа (расширенная панель)
  | 'confirming'        // Подтверждение заказа
  | 'searching_driver'  // Поиск водителя
  | 'driver_assigned'   // Водитель назначен
  | 'in_progress'       // Поездка в процессе
  | 'completed';        // Поездка завершена

export type BookingEvent =
  | { type: 'SET_DESTINATION' }
  | { type: 'CLEAR_DESTINATION' }
  | { type: 'START_ORDER' }
  | { type: 'CONFIRM_ORDER' }
  | { type: 'CANCEL_ORDER' }
  | { type: 'DRIVER_FOUND' }
  | { type: 'DRIVER_ARRIVED' }
  | { type: 'RIDE_STARTED' }
  | { type: 'RIDE_COMPLETED' }
  | { type: 'RESET' };

type TripType = 'ride' | 'intercity' | 'courier';

export interface BookingContext {
  destination: any;
  price: string;
  tripType: TripType;
  routeInfo: any;
}

export const bookingMachine = {
  idle: {
    on: {
      SET_DESTINATION: 'destination_set',
    },
  },
  destination_set: {
    on: {
      START_ORDER: 'ordering',
      CLEAR_DESTINATION: 'idle',
    },
  },
  ordering: {
    on: {
      CONFIRM_ORDER: 'confirming',
      CANCEL_ORDER: 'destination_set',
    },
  },
  confirming: {
    on: {
      DRIVER_FOUND: 'searching_driver',
      CANCEL_ORDER: 'ordering',
    },
  },
  searching_driver: {
    on: {
      DRIVER_ASSIGNED: 'driver_assigned',
      CANCEL_ORDER: 'idle',
    },
  },
  driver_assigned: {
    on: {
      DRIVER_ARRIVED: 'in_progress',
      CANCEL_ORDER: 'idle',
    },
  },
  in_progress: {
    on: {
      RIDE_COMPLETED: 'completed',
    },
  },
  completed: {
    on: {
      RESET: 'idle',
    },
  },
};