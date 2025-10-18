// types/order.ts
export interface Order {
    id: string;
    passengerId: string;
    startAddress: string;
    endAddress: string;
    startLocation: {
      latitude: number;
      longitude: number;
    };
    endLocation: {
      latitude: number;
      longitude: number;
    };
    distance: number;
    duration: number;
    price: number;
    status: 'searching' | 'driver_assigned' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: Date;
    driverId?: string;
  }

export default Order;