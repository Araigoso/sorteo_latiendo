import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'


export default function Welcome() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="welcome">
      <h1>Rifa Solidaria</h1>
      <h2>Para ir a ver a LALI</h2>
      
      <div className="welcome-card">
        <p>
          XXXXXXX
        </p>

        <p>
          XXXXXXXXXXXXXXXXXXXXX
        </p>

        <h3>¿Cómo participar?</h3>

        <ol>
          <li>Elegí tu número 🎟️ (del 1 al 500!)  </li>
          <li>Hacé la transferencia de $3.000 al alias <strong>latiendojuntos.ong</strong></li>
          <li>Subí tu comprobante</li>
          <li>Recibí la confirmación por email :) </li>
        </ol>

        <p className="disclaimer" style={{ marginBottom: '16px', color: '#e0e0e072' }}>Tené en cuenta que al seleccionar un número, va a quedar reservado hasta completar el pago.</p>

        <button
          className="welcome-button"
          onClick={() => navigate('/rifa')}
        >
          Ver números disponibles
        </button>
      </div>
    </div>
  )
}
