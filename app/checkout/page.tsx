'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import type { ExchangeSlot } from '@/lib/database.types'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, totalPrice, clearCart } = useCartStore()
  const [slots, setSlots] = useState<ExchangeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ExchangeSlot | null>(null)
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    supabase
      .from('exchange_slots')
      .select('*')
      .eq('is_active', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })
      .then(({ data }) => setSlots(data || []))
  }, [])

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      toast.error('Please select an exchange slot')
      return
    }

    setPlacing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login?next=/checkout')
      return
    }

    const orderItems = items.map(({ product, quantity }) => ({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: product.size,
      image_url: (product.image_urls as string[])?.[0] || '',
    }))

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items: orderItems,
        total_amount: totalPrice(),
        status: 'confirmed',
        exchange_date: selectedSlot.date,
        exchange_time_slot: selectedSlot.time_slot,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to place order. Please try again.')
      setPlacing(false)
      return
    }

    // Decrement stock for each product
    for (const { product, quantity } of items) {
      await supabase.rpc('decrement_stock', { product_id: product.id, qty: quantity })
    }

    // Increment slot bookings
    await supabase
      .from('exchange_slots')
      .update({ current_bookings: selectedSlot.current_bookings + 1 })
      .eq('id', selectedSlot.id)

    clearCart()
    router.push(`/checkout/confirmation?order_id=${order.id}`)
  }

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, ExchangeSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    if (slot.current_bookings < slot.max_bookings) {
      acc[slot.date].push(slot)
    }
    return acc
  }, {})

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exchange Slot Selection */}
          <div>
            <h2 className="font-bold text-(--color-foreground) mb-4">Select Exchange Slot</h2>
            <p className="text-sm text-(--color-muted) mb-4">
              Choose a weekend time to collect your items in person.
            </p>

            {Object.keys(slotsByDate).length === 0 ? (
              <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                <p className="text-yellow-800 font-medium">No exchange slots available</p>
                <p className="text-yellow-700 text-sm mt-1">Please check back soon or contact us.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                  <div key={date} className="bg-white rounded-xl border border-(--color-border) p-4">
                    <p className="font-semibold text-(--color-foreground) text-sm mb-3">{formatDate(date)}</p>
                    <div className="flex flex-wrap gap-2">
                      {dateSlots.map((slot) => {
                        const isFull = slot.current_bookings >= slot.max_bookings
                        const isSelected = selectedSlot?.id === slot.id
                        return (
                          <button
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                              isSelected
                                ? 'bg-(--color-primary) text-white border-(--color-primary)'
                                : isFull
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'border-(--color-border) hover:border-(--color-primary) text-(--color-foreground)'
                            }`}
                          >
                            {slot.time_slot}
                            {isFull && ' (Full)'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exchange Info */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-200">
              <p className="font-semibold mb-1">📍 Exchange Location</p>
              <p>Central, Hong Kong (exact location shared after booking)</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="font-bold text-(--color-foreground) mb-4">Order Summary</h2>
            <div className="bg-white rounded-xl border border-(--color-border) p-4 space-y-3 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-(--color-foreground) truncate mr-2">
                    {product.name} <span className="text-(--color-muted)">× {quantity}</span>
                  </span>
                  <span className="font-medium shrink-0">HK${(product.price * quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-(--color-border) pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-(--color-primary)">HK${totalPrice().toFixed(0)}</span>
              </div>
            </div>

            {selectedSlot && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-sm text-green-800 mb-4">
                <p className="font-semibold">✅ Selected Slot</p>
                <p>{formatDate(selectedSlot.date)} · {selectedSlot.time_slot}</p>
              </div>
            )}

            <div className="bg-(--color-background) rounded-xl p-4 text-sm text-(--color-muted) mb-4">
              <p className="font-semibold text-(--color-foreground) mb-1">💳 Payment</p>
              <p>Payment is made in person at the exchange. No online payment required.</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedSlot}
              className="w-full bg-(--color-primary) text-white py-3 rounded-xl font-semibold hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60"
            >
              {placing ? 'Placing Order…' : 'Confirm Order'}
            </button>
          </div>
        </div>
    </main>
  )
}
