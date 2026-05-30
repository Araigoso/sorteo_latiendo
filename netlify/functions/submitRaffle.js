import { getStore } from '@netlify/blobs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async (req) => {
  try {
    const store = getStore('raffle')
    const body = await req.json()
    const { number, name, email, paymentProof, sessionId } = body

    const raw = await store.get('numbers')

    if (!raw) {
      return Response.json(
        { error: 'Numbers not initialized' },
        { status: 400 }
      )
    }

    const numbers = JSON.parse(raw)

    if (!numbers[number]) {
      return Response.json(
        { error: 'Número no existe' },
        { status: 400 }
      )
    }

    const numberData = numbers[number]

    if (numberData.status === 'taken') {
      return Response.json(
        { error: 'Número no está disponible' },
        { status: 400 }
      )
    }

    if (
      numberData.status === 'reserved' &&
      numberData.sessionId !== sessionId
    ) {
      return Response.json(
        { error: 'Número reservado por otra persona' },
        { status: 400 }
      )
    }

    let base64Data = null
    let fileName = null

    if (paymentProof && paymentProof.startsWith('data:')) {
      const matches = paymentProof.match(/^data:([^;]+);base64,(.+)$/)

      if (matches) {
        const mimeType = matches[1]
        base64Data = matches[2]

        const extension =
          mimeType.includes('png') ? 'png'
          : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg'
          : mimeType.includes('webp') ? 'webp'
          : 'jpg'

        fileName = `comprobante-numero-${number}.${extension}`
      }
    }

    numbers[number] = {
      status: 'taken',
      name,
      email,
      date: new Date().toISOString()
    }

    await store.setJSON('numbers', numbers)

    try {
      await resend.emails.send({
        from: 'Rifa <onboarding@resend.dev>',
        to: 'raigosoamparo@gmail.com',
        subject: `Nueva reserva - Número ${number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>✅ Nueva reserva de rifa</h2>

            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>

            <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;text-align:center;">
              <p style="margin:0;">Número reservado:</p>
              <h1 style="margin:10px 0;font-size:48px;">${number}</h1>
            </div>

            <p><strong>Comprobante:</strong> ${fileName ? 'Adjunto en este mail' : 'No se adjuntó comprobante'}</p>
          </div>
        `,
        attachments: base64Data
          ? [
              {
                filename: fileName,
                content: base64Data,
              },
            ]
          : [],
      })
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError)
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('❌ FATAL ERROR in submitRaffle:', error)

    return Response.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
