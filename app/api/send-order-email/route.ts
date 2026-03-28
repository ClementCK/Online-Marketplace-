import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const EXCHANGE_LOCATION = process.env.EXCHANGE_LOCATION || 'Mong Kok MTR Station, Exit D'
// Support comma-separated list of admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cc-preloved.vercel.app'

interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  size: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, userEmail, userName, userPhone, orderItems, totalAmount, exchangeDate, exchangeTimeSlot } = body

    if (!orderId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const shortId = orderId.slice(0, 8).toUpperCase()
    const formattedDate = new Date(exchangeDate + 'T00:00:00').toLocaleDateString('en-HK', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    const itemsHtml = (orderItems as OrderItem[]).map(item =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name} (Size ${item.size})</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">HK$${(item.price * item.quantity).toFixed(0)}</td>
      </tr>`
    ).join('')

    // Send user confirmation email
    try {
      await resend.emails.send({
        from: 'CC Pre-loved <onboarding@resend.dev>',
        to: [userEmail],
        subject: 'Your CC Pre-loved order is confirmed! – Exchange Details Inside',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
            <div style="background:#2563eb;color:white;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;">🛍️ CC Pre-loved</h1>
              <p style="margin:8px 0 0;opacity:0.9;">Order Confirmed!</p>
            </div>
            <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
              <p>Hi ${userName || 'there'},</p>
              <p>Your order <strong>#${shortId}</strong> has been confirmed. Here are your exchange details:</p>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
                <h3 style="margin:0 0 12px;color:#1d4ed8;">📅 Exchange Details</h3>
                <p style="margin:4px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin:4px 0;"><strong>Time:</strong> ${exchangeTimeSlot}</p>
                <p style="margin:4px 0;"><strong>Location:</strong> ${EXCHANGE_LOCATION}</p>
                <p style="margin:4px 0;"><strong>Payment:</strong> Cash at exchange</p>
              </div>

              <h3>Your Items</h3>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Item</th>
                    <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;">Qty</th>
                    <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding:8px;font-weight:bold;text-align:right;">Total:</td>
                    <td style="padding:8px;font-weight:bold;color:#2563eb;text-align:right;">HK$${Number(totalAmount).toFixed(0)}</td>
                  </tr>
                </tfoot>
              </table>

              <p style="margin-top:24px;">See you this weekend! – <strong>CC Pre-loved</strong></p>
            </div>
          </div>
        `,
      })
    } catch (userEmailErr) {
      console.error('Failed to send user email:', userEmailErr)
    }

    // Send admin notification email to all admins
    if (ADMIN_EMAILS.length > 0) {
      try {
        await resend.emails.send({
          from: 'CC Pre-loved <onboarding@resend.dev>',
          to: ADMIN_EMAILS,
          subject: `New Order #${shortId} – ${userName || userEmail}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a2e;">
              <div style="background:#dc2626;color:white;padding:24px;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;font-size:20px;">🔔 New Order Received</h1>
                <p style="margin:4px 0 0;opacity:0.9;">Order #${shortId}</p>
              </div>
              <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
                <h3>Customer Details</h3>
                <p style="margin:4px 0;"><strong>Name:</strong> ${userName || '—'}</p>
                <p style="margin:4px 0;"><strong>Email:</strong> ${userEmail}</p>
                ${userPhone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${userPhone}</p>` : ''}

                <h3>Exchange</h3>
                <p style="margin:4px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin:4px 0;"><strong>Time:</strong> ${exchangeTimeSlot}</p>

                <h3>Items Ordered</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <thead>
                    <tr style="background:#f9fafb;">
                      <th style="padding:8px;text-align:left;border-bottom:2px solid #e5e7eb;">Item</th>
                      <th style="padding:8px;text-align:center;border-bottom:2px solid #e5e7eb;">Qty</th>
                      <th style="padding:8px;text-align:right;border-bottom:2px solid #e5e7eb;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr>
                      <td colspan="2" style="padding:8px;font-weight:bold;text-align:right;">Total:</td>
                      <td style="padding:8px;font-weight:bold;color:#dc2626;text-align:right;">HK$${Number(totalAmount).toFixed(0)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div style="margin-top:24px;text-align:center;">
                  <a href="${APP_URL}/admin/orders/${orderId}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                    View Order in Dashboard
                  </a>
                </div>
              </div>
            </div>
          `,
        })
      } catch (adminEmailErr) {
        console.error('Failed to send admin email:', adminEmailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
