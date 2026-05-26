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
  const [deletingId, setDeletingId] = useState(null)

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
    setDeletingId(id)
    await supabase.from('bookings').delete().eq('id', id)
    setBookings((prev) => prev.filter((b) => b.id !== id))
    setDeletingId(null)
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Whizkids Graduation 2026</p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError('') }}
                  placeholder="Enter admin password"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-base shadow-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  autoFocus
                />
                {authError && <p className="mt-1.5 text-sm text-red-500">{authError}</p>}
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const uniqueEmails = new Set(bookings.map((b) => b.email)).size

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Booking Admin</h1>
            <p className="text-xs text-gray-500">Whizkids Graduation 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Bookings</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{bookings.length}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Families</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{uniqueEmails}</p>
          </div>
          <div className="col-span-2 rounded-xl border bg-white p-4 shadow-sm sm:col-span-1">
            <p className="text-xs font-medium text-gray-500">Seats Used</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{bookings.length * 2}</p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">No bookings yet</div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Child</th>
                    <th className="px-5 py-3.5">Seats</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) =>
                    editingId === b.id ? (
                      <tr key={b.id} className="bg-indigo-50/50">
                        <td className="px-5 py-3">
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            value={editForm.kid_name}
                            onChange={(e) => setEditForm((f) => ({ ...f, kid_name: e.target.value }))}
                            className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              value={editForm.seat_a}
                              onChange={(e) => setEditForm((f) => ({ ...f, seat_a: e.target.value.toUpperCase() }))}
                              className="w-16 rounded-lg border border-gray-300 px-2.5 py-1.5 text-center text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                            <span className="text-gray-400">&amp;</span>
                            <input
                              value={editForm.seat_b}
                              onChange={(e) => setEditForm((f) => ({ ...f, seat_b: e.target.value.toUpperCase() }))}
                              className="w-16 rounded-lg border border-gray-300 px-2.5 py-1.5 text-center text-base focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(b.id)}
                              disabled={saving}
                              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={b.id} className="group hover:bg-gray-50/70">
                        <td className="px-5 py-3.5 text-gray-500">{b.email}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{b.kid_name}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{b.seat_a}</span>
                            <span className="text-gray-300">&amp;</span>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{b.seat_b}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => startEdit(b)}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              disabled={deletingId === b.id}
                              className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === b.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 sm:hidden">
              {bookings.map((b) =>
                editingId === b.id ? (
                  <div key={b.id} className="space-y-2.5 bg-indigo-50/50 p-4">
                    <input
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="Email"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-gray-400 focus:outline-none"
                    />
                    <input
                      value={editForm.kid_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, kid_name: e.target.value }))}
                      placeholder="Child name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-gray-400 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        value={editForm.seat_a}
                        onChange={(e) => setEditForm((f) => ({ ...f, seat_a: e.target.value.toUpperCase() }))}
                        placeholder="Seat A"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-base focus:border-gray-400 focus:outline-none"
                      />
                      <input
                        value={editForm.seat_b}
                        onChange={(e) => setEditForm((f) => ({ ...f, seat_b: e.target.value.toUpperCase() }))}
                        placeholder="Seat B"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center text-base focus:border-gray-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSave(b.id)}
                        disabled={saving}
                        className="flex-1 rounded-lg bg-gray-900 py-2 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{b.kid_name}</p>
                      <p className="truncate text-xs text-gray-500">{b.email}</p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{b.seat_a}</span>
                        <span className="text-gray-300 text-xs">&amp;</span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{b.seat_b}</span>
                      </div>
                      <button
                        onClick={() => startEdit(b)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={deletingId === b.id}
                        className="rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-medium text-red-500 disabled:opacity-50"
                      >
                        {deletingId === b.id ? '…' : 'Del'}
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
