import { getStore } from '@netlify/blobs'

export default async (req) => {
  const store = getStore('raffle')
  const { number, sessionId } = await req.json()

  const raw = await store.get('numbers')
  if (!raw) {
    return Response.json({ error: 'Numbers not initialized' }, { status: 400 })
  }

  const numbers = JSON.parse(raw)

  // Verificar si el número existe y está disponible
  if (!numbers[number]) {
    return Response.json({ error: 'Number does not exist' }, { status: 400 })
  }

  const now = Date.now()
  const RESERVATION_TIME = 4 * 60 * 1000 // 4 minutos

  // Verificar si ya está tomado
  if (numbers[number].status === 'taken') {
    return Response.json({ error: 'Number already taken' }, { status: 400 })
  }

  // Verificar si está reservado
  if (numbers[number].status === 'reserved') {
    const reservedAt = numbers[number].reservedAt
    const reservedBy = numbers[number].sessionId
    
    // Si es la misma sesión, permitir (renovar la reserva)
    if (reservedBy === sessionId) {
      numbers[number] = {
        status: 'reserved',
        reservedAt: now,
        sessionId
      }
      await store.setJSON('numbers', numbers)
      await new Promise(resolve => setTimeout(resolve, 100))
      return Response.json({ ok: true, expiresAt: now + RESERVATION_TIME })
    }
    
    // Si es otra persona y no ha expirado, rechazar
    if (now - reservedAt < RESERVATION_TIME) {
      return Response.json({ error: `El número ${number} ya está reservado` }, { status: 400 })
    }
  }

  // Reservar el número
  numbers[number] = {
    status: 'reserved',
    reservedAt: now,
    sessionId
  }

  await store.setJSON('numbers', numbers)
  
  // Pequeño delay para asegurar propagación del blob store
  await new Promise(resolve => setTimeout(resolve, 100))

  return Response.json({ ok: true, expiresAt: now + RESERVATION_TIME })
}
