import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function StepBar({ current }) {
  const steps = ['Email', 'Child', 'Seat']
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
            ${i + 1 === current ? 'bg-indigo-600 text-white' : i + 1 < current ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs font-medium ${i + 1 === current ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
          {i < steps.length - 1 && <div className="h-px w-4 bg-gray-200" />}
        </div>
      ))}
    </div>
  )
}

export default function EmailStep({ onNext }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: dbError } = await supabase
      .from('bookings')
      .select('id')
      .eq('email', email)
      .limit(1)
    setLoading(false)
    if (dbError) {
      setError('Something went wrong. Please try again.')
      return
    }
    if (data.length > 0) {
      setError('This email has already been used to book seats.')
      return
    }
    onNext(email)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="bg-indigo-600 px-4 pb-16 pt-10 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">Whizkids 2026</p>
        <h1 className="mt-2 text-3xl font-bold">Graduation Ceremony</h1>
        <p className="mt-1 text-sm text-indigo-200">Seat Booking</p>
      </div>

      {/* Card */}
      <div className="mx-auto -mt-8 w-full max-w-md px-4">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-5 flex justify-center">
            <StepBar current={1} />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Enter your email</h2>
          <p className="mb-5 text-sm text-gray-500">We'll use this to look up your booking</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
