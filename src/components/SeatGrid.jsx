import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ROWS = 8
const COLS = 12
const ROW_LABELS = 'ABCDEFGH'

export default function SeatGrid({ email, kid, onComplete, onReset }) {
  const [booked, setBooked] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('bookings')
      .select('seat_a, seat_b')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load bookings', error)
          return
        }
        const ids = new Set()
        data.forEach((row) => {
          ids.add(row.seat_a)
          ids.add(row.seat_b)
        })
        setBooked(ids)
      })
  }, [])

  function seatId(row, col) {
    return ROW_LABELS[row] + (col + 1)
  }

  function pairIds(row, col) {
    const pairStart = Math.floor(col / 2) * 2
    return [seatId(row, pairStart), seatId(row, pairStart + 1)]
  }

  function toggleSeat(row, col) {
    const pair = pairIds(row, col)
    if (pair.some((id) => booked.has(id))) return

    setSelected((prev) => {
      if (!prev) return pair
      if (prev[0] === pair[0] && prev[1] === pair[1]) return null
      return pair
    })
  }

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    setError('')

    const { data, error: err } = await supabase
      .from('bookings')
      .insert({
        email,
        kid_name: kid,
        seat_a: selected[0],
        seat_b: selected[1],
      })
      .select()
      .single()

    if (err) {
      setSaving(false)
      console.error('Booking failed', err)
      setError('Failed to save booking. Please try again.')
      return
    }

    fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, kid_name: kid, seat_a: data.seat_a, seat_b: data.seat_b }),
    }).catch((e) => console.error('Email send failed', e))

    setSaving(false)
    onComplete(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Select a Seat
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {kid} &middot; {email}
            </p>
          </div>
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Change
          </button>
        </div>

        <div className="mb-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-4 w-4 rounded border border-gray-300 bg-white" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-4 w-4 rounded border border-gray-400 bg-gray-900" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-4 w-4 rounded border border-gray-200 bg-gray-100" />
            Booked
          </span>
        </div>
        <p className="mb-1 text-center text-sm">Stage</p>
        <div className="mx-auto mb-8 h-2 w-full bg-gray-400 md:w-11/12"></div>

        <div className="mx-auto grid w-fit grid-cols-12 gap-2">
          {Array.from({ length: ROWS }, (_, row) =>
            Array.from({ length: COLS }, (_, col) => {
              const id = seatId(row, col)
              const isBooked = booked.has(id)
              const isSelected = selected?.includes(id)

              return (
                <button
                  key={id}
                  disabled={isBooked}
                  onClick={() => toggleSeat(row, col)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium transition-colors
                    ${
                      isBooked
                        ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-300'
                        : isSelected
                          ? 'border border-gray-400 bg-gray-900 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {id}
                </button>
              )
            }),
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            disabled={!selected || saving}
            onClick={handleConfirm}
            className={`inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
              ${
                selected && !saving
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              }
            `}
          >
            {saving
              ? 'Saving...'
              : selected
                ? `Confirm Seats ${selected.join(' & ')}`
                : 'Select a seat pair'}
          </button>
        </div>
      </div>
    </div>
  )
}
