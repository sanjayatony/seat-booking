import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Seat Booking
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
