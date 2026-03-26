import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminInventoryPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('stock_qty', { ascending: true })

  const outOfStock = products?.filter((p) => p.stock_qty === 0) || []
  const lowStock = products?.filter((p) => p.stock_qty > 0 && p.stock_qty <= 1) || []
  const inStock = products?.filter((p) => p.stock_qty > 1) || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Inventory</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{outOfStock.length}</div>
          <div className="text-xs text-red-600 font-medium">Sold Out</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{lowStock.length}</div>
          <div className="text-xs text-yellow-600 font-medium">Low Stock (≤1)</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{inStock.length}</div>
          <div className="text-xs text-green-600 font-medium">In Stock</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--color-background) text-(--color-muted) uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Category / Size</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {[...outOfStock, ...lowStock, ...inStock].map((product) => (
              <tr key={product.id} className={product.stock_qty === 0 ? 'bg-red-50/30' : product.stock_qty <= 1 ? 'bg-yellow-50/30' : ''}>
                <td className="px-4 py-3">
                  <p className="font-medium text-(--color-foreground) line-clamp-1">{product.name}</p>
                  <p className="text-xs text-(--color-muted)">HK${Number(product.price).toFixed(0)}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-(--color-muted) capitalize">
                  {product.category} · Size {product.size}
                </td>
                <td className="px-4 py-3 text-center font-bold">
                  <span className={product.stock_qty === 0 ? 'text-red-600' : product.stock_qty <= 1 ? 'text-yellow-600' : 'text-green-600'}>
                    {product.stock_qty}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.stock_qty === 0 ? 'bg-red-100 text-red-700' :
                    product.stock_qty <= 1 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {product.stock_qty === 0 ? 'Sold Out' : product.stock_qty <= 1 ? 'Low Stock' : 'OK'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-(--color-primary) hover:underline text-xs font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
