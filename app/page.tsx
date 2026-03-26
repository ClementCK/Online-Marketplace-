import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/products/ProductCard'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .gt('stock_qty', 0)
    .order('created_at', { ascending: false })
    .limit(8)

  const categories = [
    { name: 'Tops', emoji: '👚', value: 'tops' },
    { name: 'Bottoms', emoji: '👖', value: 'bottoms' },
    { name: 'Dresses', emoji: '👗', value: 'dresses' },
    { name: 'Accessories', emoji: '👜', value: 'accessories' },
    { name: 'Shoes', emoji: '👟', value: 'shoes' },
    { name: 'Bags', emoji: '👝', value: 'bags' },
  ]

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-(--color-primary) to-(--color-primary-light) text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your Filipino Shopping<br />Marketplace in 🇭🇰 HK
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Discover affordable pre-loved clothing from the Filipino community. New items added weekly!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="bg-white text-(--color-primary) px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/signup"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                Join Free
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/70">
              <span>✅ Pre-loved clothing</span>
              <span>✅ Weekend in-person exchange</span>
              <span>✅ Filipino community trusted</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-(--color-foreground) mb-8">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: '🔍', title: 'Browse & Add to Cart', desc: 'Find clothing you love and add to your cart' },
                { emoji: '📅', title: 'Book Exchange Slot', desc: 'Pick a convenient weekend time slot' },
                { emoji: '🤝', title: 'Meet & Collect', desc: 'Meet the seller in person to receive your items' },
              ].map((item) => (
                <div key={item.title} className="flex flex-col items-center p-6 rounded-2xl bg-(--color-background)">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <h3 className="font-bold text-(--color-foreground) mb-2">{item.title}</h3>
                  <p className="text-(--color-muted) text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 px-4 bg-(--color-background)">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-(--color-foreground) mb-6 text-center">Shop by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/products?category=${cat.value}`}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl border border-(--color-border) hover:border-(--color-primary) hover:shadow-sm transition-all group"
                >
                  <span className="text-3xl mb-2">{cat.emoji}</span>
                  <span className="text-sm font-medium text-(--color-foreground) group-hover:text-(--color-primary)">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-12 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-(--color-foreground)">New Arrivals</h2>
                <Link href="/products" className="text-(--color-primary) text-sm font-medium hover:underline">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="py-12 px-4 bg-(--color-primary) text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to shop?</h2>
          <p className="text-white/80 mb-6 text-sm">Browse hundreds of pre-loved items from the Filipino community in HK</p>
          <Link
            href="/products"
            className="inline-block bg-(--color-accent) text-(--color-foreground) px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            Browse All Items
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
