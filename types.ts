
export enum Category {
  FLIGHT = 'Vuelo',
  TRAIN = 'Tren',
  BUS = 'Autobús',
  HOTEL = 'Hospedaje',
  ACTIVITY = 'Actividad',
  MUSEUM = 'Museo',
  DINING = 'Comida',
  OTHER = 'Otro'
}

export enum PaymentStatus {
  PAID = 'Pagado',
  PENDING = 'Pendiente',
  PARTIAL = 'Parcial'
}

export interface TripItem {
  id: string;
  title: string;
  category: Category;
  date: string; // ISO string YYYY-MM-DD
  time?: string;
  location: string;
  cost: number;
  currency: string;
  paymentStatus: PaymentStatus;
  notes?: string;
  bookingReference?: string;
  duration?: string;
}

export interface TripSegment {
  id: string;
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  items: TripItem[];
}
