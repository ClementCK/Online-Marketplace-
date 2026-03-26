import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-(--color-foreground)">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-(--color-primary) text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-(--color-primary-dark) transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-(--color-border)">
          <p className="text-(--color-muted) mb-4">No products yet</p>
          <Link href="/admin/products/new" className="text-(--color-primary) font-medium hover:underline">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-(--color-background) text-(--color-muted) uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-(--color-background) transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-(--color-foreground) line-clamp-1">{product.name}</p>
                      <p className="text-xs text-(--color-muted)">Size {product.size} · {product.condition}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell capitalize text-(--color-muted)">{product.category}</td>
                  <td className="px-4 py-3 font-medium text-(--color-primary)">HK${Number(product.price).toFixed(0)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`font-semibold ${product.stock_qty === 0 ? 'text-red-600' : product.stock_qty <= 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {product.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-(--color-primary) hover:underline text-xs font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
