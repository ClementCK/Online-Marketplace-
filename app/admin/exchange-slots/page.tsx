'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ExchangeSlot } from '@/lib/database.types'
import toast from 'react-hot-toast'

export default function ExchangeSlotsPage() {
  const supabase = createClient()
  const [slots, setSlots] = useState<ExchangeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [newSlot, setNewSlot] = useState({
    date: '',
    time_slot: '',
    max_bookings: '5',
  })

  const fetchSlots = async () => {
    const { data } = await supabase
      .from('exchange_slots')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })
    setSlots(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchSlots() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlot.date || !newSlot.time_slot) return
    setSaving(true)

    const { error } = await supabase.from('exchange_slots').insert({
      date: newSlot.date,
      time_slot: newSlot.time_slot,
      max_bookings: parseInt(newSlot.max_bookings),
      current_bookings: 0,
      is_active: true,
    })

    if (error) toast.error(error.message)
    else {
      toast.success('Slot added!')
      setNewSlot({ date: '', time_slot: '', max_bookings: '5' })
      fetchSlots()
    }
    setSaving(false)
  }

  const toggleActive = async (slot: ExchangeSlot) => {
    await supabase.from('exchange_slots').update({ is_active: !slot.is_active }).eq('id', slot.id)
    toast.success(slot.is_active ? 'Slot disabled' : 'Slot enabled')
    fetchSlots()
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('Delete this slot?')) return
    await supabase.from('exchange_slots').delete().eq('id', id)
    toast.success('Slot deleted')
    fetchSlots()
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'long', month: 'long', day: 'numeric',
    })

  return (
    <div>
      <h1 className="text-2xl font-bold text-(--color-foreground) mb-6">Exchange Slots</h1>

      {/* Add Slot Form */}
      <div className="bg-white rounded-2xl border border-(--color-border) p-5 mb-6">
        <h2 className="font-bold text-(--color-foreground) mb-4">Add New Slot</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-(--color-muted) mb-1">Date (weekend)</label>
            <input type="date" required value={newSlot.date}
              onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              className="px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)" />
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-muted) mb-1">Time Slot</label>
            <input type="text" required value={newSlot.time_slot} placeholder="e.g. 10:00-12:00"
              onChange={(e) => setNewSlot({ ...newSlot, time_slot: e.target.value })}
              className="px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) w-36" />
          </div>
          <div>
            <label className="block text-xs font-medium text-(--color-muted) mb-1">Max Bookings</label>
            <input type="number" min="1" value={newSlot.max_bookings}
              onChange={(e) => setNewSlot({ ...newSlot, max_bookings: e.target.value })}
              className="px-3 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) w-20" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-(--color-primary) text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60">
            {saving ? 'Adding…' : 'Add Slot'}
          </button>
        </form>

        {/* Quick presets */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-(--color-muted) self-center">Quick presets:</span>
          {['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00'].map((t) => (
            <button key={t} type="button" onClick={() => setNewSlot({ ...newSlot, time_slot: t })}
              className="px-2.5 py-1 border border-(--color-border) rounded-full text-xs hover:border-(--color-primary) transition-colors">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Slots List */}
      {loading ? (
        <p className="text-(--color-muted) text-sm">Loading…</p>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-(--color-border)">
          <p className="text-(--color-muted)">No upcoming slots. Add one above!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-(--color-border) overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-(--color-background) text-(--color-muted) uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-center">Bookings</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {slots.map((slot) => {
                const isFull = slot.current_bookings >= slot.max_bookings
                return (
                  <tr key={slot.id} className={!slot.is_active ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-medium text-(--color-foreground)">{formatDate(slot.date)}</td>
                    <td className="px-4 py-3 text-(--color-muted)">{slot.time_slot}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                        {slot.current_bookings}/{slot.max_bookings}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        !slot.is_active ? 'bg-gray-100 text-gray-500' :
                        isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {!slot.is_active ? 'Disabled' : isFull ? 'Full' : 'Open'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-3">
                      <button onClick={() => toggleActive(slot)}
                        className="text-xs text-(--color-primary) hover:underline font-medium">
                        {slot.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteSlot(slot.id)}
                        className="text-xs text-red-500 hover:underline font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
