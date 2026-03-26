import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { OrderItem } from '@/lib/database.types'

interface SearchParams { status?: string; date?: string }

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, profiles(full_name, email, phone)')
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.date) query = query.eq('exchange_date', params.date)

  const { data: orders } = await query

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <a
            key={s}
            href={s === 'all' ? '/admin/orders' : `/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
              (params.status || 'all') === s
                ? 'bg-(--color-primary) text-white border-(--color-primary)'
                : 'border-(--color-border) text-(--color-foreground) hover:border-(--color-primary)'
            }`}
          >
            {s === 'all' ? 'All Orders' : s}
          </a>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-(--color-border)">
          <p className="text-(--color-muted)">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-(--color-background) text-(--color-muted) uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Customer</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Exchange</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {orders.map((order) => {
                const items = order.items as unknown as OrderItem[]
                const profile = order.profiles as { full_name: string; email: string; phone: string } | null
                return (
                  <tr key={order.id} className="hover:bg-(--color-background) transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-(--color-foreground)">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-(--color-muted)">{new Date(order.created_at).toLocaleDateString('en-HK')}</p>
                      <p className="text-xs text-(--color-muted)">{items.length} item(s)</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-(--color-foreground)">{profile?.full_name || '—'}</p>
                      <p className="text-xs text-(--color-muted)">{profile?.phone || profile?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-(--color-muted) text-xs">
                      <p>{new Date(order.exchange_date + 'T00:00:00').toLocaleDateString('en-HK', { month: 'short', day: 'numeric' })}</p>
                      <p>{order.exchange_time_slot}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-(--color-primary)">
                      HK${Number(order.total_amount).toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/orders/${order.id}`} className="text-(--color-primary) hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
