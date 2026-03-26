import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/products/ProductCard'
import ProductFilters from '@/components/products/ProductFilters'

interface SearchParams {
  search?: string
  category?: string
  size?: string
  condition?: string
  min_price?: string
  max_price?: string
  sort?: string
  page?: string
  [key: string]: string | undefined
}

const PAGE_SIZE = 12

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const page = parseInt(params.page || '1')
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }
  if (params.category) query = query.eq('category', params.category)
  if (params.size) query = query.eq('size', params.size)
  if (params.condition) query = query.eq('condition', params.condition)
  if (params.min_price) query = query.gte('price', parseFloat(params.min_price))
  if (params.max_price) query = query.lte('price', parseFloat(params.max_price))

  const sort = params.sort || 'newest'
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })

  const { data: products, count } = await query.range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">
          {params.category
            ? params.category.charAt(0).toUpperCase() + params.category.slice(1)
            : 'All Items'}
          {count !== null && (
            <span className="text-(--color-muted) text-base font-normal ml-2">({count} items)</span>
          )}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-56 shrink-0">
            <ProductFilters currentParams={params} />
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {!products || products.length === 0 ? (
              <div className="text-center py-20 text-(--color-muted)">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-medium text-lg">No items found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium border transition-colors ${
                          p === page
                            ? 'bg-(--color-primary) text-white border-(--color-primary)'
                            : 'border-(--color-border) hover:border-(--color-primary) text-(--color-foreground)'
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
