import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function BookingConfirmed({ email, kid, booking, onReset }) {
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    supabase
      .from('bookings')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data)
      })
  }, [email])

  return (
    <div className="flex min-h-screen items-start justify-center p-4 pt-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
              &#10003;
            </div>
          </div>
          <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            {kid} &middot; {email}
          </p>

          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">Seats</p>
            <p className="text-xl font-semibold text-gray-900">
              {booking.seat_a} &amp; {booking.seat_b}
            </p>
          </div>

          <button
            onClick={onReset}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Book Another
          </button>
        </div>

        {bookings.length > 0 && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Your Bookings
            </h2>
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.kid_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-gray-900 ring-1 ring-gray-200">
                    {b.seat_a} &amp; {b.seat_b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
