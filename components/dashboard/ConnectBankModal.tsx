"use client"

import { useState } from 'react'
import { banks } from '@/lib/banks'

interface Props {
  storeId: string
  storeName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (accountName: string, subaccountCode: string) => void
}

export function ConnectBankModal({ storeId, storeName, isOpen, onClose, onSuccess }: Props) {
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountName, setAccountName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/paystack/create-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, bankCode, accountNumber }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setAccountName(data.account_name)
        onSuccess(data.account_name, data.subaccount_code)
      }
    } catch {
      setError('Network error. Please try again.')
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Connect Bank Account</h2>
        <p className="text-gray-600 mb-4">
          Payments for <strong>{storeName}</strong> will be sent to this account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank</label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select bank...</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
              maxLength={10}
              placeholder="0123456789"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {accountName && (
            <p className="text-green-600 text-sm">✓ Connected: {accountName}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || accountNumber.length !== 10}
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
