import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, kid_name, seat_a, seat_b } = req.body

  if (!email || !kid_name || !seat_a || !seat_b) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Seat Booking <onboarding@resend.dev>',
    to: email,
    subject: `Booking Confirmed — ${seat_a} & ${seat_b}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 4px;">Booking Confirmed</h1>
        <p style="color: #666; margin-top: 0;">${kid_name}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 14px; color: #999; margin-bottom: 4px;">Seats</p>
        <p style="font-size: 20px; font-weight: 600; margin-top: 0;">${seat_a} &amp; ${seat_b}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">If you have any questions, please contact the event organizer.</p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }

  res.json({ ok: true })
}
