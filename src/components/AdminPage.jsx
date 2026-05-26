import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      setAuthed(true)
    } else {
      setAuthError('Incorrect password')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  async function fetchBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setBookings(data)
    setLoading(false)
  }

  useEffect(() => {
    if (authed) fetchBookings()
  }, [authed])

  async function handleDelete(id) {
    if (!window.confirm('Delete this booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }

  function startEdit(booking) {
    setEditingId(booking.id)
    setEditForm({
      email: booking.email,
      kid_name: booking.kid_name,
      seat_a: booking.seat_a,
      seat_b: booking.seat_b,
    })
  }

  async function handleSave(id) {
    setSaving(true)
    const { data } = await supabase
      .from('bookings')
      .update(editForm)
      .eq('id', id)
      .select()
      .single()
    if (data) setBookings((prev) => prev.map((b) => (b.id === id ? data : b)))
    setSaving(false)
    setEditingId(null)
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-gray-900">Admin</h1>
          <p className="mb-6 text-sm text-gray-500">Sign in to manage bookings</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError('') }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                autoFocus
              />
              {authError && <p className="mt-1 text-sm text-red-500">{authError}</p>}
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500">{bookings.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No bookings yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Child</th>
                    <th className="px-4 py-3">Seat A</th>
                    <th className="px-4 py-3">Seat B</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((b) =>
                    editingId === b.id ? (
                      <tr key={b.id} className="bg-blue-50">
                        <td className="px-4 py-2">
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editForm.kid_name}
                            onChange={(e) => setEditForm((f) => ({ ...f, kid_name: e.target.value }))}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editForm.seat_a}
                            onChange={(e) => setEditForm((f) => ({ ...f, seat_a: e.target.value.toUpperCase() }))}
                            className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            value={editForm.seat_b}
                            onChange={(e) => setEditForm((f) => ({ ...f, seat_b: e.target.value.toUpperCase() }))}
                            className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-4 py-2 text-gray-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(b.id)}
                              disabled={saving}
                              className="rounded bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{b.email}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{b.kid_name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {b.seat_a}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {b.seat_b}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(b)}
                              className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
