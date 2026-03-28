import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify the order belongs to this user (or user is admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const { data: order } = await supabase
      .from('orders')
      .select('user_id, status')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.user_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed orders can be cancelled' }, { status: 400 })
    }

    // Call the RPC function (atomic: cancels + restores stock in a transaction)
    const { error } = await supabase.rpc('cancel_order_with_stock_restore', { p_order_id: orderId })
    if (error) {
      console.error('Cancel order RPC error:', error)
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel order route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
