import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('raffle')

  let numbers = null
  const raw = await store.get('numbers')

  if (raw) {
    try {
      numbers = JSON.parse(raw)
    } catch {
      numbers = null
    }
  }

  if (!numbers || typeof numbers !== 'object') {
    numbers = {}
    for (let i = 1; i <= 500; i++) {
      numbers[i] = { status: 'available' }
    }

    await store.setJSON('numbers', numbers)
  }

  return Response.json(numbers)
}
