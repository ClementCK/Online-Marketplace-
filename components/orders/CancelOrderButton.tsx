'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel order')
      } else {
        toast.success('Your order has been cancelled and the items are available again.')
        router.refresh()
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-2 mt-2">
        <p className="text-xs text-red-600 font-medium self-center">Are you sure? This cannot be undone.</p>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? 'Cancelling…' : 'Yes, Cancel'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs px-3 py-1.5 border border-(--color-border) rounded-lg hover:bg-(--color-background)"
        >
          Keep Order
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-2"
    >
      Cancel Order
    </button>
  )
}
