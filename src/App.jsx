import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NumberBoard from './components/NumberBoard'
import PurchaseModal from './components/PurchaseModal'
import SuccessMessage from './components/SuccessMessage'
import Admin from './Admin'
import Welcome from './Welcome'
import './App.css'

function Home() {
  const [takenNumbers, setTakenNumbers] = useState([])
  const [selectedNumber, setSelectedNumber] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successNumber, setSuccessNumber] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const reservePromiseRef = useRef(null)

  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem('sessionId')
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      sessionStorage.setItem('sessionId', id)
    }
    return id
  })

  const doCancel = async (num) => {
    // Esperar a que termine cualquier reserva en vuelo antes de cancelar
    if (reservePromiseRef.current) {
      await reservePromiseRef.current
    }
    try {
      await fetch('/.netlify/functions/cancelReservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: num, sessionId }),
      })
    } catch (err) {
      console.error('Error cancelando reserva:', err)
    }
  }

  const loadNumbers = async () => {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'

    if (isLocal) {
      const mockTaken = [7, 13, 28]
      setTakenNumbers(mockTaken)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/.netlify/functions/getNumbers')

      if (!res.ok) {
        throw new Error('Error loading numbers')
      }

      const data = await res.json()

      const taken = Object.entries(data)
        .filter(([, value]) => value.status === 'taken' || value.status === 'reserved')
        .map(([k]) => Number(k))

      setTakenNumbers(taken)
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los números')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNumbers()

    const interval = setInterval(() => {
      loadNumbers()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Cargando...</p>
  }

  if (error) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
  }

  return (
    <div className="app">
      <div className='titulo'>
         <img
        src="/logo.png"
        alt="Latiendo"
        className="hero-logo"
          />

        <h1> SORTEO ❤️</h1>

      <p>
      Elegí tu número, participá y ayudanos a seguir latiendo  🌟
      Recordá que podes elegir del 1 al 500
      </p>  
    
      </div>

      <div className="container">
        <NumberBoard
          takenNumbers={takenNumbers.filter(n => n !== selectedNumber)}
          onSelect={setSelectedNumber}
        />
      </div>

      {selectedNumber !== null && !showSuccess && (
        <PurchaseModal
          number={selectedNumber}
          sessionId={sessionId}
          onClose={async () => {
            const numToClose = selectedNumber
            setSelectedNumber(null)
            await doCancel(numToClose)
            loadNumbers()
          }}
          onSuccess={() => {
            reservePromiseRef.current = null
            setTakenNumbers(prev => [...prev, selectedNumber])
            setSuccessNumber(selectedNumber)
            setSelectedNumber(null)
            setShowSuccess(true)
          }}
          onCancel={async () => {
            const numToCancel = selectedNumber
            setTakenNumbers(prev => prev.filter(n => n !== numToCancel))
            setSelectedNumber(null)
            await doCancel(numToCancel)
            loadNumbers()
          }}
          onReserve={async (num) => {
            const promise = fetch('/.netlify/functions/reserveNumber', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ number: num, sessionId }),
            })
            reservePromiseRef.current = promise
            try {
              const res = await promise
              reservePromiseRef.current = null
              if (!res.ok) {
                const data = await res.json()
                alert(data.error || 'El número no está disponible')
                setSelectedNumber(null)
                loadNumbers()
              } else {
                setTimeout(() => loadNumbers(), 200)
              }
            } catch (err) {
              reservePromiseRef.current = null
              console.error('Error reservando:', err)
            }
          }}
        />
      )}

      {showSuccess && successNumber && (
        <SuccessMessage
          number={successNumber}
          onClose={() => {
            setShowSuccess(false)
            setSuccessNumber(null)
          }}
        />
      )}
    </div>
  )
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/rifa" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
