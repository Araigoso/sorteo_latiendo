import { getStore } from '@netlify/blobs'

export default async (req) => {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response('Missing key', { status: 400 })
  }

  const store = getStore('raffle')
  const proof = await store.get(key, { type: 'arrayBuffer' })

  if (!proof) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(proof, {
    status: 200,
    headers: {
      'Content-Type': key.endsWith('.png') ? 'image/png' : 'image/jpeg',
    },
  })
}
