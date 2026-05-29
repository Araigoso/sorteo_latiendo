import { useState } from 'react'

export default function RaffleForm() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [numero, setNumero] = useState('')
  const [comprobante, setComprobante] = useState(null)

  const handleSubmit = (e) => {
  e.preventDefault()

  if (numero < 1 || numero > 500) {
    alert('Elegí un número entre 1 y 500')
    return
  }

  alert('Formulario OK (todavía no envía)')
}

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nombre
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </label>

      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>

      <label>
  Número de rifa (1-500)

  <input
    type="number"
    min="1"
    max="500"
    value={numero}
    onChange={e => setNumero(e.target.value)}
    placeholder="Elegí un número"
    required
  />

      </label>

      <label>
        Comprobante de pago
        <input
          type="file"
          accept="image/*"
          onChange={e => setComprobante(e.target.files[0])}
          required
        />
      </label>

      <button type="submit">Enviar</button>
    </form>
  )
}
