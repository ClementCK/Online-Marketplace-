'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const categories = ['tops', 'bottoms', 'dresses', 'accessories', 'shoes', 'bags', 'others']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const conditions = ['new', 'like-new', 'good', 'fair']

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'tops',
    size: 'M',
    condition: 'good',
    stock_qty: '1',
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingImages(true)

    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }

    setImageUrls((prev) => [...prev, ...urls])
    setUploadingImages(false)
    toast.success(`${urls.length} image(s) uploaded`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) return

    setSaving(true)
    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category: form.category,
      size: form.size,
      condition: form.condition,
      stock_qty: parseInt(form.stock_qty),
      image_urls: imageUrls,
      is_active: true,
    })

    if (error) {
      toast.error('Failed to save product')
    } else {
      toast.success('Product created!')
      router.push('/admin/products')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-(--color-muted) hover:text-(--color-foreground)">←</button>
        <h1 className="text-2xl font-bold text-(--color-foreground)">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-(--color-border) p-6 space-y-5 max-w-2xl">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-2">Product Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-(--color-muted) file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-(--color-primary) file:text-white hover:file:bg-(--color-primary-dark)"
          />
          {uploadingImages && <p className="text-xs text-(--color-muted) mt-1">Uploading…</p>}
          {imageUrls.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-bl"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            placeholder="e.g. Floral Summer Dress"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none"
            placeholder="Describe the item, brand, measurements, etc."
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Price (HKD) *</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              placeholder="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Stock Qty</label>
            <input
              type="number"
              min="0"
              value={form.stock_qty}
              onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>
        </div>

        {/* Category, Size, Condition */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Size</label>
            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            >
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-(--color-primary) text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-(--color-border) text-sm font-medium hover:bg-(--color-background) transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
