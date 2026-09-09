// Vercel Serverless Function — trimite emailul de confirmare programare prin Brevo.
//
// SECURITATE: endpointul e public (fluxul de rezervare e anonim), deci NU are voie
// sa creada nimic din ce primeste. Singurul lucru acceptat din client e `programare_id`.
// Tot continutul emailului (nume, data, ora, servicii, afacere, linkuri) e citit de aici
// direct din Supabase cu service role. Consecinta: nimeni nu poate folosi endpointul ca
// sa trimita emailuri arbitrare de pe contact@timevia.ro — poate cel mult declansa
// retrimiterea unei programari care exista deja.
//
// Idempotenta: coloana `programari.email_trimis_la` e "revendicata" atomic inainte de
// trimitere (update conditionat pe `is null`). A doua cerere pe acelasi id nu mai trimite
// nimic, deci nimeni nu poate arde cota Brevo repetand acelasi request.
//
// Chei (env vars Vercel, FARA prefix VITE_ — altfel ajung in bundle-ul client):
//   BREVO_API_KEY              — cheia API Brevo (xkeysib-...)
//   SUPABASE_SERVICE_ROLE_KEY  — cheia service role Supabase (trece peste RLS)

import { createClient } from '@supabase/supabase-js'

const EXPEDITOR = { name: 'Timevia', email: 'contact@timevia.ro' }
const BASE_DOMAIN = 'timevia.ro'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { programare_id } = req.body || {}

  if (!programare_id || typeof programare_id !== 'string' || !UUID_RE.test(programare_id)) {
    res.status(400).json({ error: 'programare_id lipsa sau invalid' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey || !process.env.BREVO_API_KEY) {
    console.error('Config incompleta: lipseste SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY sau BREVO_API_KEY')
    res.status(500).json({ error: 'Configurare server incompleta' })
    return
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    // 1. Citeste programarea. Service role => trece peste RLS, dar citim strict un singur rand.
    const { data: programare, error: errProgramare } = await admin
      .from('programari')
      .select(`
        id, nume_client, email, data_programare, ora_start, ora_sfarsit,
        durata_totala, status, cancel_token, email_trimis_la,
        frizeri ( nume, tenant_id ),
        programari_servicii ( servicii ( nume ) )
      `)
      .eq('id', programare_id)
      .maybeSingle()

    if (errProgramare) {
      console.error('Eroare la citirea programarii:', errProgramare)
      res.status(500).json({ error: 'Eroare la citirea programarii' })
      return
    }

    if (!programare) {
      res.status(404).json({ error: 'Programare inexistenta' })
      return
    }

    // 2. Cazuri in care nu trimitem nimic — raspundem 200, nu sunt erori.
    if (programare.status === 'anulata') {
      res.status(200).json({ ok: true, skipped: 'programare anulata' })
      return
    }

    if (!programare.email) {
      res.status(200).json({ ok: true, skipped: 'fara email' })
      return
    }

    if (programare.email_trimis_la) {
      res.status(200).json({ ok: true, skipped: 'deja trimis' })
      return
    }

    // 3. Revendicare atomica: marcam email_trimis_la DOAR daca e inca null.
    //    Daca update-ul nu intoarce niciun rand, altcineva a luat-o inainte.
    const { data: claim, error: errClaim } = await admin
      .from('programari')
      .update({ email_trimis_la: new Date().toISOString() })
      .eq('id', programare_id)
      .is('email_trimis_la', null)
      .select('id')
      .maybeSingle()

    if (errClaim) {
      console.error('Eroare la revendicarea trimiterii:', errClaim)
      res.status(500).json({ error: 'Eroare interna' })
      return
    }

    if (!claim) {
      res.status(200).json({ ok: true, skipped: 'deja trimis' })
      return
    }

    // 4. Numele afacerii + slug-ul, pentru subiect si pentru linkul de anulare.
    let numeAfacere = 'Timevia'
    let slug = 'demo'

    if (programare.frizeri?.tenant_id) {
      const { data: tenant } = await admin
        .from('tenants')
        .select('nume_afacere, slug')
        .eq('id', programare.frizeri.tenant_id)
        .maybeSingle()

      if (tenant) {
        numeAfacere = tenant.nume_afacere || numeAfacere
        slug = tenant.slug || slug
      }
    }

    // 5. Datele pentru email, toate derivate din DB.
    const nume = programare.nume_client
    const data = programare.data_programare
    const ora = String(programare.ora_start).slice(0, 5)
    const oraSfarsit = String(programare.ora_sfarsit).slice(0, 5)
    const durata = programare.durata_totala
    const servicii = (programare.programari_servicii || [])
      .map(ps => ps.servicii?.nume)
      .filter(Boolean)
      .join(', ')

    const googleLink = construiesteLinkCalendar({ data, ora, oraSfarsit, servicii, durata })
    const cancelLink = programare.cancel_token
      ? `https://${slug}.${BASE_DOMAIN}/anulare/${programare.cancel_token}`
      : null

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
      ${googleLink ? `<p><a href="${escapeHtml(googleLink)}" style="display:inline-block;padding:10px 16px;background:#4F6BF0;color:#fff;text-decoration:none;border-radius:8px;">Adaugă în Google Calendar</a></p>` : ''}
      <p>Te așteptăm!</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="font-size:13px;color:#666;">
        Dacă nu poți ajunge, anulează cu minim 2 ore înainte:<br/>
        ${cancelLink ? `<a href="${escapeHtml(cancelLink)}">Anulează programarea</a>` : ''}
      </p>
    </div>
  `

    // 6. Trimiterea propriu-zisa.
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: numeAfacere, email: EXPEDITOR.email },
        replyTo: { name: numeAfacere, email: EXPEDITOR.email },
        to: [{ email: programare.email, name: nume }],
        subject: `Confirmare programare ${numeAfacere} - ${nume}`,
        htmlContent,
      }),
    })

    if (!brevoRes.ok) {
      // Trimiterea a esuat => eliberam revendicarea, ca o reincercare legitima sa fie posibila.
      const errText = await brevoRes.text()
      console.error('Brevo a raspuns cu eroare:', brevoRes.status, errText)
      await admin
        .from('programari')
        .update({ email_trimis_la: null })
        .eq('id', programare_id)
      res.status(502).json({ error: 'Emailul nu a putut fi trimis' })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Eroare la trimiterea emailului:', err)
    // Best-effort: nu lasam programarea marcata ca trimisa daca am crapat pe drum.
    try {
      await admin
        .from('programari')
        .update({ email_trimis_la: null })
        .eq('id', programare_id)
    } catch (_) { /* ignoram */ }
    res.status(500).json({ error: 'Eroare server la trimiterea emailului' })
  }
}

function construiesteLinkCalendar({ data, ora, oraSfarsit, servicii, durata }) {
  if (!data || !ora || !oraSfarsit) return null
  const zi = String(data).replace(/-/g, '')
  const start = String(ora).replace(':', '') + '00'
  const stop = String(oraSfarsit).replace(':', '') + '00'
  const titlu = encodeURIComponent(`Programare — ${servicii || ''}`)
  const detalii = encodeURIComponent(`Servicii: ${servicii || ''}\nDurata: ${durata || ''} minute`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titlu}&dates=${zi}T${start}/${zi}T${stop}&details=${detalii}`
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}