import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { storeId, bankCode, accountNumber } = await request.json()

  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single()

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const response = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_name: store.name,
      bank_code: bankCode,
      account_number: accountNumber,
      percentage_charge: 5,
    }),
  })

  const data = await response.json()

  if (!data.status) {
    return NextResponse.json({ error: data.message }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('stores')
    .update({
      subaccount_code: data.data.subaccount_code,
      bank_name: data.data.bank_name,
      account_number: accountNumber,
      account_name: data.data.account_name,
      payment_status: 'active',
    })
    .eq('id', storeId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save bank details' }, { status: 500 })
  }

  return NextResponse.json({ success: true, account_name: data.data.account_name, subaccount_code: data.data.subaccount_code })
}
