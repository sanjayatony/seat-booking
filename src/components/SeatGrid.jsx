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
    <div className="flex min-h-screen items-start justify-center p-2 pt-6 sm:p-4 sm:pt-12">
      <div className="w-full max-w-2xl rounded-xl border bg-white p-4 shadow-sm sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Select a Seat
            </h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
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

        <div className="mb-4 flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-gray-300 bg-white sm:h-4 sm:w-4" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-gray-400 bg-gray-900 sm:h-4 sm:w-4" />
            Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-gray-200 bg-gray-100 sm:h-4 sm:w-4" />
            Booked
          </span>
        </div>

        <p className="mb-1 text-center text-xs text-gray-500 sm:text-sm">Stage</p>
        <div className="mx-auto mb-4 h-2 w-full bg-gray-400 sm:mb-8"></div>

        <div className="grid w-full grid-cols-12 gap-0.5 sm:gap-2">
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
                  className={`aspect-square w-full rounded text-[8px] font-medium transition-colors sm:rounded-md sm:text-xs
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

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-8">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            disabled={!selected || saving}
            onClick={handleConfirm}
            className={`inline-flex w-full items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:w-auto
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
