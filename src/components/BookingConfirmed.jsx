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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="bg-amber-500 px-4 pb-20 pt-10 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Whizkids 2026</p>
        <h1 className="mt-2 text-3xl font-bold">Graduation Ceremony</h1>
      </div>

      <div className="mx-auto -mt-12 w-full max-w-md px-4 pb-10">
        {/* Success card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="mb-1 text-center text-xl font-bold text-gray-900">You're all set!</h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            A confirmation has been sent to <span className="font-medium text-gray-700">{email}</span>
          </p>

          {/* Ticket */}
          <div className="relative overflow-hidden rounded-xl bg-amber-500 p-5 text-white">
            <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/20" />
            <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/20" />

            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Graduate</p>
              <p className="mt-0.5 text-2xl font-bold">{kid}</p>
            </div>
            <div className="border-t border-dashed border-white/30 pt-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Seats</p>
                  <p className="mt-0.5 text-3xl font-bold tracking-wide">
                    {booking.seat_a} <span className="text-amber-300">&</span> {booking.seat_b}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Event</p>
                  <p className="mt-0.5 text-sm font-semibold">Graduation 2026</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Book another child
          </button>
        </div>

        {/* Other bookings */}
        {bookings.length > 1 && (
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Your other bookings</h3>
            <div className="space-y-2">
              {bookings
                .filter((b) => b.id !== booking.id)
                .map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.kid_name}</p>
                      <p className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                      <span className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-200">{b.seat_a}</span>
                      <span className="text-gray-300">&</span>
                      <span className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-200">{b.seat_b}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
