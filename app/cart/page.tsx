'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl font-semibold text-(--color-foreground) mb-2">Your cart is empty</p>
            <p className="text-(--color-muted) mb-6">Browse our items and add something you love!</p>
            <Link
              href="/products"
              className="inline-block bg-(--color-primary) text-white px-8 py-3 rounded-full font-semibold hover:bg-(--color-primary-dark) transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-(--color-border)">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image
                      src={(product.image_urls as string[])?.[0] || '/placeholder-product.svg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-(--color-foreground) hover:text-(--color-primary) line-clamp-2 text-sm"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-(--color-muted) mt-0.5">
                      Size: {product.size} · {product.condition}
                    </p>
                    <p className="font-bold text-(--color-primary) mt-1">
                      HK${product.price.toFixed(0)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-(--color-muted) hover:text-(--color-secondary) text-xs"
                    >
                      Remove
                    </button>
                    <div className="flex items-center border border-(--color-border) rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-2 py-1 hover:bg-(--color-background) text-sm font-medium"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-2 py-1 hover:bg-(--color-background) text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-(--color-foreground)">
                      HK${(product.price * quantity).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-(--color-border) p-5 h-fit">
              <h2 className="font-bold text-(--color-foreground) mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-(--color-muted)">
                    <span className="truncate mr-2">{product.name} × {quantity}</span>
                    <span className="shrink-0">HK${(product.price * quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-(--color-border) pt-3 mb-5">
                <div className="flex justify-between font-bold text-(--color-foreground)">
                  <span>Total</span>
                  <span>HK${totalPrice().toFixed(0)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-(--color-primary) text-white text-center py-3 rounded-xl font-semibold hover:bg-(--color-primary-dark) transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/products"
                className="block w-full text-center text-(--color-muted) text-sm mt-3 hover:text-(--color-primary)"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
    </main>
  )
}
