import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalOrders },
    { count: confirmedOrders },
    { count: totalProducts },
    { data: lowStockProducts },
    { data: recentOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('id, name, stock_qty').eq('is_active', true).lte('stock_qty', 1).order('stock_qty'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total_amount').eq('status', 'completed'),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  const statusColors: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: totalOrders || 0, icon: '🧾', color: 'bg-blue-50 text-blue-700' },
          { label: 'Pending Exchange', value: confirmedOrders || 0, icon: '📅', color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Active Products', value: totalProducts || 0, icon: '👗', color: 'bg-purple-50 text-purple-700' },
          { label: 'Revenue (HKD)', value: `$${totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-green-50 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color}`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-(--color-foreground)">⚠️ Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-xs text-(--color-primary) hover:underline">View all</Link>
          </div>
          {!lowStockProducts || lowStockProducts.length === 0 ? (
            <p className="text-sm text-(--color-muted)">All products have adequate stock ✅</p>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-(--color-foreground) truncate mr-2">{p.name}</span>
                  <span className={`shrink-0 font-semibold px-2 py-0.5 rounded-full text-xs ${p.stock_qty === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stock_qty === 0 ? 'SOLD OUT' : `${p.stock_qty} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-(--color-border) p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-(--color-foreground)">🧾 Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-(--color-primary) hover:underline">View all</Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <p className="text-sm text-(--color-muted)">No orders yet</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between hover:bg-(--color-background) rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-(--color-foreground)">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-(--color-muted)">
                        {new Date(order.created_at).toLocaleDateString('en-HK')} · HK${Number(order.total_amount).toFixed(0)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/products/new', label: 'Add Product', icon: '➕' },
          { href: '/admin/orders', label: 'Manage Orders', icon: '🧾' },
          { href: '/admin/exchange-slots', label: 'Manage Slots', icon: '📅' },
          { href: '/admin/inventory', label: 'View Inventory', icon: '📦' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center p-4 bg-white rounded-2xl border border-(--color-border) hover:border-(--color-primary) hover:shadow-sm transition-all text-center"
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-(--color-foreground)">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
