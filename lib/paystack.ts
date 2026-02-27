interface PaymentParams {
  email: string;
  amount: number;
  subaccount?: string | null;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function createPayment({ email, amount, subaccount, metadata, callbackUrl }: PaymentParams): Promise<PaystackResponse> {
  const body: Record<string, unknown> = {
    email,
    amount: amount * 100, // convert to kobo
  };

  if (subaccount) {
    body.subaccount = subaccount;
    body.bearer = "subaccount";
  }

  if (metadata) {
    body.metadata = metadata;
  }

  if (callbackUrl) {
    body.callback_url = callbackUrl;
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
