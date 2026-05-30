import { useState, useEffect, useRef } from 'react'

export default function PurchaseModal({ number, sessionId, onClose, onCancel, onSuccess, onReserve }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentProof, setPaymentProof] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(240)
  const timerRef = useRef(null)
  const submittedRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const fileInputRef = useRef(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (onReserve) {
      onReserve(number)
    }
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          if (!submittedRef.current) {
            alert('Tu reserva expiró. Por favor, selecciona el número nuevamente.')
            if (onCloseRef.current) {
              onCloseRef.current()
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleInputClick = () => {
    if (fileName) {
      setFileName(null)
      setPreviewUrl(null)
      setPaymentProof(null)
      setShowPreviewModal(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e) => {

    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos JPG, JPEG, PNG o PDF')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo debe ser menor a 5MB')
      return
    }

    setFileName(file.name)
    setShowPreviewModal(false)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setPaymentProof(reader.result)
    }

    reader.readAsDataURL(file)
    setError(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/.netlify/functions/submitRaffle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number,
        name,
        email,
        paymentProof,
        sessionId
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error')
      setLoading(false)
      return
    }

    submittedRef.current = true
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    await onSuccess()
    setLoading(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Número {number}</h2>
        <h3>Valor $3.000</h3>
      
        <h5>Transferí al alias: latiendojuntos.ong </h5>

        <div className="reservation-timer">
          <span>
            ⏱️ Tiempo restante de reserva: {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>

        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="file-input-container">
            <label htmlFor="payment-proof" className="file-label">
              Subí tu comprobante de pago:
            </label>

            <div className='actions-container'>

              <div>
                <input
                  ref={fileInputRef}
                  id="payment-proof"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleImageChange}
                  required={!fileName}
                  className="file-input"
                  style={{ display: 'none' }}
                />
                <button className={fileName ? "btn-danger" : "btn-file"} onClick={handleInputClick} type='button'>
                  {fileName ? "🗑 Borrar" : "Seleccionar archivo"}
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowPreviewModal(true)}
                  disabled={fileName === null}
                >
                  Ver comprobante
                </button>
              </div>


            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-buttons">
            <button type="submit" disabled={loading} className='btn-primary'>
              {loading ? 'Enviando...' : 'Confirmar'}
            </button>

            <button type="button" onClick={onCancel || onClose} className='btn-secondary'>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {showPreviewModal && previewUrl && (
        <div className="preview-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>

            <button
              className="preview-close"
              onClick={() => setShowPreviewModal(false)}
            >
              ✕
            </button>

            {previewUrl.startsWith('data:image') && (
              <img src={previewUrl} alt="Preview" />
            )}

            {previewUrl.startsWith('data:application/pdf') && (
              <iframe
                src={previewUrl}
                title="PDF Preview"
              />
            )}
          </div>
        </div>
      )}
    </div>


  )
}
