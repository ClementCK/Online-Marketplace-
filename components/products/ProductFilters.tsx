'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  currentParams: Record<string, string | undefined>
}

const categories = ['tops', 'bottoms', 'dresses', 'accessories', 'shoes', 'bags', 'others']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const conditions = ['new', 'like-new', 'good', 'fair']
const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
]

export default function ProductFilters({ currentParams }: Props) {
  const router = useRouter()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams()
      Object.entries(currentParams).forEach(([k, v]) => {
        if (v && k !== key && k !== 'page') params.set(k, v)
      })
      if (value) params.set(key, value)
      router.push(`/products?${params.toString()}`)
    },
    [currentParams, router]
  )

  const clearAll = () => router.push('/products')

  const hasFilters = Object.entries(currentParams).some(
    ([k, v]) => v && k !== 'sort' && k !== 'page'
  )

  return (
    <div className="bg-white rounded-2xl border border-(--color-border) p-4 space-y-5">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Search</label>
        <input
          type="text"
          defaultValue={currentParams.search || ''}
          placeholder="Search items…"
          className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParam('search', (e.target as HTMLInputElement).value || null)
            }
          }}
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Sort By</label>
        <select
          value={currentParams.sort || 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Category</label>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam('category', currentParams.category === cat ? null : cat)}
              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                currentParams.category === cat
                  ? 'bg-(--color-primary) text-white'
                  : 'hover:bg-(--color-background) text-(--color-foreground)'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Size</label>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => updateParam('size', currentParams.size === size ? null : size)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                currentParams.size === size
                  ? 'bg-(--color-primary) text-white border-(--color-primary)'
                  : 'border-(--color-border) hover:border-(--color-primary) text-(--color-foreground)'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Condition</label>
        <div className="space-y-1">
          {conditions.map((cond) => (
            <button
              key={cond}
              onClick={() => updateParam('condition', currentParams.condition === cond ? null : cond)}
              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                currentParams.condition === cond
                  ? 'bg-(--color-primary) text-white'
                  : 'hover:bg-(--color-background) text-(--color-foreground)'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-(--color-muted) uppercase mb-2">Price (HKD)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentParams.min_price || ''}
            className="w-full px-2 py-1.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            onBlur={(e) => updateParam('min_price', e.target.value || null)}
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentParams.max_price || ''}
            className="w-full px-2 py-1.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            onBlur={(e) => updateParam('max_price', e.target.value || null)}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-(--color-secondary) font-medium hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
