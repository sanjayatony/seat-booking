import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const KIDS = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan',
  'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
  'Kevin', 'Lily', 'Mason', 'Nora', 'Oscar',
]

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

export default function KidSelect({ email, onNext }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [bookedKids, setBookedKids] = useState(new Set())
  const ref = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    supabase
      .from('bookings')
      .select('kid_name')
      .then(({ data }) => {
        if (data) setBookedKids(new Set(data.map((b) => b.kid_name)))
      })
  }, [])

  const filtered = KIDS.filter(
    (n) => !bookedKids.has(n) && n.toLowerCase().includes(query.toLowerCase()),
  )

  const select = useCallback((name) => {
    onNext(name)
    setOpen(false)
  }, [onNext])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { setHighlightedIndex(-1) }, [query])

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      listRef.current.children[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { setOpen(true); e.preventDefault() }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((p) => (p < filtered.length - 1 ? p + 1 : 0))
        e.preventDefault(); break
      case 'ArrowUp':
        setHighlightedIndex((p) => (p > 0 ? p - 1 : filtered.length - 1))
        e.preventDefault(); break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) select(filtered[highlightedIndex])
        e.preventDefault(); break
      case 'Escape':
        setOpen(false); setHighlightedIndex(-1); e.preventDefault(); break
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="bg-amber-500 px-4 pb-16 pt-10 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-200">Whizkids 2026</p>
        <h1 className="mt-2 text-3xl font-bold">Graduation Ceremony</h1>
        <p className="mt-1 text-sm text-amber-200">{email}</p>
      </div>

      {/* Card */}
      <div className="mx-auto -mt-8 w-full max-w-md px-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-5 flex justify-center">
            <StepBar current={2} />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Select a child</h2>
          <p className="mb-5 text-sm text-gray-500">Choose the graduate you are booking for</p>

          <div ref={ref} className="relative">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                id="kid-search"
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name…"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-base placeholder:text-gray-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {open && filtered.length > 0 && (
              <ul
                ref={listRef}
                className="absolute z-10 mt-2 max-h-52 w-full overflow-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl"
              >
                {filtered.map((name, i) => (
                  <li
                    key={name}
                    onClick={() => select(name)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${i === highlightedIndex ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                      {name[0]}
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            )}

            {open && query && filtered.length === 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-400 shadow-xl">
                No children found
              </div>
            )}
          </div>

          {filtered.length > 0 && !open && (
            <p className="mt-3 text-center text-xs text-gray-400">{filtered.length} children available</p>
          )}
        </div>
      </div>
    </div>
  )
}
