export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface StatusUpdate {
  status: string;
  timestamp: string;
  description?: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  sendbox_shipment_id: string | null;
  tracking_code: string | null;
  courier_name: string | null;
  delivery_type: 'pickup' | 'delivery';
  delivery_method: string | null;
  origin_address: Address | null;
  destination_address: Address | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  status_history: StatusUpdate[];
  estimated_delivery_date: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface SendboxQuoteRequest {
  origin_address: Address;
  destination_address: Address;
  weight: number;
  size_category: 'small' | 'medium' | 'large';
}

export interface SendboxQuoteResponse {
  success: boolean;
  quotes: {
    courier_name: string;
    delivery_method: string;
    price: number;
    estimated_days: number;
  }[];
}

export interface SendboxBookingRequest {
  origin_address: Address;
  destination_address: Address;
  weight: number;
  size_category: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_email: string;
  item_description: string;
}

export interface SendboxBookingResponse {
  success: boolean;
  shipment_id: string;
  tracking_code: string;
  courier_name: string;
  estimated_delivery_date: string;
}
