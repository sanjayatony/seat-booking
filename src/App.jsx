import { useState } from 'react'
import EmailStep from './components/EmailStep'
import KidSelect from './components/KidSelect'
import SeatGrid from './components/SeatGrid'
import BookingConfirmed from './components/BookingConfirmed'
import AdminPage from './components/AdminPage'

export default function App() {
  if (window.location.pathname === '/admin') return <AdminPage />
  const [email, setEmail] = useState('')
  const [kid, setKid] = useState('')
  const [booking, setBooking] = useState(null)

  if (!email) return <EmailStep onNext={setEmail} />
  if (!kid) return <KidSelect email={email} onNext={setKid} />
  if (!booking)
    return (
      <SeatGrid
        email={email}
        kid={kid}
        onComplete={setBooking}
        onReset={() => {
          setKid('')
          setEmail('')
        }}
      />
    )
  return (
    <BookingConfirmed
      email={email}
      kid={kid}
      booking={booking}
      onReset={() => {
        setBooking(null)
        setKid('')
        setEmail('')
      }}
    />
  )
}
