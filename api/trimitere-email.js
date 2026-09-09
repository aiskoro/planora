// Vercel Serverless Function — trimite emailul de confirmare programare prin Brevo.
// Cheia API Brevo stă doar aici, server-side (env var BREVO_API_KEY, fara prefix VITE_),
// nu ajunge niciodata in bundle-ul de JS trimis catre browser.

const EXPEDITOR = { name: 'Timevia', email: 'timevia.app@gmail.com' }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const {
    nume,
    email_client,
    data,
    ora,
    servicii,
    durata,
    nume_afacere,
    google_calendar_link,
    cancel_link,
  } = req.body || {}

  if (!email_client || !nume) {
    res.status(400).json({ error: 'Date lipsa (nume sau email_client)' })
    return
  }

  const numeAfacereFinal = nume_afacere || 'Timevia'

  const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6; max-width: 480px;">
      <p>Bună, ${escapeHtml(nume)}!</p>
      <p>Programarea ta a fost confirmată.</p>
      <p>
        Data: <strong>${escapeHtml(data || '')}</strong><br/>
        Ora: <strong>${escapeHtml(ora || '')}</strong><br/>
        Servicii: <strong>${escapeHtml(servicii || '')}</strong><br/>
        Durată: <strong>${escapeHtml(String(durata || ''))} minute</strong>
      </p>
      ${google_calendar_link ? `<p><a href="${google_calendar_link}" style="display:inline-block;padding:10px 16px;background:#4F6BF0;color:#fff;text-decoration:none;border-radius:8px;">Adaugă în Google Calendar</a></p>` : ''}
      <p>Te așteptăm!</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:13px;color:#666;">
        Dacă nu poți ajunge, anulează cu minim 2 ore înainte:<br/>
        ${cancel_link ? `<a href="${cancel_link}">Anulează programarea</a>` : ''}
      </p>
    </div>
  `

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: numeAfacereFinal, email: EXPEDITOR.email },
        to: [{ email: email_client, name: nume }],
        subject: `Confirmare programare ${numeAfacereFinal} - ${nume}`,
        htmlContent,
      }),
    })

    if (!brevoRes.ok) {
      const errText = await brevoRes.text()
      console.error('Brevo a raspuns cu eroare:', brevoRes.status, errText)
      res.status(502).json({ error: 'Emailul nu a putut fi trimis' })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Eroare la trimiterea emailului:', err)
    res.status(500).json({ error: 'Eroare server la trimiterea emailului' })
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}