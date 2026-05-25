import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const KIDS = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan',
  'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
  'Kevin', 'Lily', 'Mason', 'Nora', 'Oscar',
]

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

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [query])

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const el = listRef.current.children[highlightedIndex]
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        )
        e.preventDefault()
        break
      case 'ArrowUp':
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        )
        e.preventDefault()
        break
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          select(filtered[highlightedIndex])
        }
        e.preventDefault()
        break
      case 'Escape':
        setOpen(false)
        setHighlightedIndex(-1)
        e.preventDefault()
        break
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Select a Child
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>
        <div className="space-y-2" ref={ref}>
          <label htmlFor="kid-search" className="block text-sm font-medium text-gray-700">
            Child
          </label>
          <div className="relative">
            <input
              id="kid-search"
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for a child..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {open && filtered.length > 0 && (
              <ul
                ref={listRef}
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                {filtered.map((name, i) => (
                  <li
                    key={name}
                    onClick={() => select(name)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`cursor-pointer px-3 py-2 text-sm ${
                      i === highlightedIndex
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {name}
                  </li>
                ))}
              </ul>
            )}
            {open && query && filtered.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400 shadow-lg">
                No children found
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {email} &middot; select the child you are booking for
          </p>
        </div>
      </div>
    </div>
  )
}
