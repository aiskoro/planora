import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { nume, email, data, ora, servicii, durata } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email lipsă' })
  }

  try {
    await resend.emails.send({
      from: 'Planora <onboarding@resend.dev>',
      to: email,
      subject: 'Confirmare programare — Planora',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Programare confirmată! ✅</h2>
          <p>Bună, <strong>${nume}</strong>!</p>
          <p>Programarea ta a fost înregistrată cu succes.</p>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;">📅 <strong>Data:</strong> ${data}</p>
            <p style="margin: 4px 0;">⏰ <strong>Ora:</strong> ${ora}</p>
            <p style="margin: 4px 0;">✂️ <strong>Servicii:</strong> ${servicii}</p>
            <p style="margin: 4px 0;">⏱️ <strong>Durată:</strong> ${durata} minute</p>
          </div>
          <p>Te așteptăm!</p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}