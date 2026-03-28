import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Order, OrderItem } from '@/lib/database.types'
import CancelOrderButton from '@/components/orders/CancelOrderButton'

const statusColors: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/account/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    })

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">My Orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-xl font-semibold text-(--color-foreground) mb-2">No orders yet</p>
            <p className="text-(--color-muted) mb-6">Start shopping and your orders will appear here</p>
            <Link
              href="/products"
              className="inline-block bg-(--color-primary) text-white px-8 py-3 rounded-full font-semibold hover:bg-(--color-primary-dark) transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => {
              const items = order.items as unknown as OrderItem[]
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-(--color-border) p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-(--color-muted)">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-(--color-muted) mt-0.5">
                        Placed: {new Date(order.created_at).toLocaleDateString('en-HK')}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-2 mb-4">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-(--color-foreground)">{item.name} × {item.quantity}</span>
                        <span className="text-(--color-muted)">HK${(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-(--color-border) pt-3 flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-(--color-foreground)">
                        💰 Total: HK${order.total_amount.toFixed(0)}
                      </p>
                      {order.status === 'confirmed' && (
                        <CancelOrderButton orderId={order.id} />
                      )}
                    </div>
                    {order.status === 'confirmed' && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-(--color-foreground)">📅 Exchange</p>
                        <p className="text-xs text-(--color-muted)">
                          {formatDate(order.exchange_date)} · {order.exchange_time_slot}
                        </p>
                        <p className="text-xs text-(--color-muted)">📍 Central MTR Station, Exit A</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </main>
  )
}
