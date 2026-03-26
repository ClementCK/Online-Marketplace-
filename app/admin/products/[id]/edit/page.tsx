'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/database.types'
import toast from 'react-hot-toast'

const categories = ['tops', 'bottoms', 'dresses', 'accessories', 'shoes', 'bags', 'others']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const conditions = ['new', 'like-new', 'good', 'fair']

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'tops',
    size: 'M', condition: 'good', stock_qty: '1', is_active: true,
  })

  useEffect(() => {
    if (!params.id) return
    supabase.from('products').select('*').eq('id', params.id as string).single()
      .then(({ data }) => {
        if (!data) return
        setProduct(data)
        setImageUrls((data.image_urls as string[]) || [])
        setForm({
          name: data.name,
          description: data.description || '',
          price: String(data.price),
          category: data.category,
          size: data.size,
          condition: data.condition,
          stock_qty: String(data.stock_qty),
          is_active: data.is_active,
        })
      })
  }, [params.id])

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
    if (urls.length) toast.success(`${urls.length} image(s) uploaded`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        size: form.size,
        condition: form.condition,
        stock_qty: parseInt(form.stock_qty),
        image_urls: imageUrls,
        is_active: form.is_active,
      })
      .eq('id', params.id as string)

    if (error) toast.error('Failed to update product')
    else { toast.success('Product updated!'); router.push('/admin/products') }
    setSaving(false)
  }

  const handleDeactivate = async () => {
    if (!confirm('Mark this product as inactive? It will be hidden from the storefront.')) return
    setDeleting(true)
    await supabase.from('products').update({ is_active: false }).eq('id', params.id as string)
    toast.success('Product deactivated')
    router.push('/admin/products')
  }

  if (!product) return <div className="text-(--color-muted)">Loading…</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-(--color-muted) hover:text-(--color-foreground)">←</button>
        <h1 className="text-2xl font-bold text-(--color-foreground)">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-(--color-border) p-6 space-y-5 max-w-2xl">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-2">Product Images</label>
          {imageUrls.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-bl">×</button>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" multiple onChange={handleImageUpload}
            className="block w-full text-sm text-(--color-muted) file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-(--color-primary) file:text-white hover:file:bg-(--color-primary-dark)" />
          {uploadingImages && <p className="text-xs text-(--color-muted) mt-1">Uploading…</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-1">Product Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)" />
        </div>

        <div>
          <label className="block text-sm font-medium text-(--color-foreground) mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Price (HKD) *</label>
            <input type="number" required min="1" step="0.01" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Stock Qty</label>
            <input type="number" min="0" value={form.stock_qty}
              onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Size</label>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)">
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full px-3 py-2.5 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)">
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 rounded text-(--color-primary)" />
          <label htmlFor="is_active" className="text-sm font-medium text-(--color-foreground)">Active (visible on storefront)</label>
        </div>

        <div className="flex gap-3 pt-2 flex-wrap">
          <button type="submit" disabled={saving}
            className="bg-(--color-primary) text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-(--color-border) text-sm font-medium hover:bg-(--color-background) transition-colors">
            Cancel
          </button>
          {form.is_active && (
            <button type="button" onClick={handleDeactivate} disabled={deleting}
              className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors ml-auto">
              {deleting ? 'Deactivating…' : 'Deactivate'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
