import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Order, OrderItem } from '@/lib/database.types'

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const { order_id } = await searchParams
  if (!order_id) return <div>Order not found</div>

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single()

  if (!order) return <div>Order not found</div>

  const items = order.items as unknown as OrderItem[]

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-(--color-foreground)">Order Confirmed!</h1>
          <p className="text-(--color-muted) mt-2">
            Your order has been placed. See you at the exchange!
          </p>
          <p className="text-xs text-(--color-muted) mt-1">Order ID: {order.id}</p>
        </div>

        {/* Exchange Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-blue-900 mb-3">📅 Exchange Details</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{formatDate(order.exchange_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Time:</span>
              <span>{order.exchange_time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Location:</span>
              <span>Central MTR Station, Exit A</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment:</span>
              <span>Pay in cash at exchange</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5 mb-6">
          <h2 className="font-bold text-(--color-foreground) mb-4">Your Items</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-(--color-foreground)">
                  {item.name} × {item.quantity}{' '}
                  <span className="text-(--color-muted)">(Size {item.size})</span>
                </span>
                <span className="font-medium">HK${(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-(--color-border) pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-(--color-primary)">HK${order.total_amount.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account/orders"
            className="flex-1 text-center bg-(--color-primary) text-white py-3 rounded-xl font-semibold hover:bg-(--color-primary-dark) transition-colors"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center border-2 border-(--color-primary) text-(--color-primary) py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
    </main>
  )
}
