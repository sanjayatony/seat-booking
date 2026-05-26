import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ROWS = 8
const COLS = 12
const ROW_LABELS = 'ABCDEFGH'

function StepBar({ current }) {
  const steps = ['Email', 'Child', 'Seat']
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
            ${i + 1 === current ? 'bg-amber-500 text-white' : i + 1 < current ? 'bg-amber-100 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium ${i + 1 === current ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
          {i < steps.length - 1 && <div className="h-px w-4 bg-gray-200" />}
        </div>
      ))}
    </div>
  )
}

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
        if (error) { console.error('Failed to load bookings', error); return }
        const ids = new Set()
        data.forEach((row) => { ids.add(row.seat_a); ids.add(row.seat_b) })
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
      .insert({ email, kid_name: kid, seat_a: selected[0], seat_b: selected[1] })
      .select()
      .single()
    if (err) {
      setSaving(false)
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="bg-amber-500 px-4 pb-14 pt-10 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Whizkids 2026</p>
        <h1 className="mt-2 text-3xl font-bold">Graduation Ceremony</h1>
        <p className="mt-1 text-sm text-amber-200">{kid}</p>
      </div>

      {/* Card */}
      <div className="mx-auto -mt-8 w-full max-w-2xl px-3 pb-8 sm:px-4">
        <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 sm:p-6">
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between">
            <StepBar current={3} />
            <button
              onClick={onReset}
              className="text-xs font-medium text-amber-500 hover:text-amber-700"
            >
              ← Change
            </button>
          </div>

          <h2 className="mb-1 text-lg font-semibold text-gray-900">Pick your seats</h2>
          <p className="mb-4 text-sm text-gray-500">Tap any available pair to select</p>

          {/* Legend */}
          <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded border border-gray-300 bg-white" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded border-2 border-amber-500 bg-amber-500" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded border border-gray-200 bg-gray-100" />
              Booked
            </span>
          </div>

          {/* Stage */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="font-medium uppercase tracking-widest">STAGE</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200" />
          </div>

          {/* Seat grid — flex rows with pair grouping */}
          <div className="space-y-1">
            {Array.from({ length: ROWS }, (_, row) => (
              <div key={row} className="flex items-center gap-1 sm:gap-1.5">
                {/* Row label */}
                <span className="w-4 shrink-0 text-center text-[10px] font-semibold text-gray-400 sm:text-xs">
                  {ROW_LABELS[row]}
                </span>
                {/* Pairs */}
                <div className="flex flex-1 justify-between gap-1 sm:gap-2">
                  {Array.from({ length: COLS / 2 }, (_, pairIdx) => {
                    const col1 = pairIdx * 2
                    const col2 = pairIdx * 2 + 1
                    const id1 = seatId(row, col1)
                    const id2 = seatId(row, col2)
                    const isPairBooked = booked.has(id1) || booked.has(id2)
                    const isPairSelected = selected?.includes(id1)

                    return (
                      <button
                        key={pairIdx}
                        disabled={isPairBooked}
                        onClick={() => toggleSeat(row, col1)}
                        className={`flex flex-1 items-center justify-center gap-0.5 rounded-md py-1.5 text-[9px] font-medium transition-all sm:gap-1 sm:rounded-lg sm:py-2 sm:text-xs
                          ${isPairBooked
                            ? 'cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300'
                            : isPairSelected
                              ? 'border-2 border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-200'
                              : 'border border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                          }`}
                      >
                        <span>{id1}</span>
                        <span className={`text-[7px] ${isPairSelected ? 'text-amber-200' : 'text-gray-300'}`}>·</span>
                        <span>{id2}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Confirm */}
          <div className="mt-5">
            {error && <p className="mb-2 text-center text-sm text-red-500">{error}</p>}
            {selected && (
              <p className="mb-2 text-center text-sm font-medium text-amber-500">
                Selected: {selected[0]} & {selected[1]}
              </p>
            )}
            <button
              disabled={!selected || saving}
              onClick={handleConfirm}
              className={`inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                ${selected && !saving
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
            >
              {saving ? 'Saving…' : selected ? 'Confirm Seats' : 'Select a seat pair above'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
