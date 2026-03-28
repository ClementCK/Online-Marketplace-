'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderItem } from '@/lib/database.types'
import toast from 'react-hot-toast'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [order, setOrder] = useState<Order & { profiles?: { full_name: string; email: string; phone: string } } | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!params.id) return
    supabase
      .from('orders')
      .select('*, profiles(full_name, email, phone)')
      .eq('id', params.id as string)
      .single()
      .then(({ data }) => {
        if (data) { setOrder(data as any); setNotes(data.admin_notes || '') }
      })
  }, [params.id])

  const updateStatus = async (status: string) => {
    if (!order) return
    setSaving(true)

    // Save notes first
    await supabase.from('orders').update({ admin_notes: notes }).eq('id', order.id)

    if (status === 'cancelled') {
      // Use cancel API for atomic stock restoration
      const res = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel order')
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order.id)
      if (error) { toast.error('Update failed'); setSaving(false); return }
    }

    toast.success(`Order marked as ${status}`)
    setOrder({ ...order, status: status as any })
    setSaving(false)
  }

  const saveNotes = async () => {
    if (!order) return
    setSaving(true)
    await supabase.from('orders').update({ admin_notes: notes }).eq('id', order.id)
    toast.success('Notes saved')
    setSaving(false)
  }

  if (!order) return <div className="text-(--color-muted)">Loading…</div>

  const items = order.items as unknown as OrderItem[]
  const profile = order.profiles

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-(--color-muted) hover:text-(--color-foreground)">←</button>
        <div>
          <h1 className="text-2xl font-bold text-(--color-foreground)">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-(--color-muted)">{new Date(order.created_at).toLocaleString('en-HK')}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColors[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <h2 className="font-bold text-(--color-foreground) mb-3">Customer</h2>
          {profile ? (
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {profile.full_name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
            </div>
          ) : <p className="text-sm text-(--color-muted)">Customer info unavailable</p>}
        </div>

        {/* Exchange Details */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <h2 className="font-bold text-(--color-foreground) mb-3">Exchange Details</h2>
          <div className="space-y-1 text-sm">
            <p><strong>Date:</strong> {formatDate(order.exchange_date)}</p>
            <p><strong>Time:</strong> {order.exchange_time_slot}</p>
            <p><strong>Location:</strong> Central MTR Station, Exit A</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <h2 className="font-bold text-(--color-foreground) mb-3">Items</h2>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-(--color-foreground)">{item.name} × {item.quantity} <span className="text-(--color-muted)">(Size {item.size})</span></span>
                <span className="font-medium">HK${(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-(--color-border) pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-(--color-primary)">HK${Number(order.total_amount).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Admin Notes + Actions */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <h2 className="font-bold text-(--color-foreground) mb-3">Admin Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes…"
            className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-(--color-primary) mb-3"
          />
          <button onClick={saveNotes} disabled={saving}
            className="w-full py-2 rounded-lg border border-(--color-primary) text-(--color-primary) text-sm font-medium hover:bg-blue-50 transition-colors mb-4 disabled:opacity-60">
            Save Notes
          </button>

          <h3 className="font-semibold text-(--color-foreground) mb-2 text-sm">Update Status</h3>
          <div className="flex gap-2">
            {order.status !== 'completed' && (
              <button
                onClick={() => updateStatus('completed')}
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                Mark Completed
              </button>
            )}
            {order.status === 'confirmed' && (
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
