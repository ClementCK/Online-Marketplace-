'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/lib/database.types'
import toast from 'react-hot-toast'

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  'like-new': 'bg-blue-100 text-blue-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-orange-100 text-orange-700',
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const supabase = createClient()

  useEffect(() => {
    if (!params.id) return
    supabase
      .from('products')
      .select('*')
      .eq('id', params.id as string)
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        if (!data) router.push('/products')
        setProduct(data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-(--color-muted)">Loading…</div>
      </main>
    )
  }

  if (!product) return null

  const imageArr = product.image_urls as string[]
  const images = imageArr?.length > 0 ? imageArr : ['/placeholder-product.svg']
  const isSoldOut = product.stock_qty === 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="text-sm text-(--color-muted) mb-6">
          <Link href="/" className="hover:text-(--color-primary)">Home</Link>
          {' / '}
          <Link href="/products" className="hover:text-(--color-primary)">Shop</Link>
          {' / '}
          <span className="text-(--color-foreground)">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-full">SOLD OUT</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      i === activeImage ? 'border-(--color-primary)' : 'border-transparent'
                    }`}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-(--color-foreground) leading-tight">{product.name}</h1>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${conditionColors[product.condition] || ''}`}>
                {product.condition}
              </span>
            </div>

            <div className="text-3xl font-bold text-(--color-primary) mb-4">
              HK${product.price.toFixed(0)}
            </div>

            <div className="space-y-2 text-sm text-(--color-muted) mb-6">
              <div className="flex gap-6">
                <span><strong className="text-(--color-foreground)">Category:</strong> {product.category}</span>
                <span><strong className="text-(--color-foreground)">Size:</strong> {product.size}</span>
              </div>
              <div>
                <strong className="text-(--color-foreground)">Stock:</strong>{' '}
                {isSoldOut ? (
                  <span className="text-red-600 font-medium">Sold Out</span>
                ) : (
                  <span className="text-green-600 font-medium">{product.stock_qty} available</span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-(--color-foreground) mb-2">Description</h3>
                <p className="text-sm text-(--color-muted) leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {!isSoldOut && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-(--color-border) rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-(--color-background) transition-colors font-medium"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                    className="px-3 py-2 hover:bg-(--color-background) transition-colors font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-(--color-primary) text-white py-2.5 rounded-lg font-semibold hover:bg-(--color-primary-dark) transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            )}

            <Link
              href="/cart"
              className="block w-full text-center border-2 border-(--color-primary) text-(--color-primary) py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
            >
              View Cart
            </Link>

            {/* Exchange info */}
            <div className="mt-6 p-4 bg-(--color-background) rounded-xl text-sm text-(--color-muted) border border-(--color-border)">
              <p className="font-semibold text-(--color-foreground) mb-1">📅 In-Person Exchange</p>
              <p>Orders are fulfilled via weekend in-person exchange. Pick a convenient time slot at checkout.</p>
            </div>
          </div>
        </div>
    </main>
  )
}
