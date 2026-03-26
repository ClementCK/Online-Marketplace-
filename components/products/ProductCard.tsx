'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/lib/database.types'
import toast from 'react-hot-toast'

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  'like-new': 'bg-blue-100 text-blue-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-orange-100 text-orange-700',
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const images = product.image_urls as string[]
  const imageUrl = images?.[0] || '/placeholder-product.svg'
  const isSoldOut = product.stock_qty === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSoldOut) return
    addItem(product)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <Link href={`/products/${product.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-(--color-border)">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-3 py-1 rounded-full text-sm">SOLD OUT</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${conditionColors[product.condition] || 'bg-gray-100 text-gray-600'}`}>
          {product.condition}
        </span>
      </div>

      <div className="p-3">
        <p className="text-xs text-(--color-muted) mb-0.5">{product.category} · Size {product.size}</p>
        <h3 className="font-semibold text-sm text-(--color-foreground) line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-(--color-primary) text-base">
            HK${product.price.toFixed(0)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="bg-(--color-primary) text-white text-xs px-3 py-1.5 rounded-full hover:bg-(--color-primary-dark) transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}
