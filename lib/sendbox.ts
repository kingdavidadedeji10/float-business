import { Address, SendboxQuoteResponse, SendboxBookingResponse } from '@/types/delivery';

const SENDBOX_API_URL = process.env.SENDBOX_API_URL || 'https://api.sendbox.co';
const SENDBOX_API_KEY = process.env.SENDBOX_API_KEY;

export function determineDeliveryMethod(
  sizeCategory: 'small' | 'medium' | 'large' | string,
  originState: string,
  destinationState: string
): 'motorcycle' | 'van' {
  const isInterstate = originState !== destinationState;

  if (sizeCategory === 'small' && !isInterstate) {
    return 'motorcycle';
  } else {
    return 'van';
  }
}

export async function getSendboxQuote({
  origin_address,
  destination_address,
  weight,
  size_category,
}: {
  origin_address: Address;
  destination_address: Address;
  weight: number;
  size_category: 'small' | 'medium' | 'large';
}): Promise<SendboxQuoteResponse> {
  const deliveryMethod = determineDeliveryMethod(
    size_category,
    origin_address.state,
    destination_address.state
  );

  const response = await fetch(`${SENDBOX_API_URL}/shipping/rates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDBOX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin: {
        street: origin_address.street,
        city: origin_address.city,
        state: origin_address.state,
        country: origin_address.country || 'Nigeria',
      },
      destination: {
        street: destination_address.street,
        city: destination_address.city,
        state: destination_address.state,
        country: destination_address.country || 'Nigeria',
      },
      weight,
      package_size: size_category,
      delivery_type: deliveryMethod,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sendbox API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    success: true,
    quotes: data.rates || [],
  };
}

export async function bookSendboxShipment({
  origin_address,
  destination_address,
  weight,
  size_category,
  sender_name,
  sender_phone,
  receiver_name,
  receiver_phone,
  receiver_email,
  item_description,
}: {
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
}): Promise<SendboxBookingResponse> {
  const deliveryMethod = determineDeliveryMethod(
    size_category,
    origin_address.state,
    destination_address.state
  );

  const response = await fetch(`${SENDBOX_API_URL}/shipping/shipments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDBOX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      origin: {
        street: origin_address.street,
        city: origin_address.city,
        state: origin_address.state,
        country: origin_address.country || 'Nigeria',
        name: sender_name,
        phone: sender_phone,
      },
      destination: {
        street: destination_address.street,
        city: destination_address.city,
        state: destination_address.state,
        country: destination_address.country || 'Nigeria',
        name: receiver_name,
        phone: receiver_phone,
        email: receiver_email,
      },
      weight,
      package_size: size_category,
      delivery_type: deliveryMethod,
      item_description,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sendbox booking error: ${response.status}`);
  }

  const data = await response.json();
  return {
    success: true,
    shipment_id: data.shipment_id,
    tracking_code: data.tracking_code,
    courier_name: data.courier_name,
    estimated_delivery_date: data.estimated_delivery_date,
  };
}

export async function getShipmentStatus(trackingCode: string) {
  const response = await fetch(`${SENDBOX_API_URL}/shipping/track/${trackingCode}`, {
    headers: {
      'Authorization': `Bearer ${SENDBOX_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Sendbox tracking error: ${response.status}`);
  }

  return response.json();
}
