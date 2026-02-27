interface DeliveryQuote {
  fee: number;
  courier: string;
  estimatedDays: string;
}

interface ShipmentBooking {
  trackingId: string;
  courier: string;
  status: string;
}

export async function getDeliveryQuote(
  sizeCategory: string,
  weight: number,
  pickupAddress: string,
  deliveryAddress: string
): Promise<DeliveryQuote> {
  // Simulated logic - replace with real Sendbox API later
  const isInterstate = !deliveryAddress.toLowerCase().includes(
    pickupAddress.split(',')[0]?.toLowerCase() || ''
  );

  let baseFee = 1500; // small
  if (sizeCategory === 'medium') baseFee = 2500;
  if (sizeCategory === 'large') baseFee = 4000;

  if (isInterstate) baseFee += 2000;

  return {
    fee: baseFee,
    courier: sizeCategory === 'large' ? 'Van Delivery' : 'Motorcycle',
    estimatedDays: isInterstate ? '3-5 days' : '1-2 days'
  };
}

export async function bookShipment(
  orderId: string,
  pickupAddress: string,
  deliveryAddress: string,
  sizeCategory: string
): Promise<ShipmentBooking> {
  // Simulated - replace with real Sendbox API later
  const trackingId = `FLT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return {
    trackingId,
    courier: sizeCategory === 'large' ? 'Van Delivery' : 'Motorcycle',
    status: 'booked'
  };
}
