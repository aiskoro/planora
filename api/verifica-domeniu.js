// Vercel Serverless Function — verifică dacă subdomeniul unui tenant e live.
//
// Se pune la: api/verifica-domeniu.js
//
// De ce e nevoie de ea: din browser nu poți testa `https://dacia.timevia.ro`
// direct (CORS + CSP blochează cererea, iar o eroare de certificat nu-ți spune
// nimic util în JS). Verificarea se face aici, server-side, unde vedem exact
// de ce nu merge: DNS lipsă, certificat neemis încă, sau domeniu neadăugat în Vercel.
//
// SECURITATE:
//   - Endpointul cere JWT valid + rând în `platform_admins`. Nu e public.
//   - Singurul lucru pe care îl acceptă din client e un slug validat cu regex,
//     iar URL-ul se construiește AICI (`https://{slug}.timevia.ro`). Nu se poate
//     folosi ca proxy către alte adrese.
//
// Env vars (deja existente pe Vercel):
//   SUPABASE_URL sau VITE_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/
const BASE_DOMAIN = 'timevia.ro'
const TIMEOUT_MS = 8000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Configurare server incompletă.' })
    return
  }

  // ---- 1. Autentificare ----
  const authHeader = req.headers.authorization || ''
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!jwt) {
    res.status(401).json({ error: 'Neautentificat.' })
    return
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: userData, error: userErr } = await admin.auth.getUser(jwt)
  if (userErr || !userData?.user) {
    res.status(401).json({ error: 'Sesiune invalidă.' })
    return
  }

  const { data: adminRow } = await admin
    .from('platform_admins')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (!adminRow) {
    res.status(403).json({ error: 'Acces interzis.' })
    return
  }

  // ---- 2. Slug ----
  const { slug } = req.body || {}
  if (!slug || typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    res.status(400).json({ error: 'Slug invalid.' })
    return
  }

  const url = `https://${slug}.${BASE_DOMAIN}/`

  // ---- 3. Cererea propriu-zisă ----
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const raspuns = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'Timevia-Platform-Check' },
    })
    clearTimeout(timer)

    const text = await raspuns.text().catch(() => '')

    // Vercel răspunde cu 404 + DEPLOYMENT_NOT_FOUND când DNS-ul rezolvă,
    // dar domeniul nu e înregistrat în proiect.
    if (text.includes('DEPLOYMENT_NOT_FOUND') || text.includes('DEPLOYMENT_PAUSED')) {
      res.status(200).json({
        stare: 'lipsa_vercel',
        mesaj: 'DNS-ul merge, dar domeniul nu e adăugat în proiectul Vercel. Vezi pasul 2.',
        status_http: raspuns.status,
      })
      return
    }

    if (raspuns.status >= 200 && raspuns.status < 400) {
      res.status(200).json({
        stare: 'ok',
        mesaj: 'Subdomeniul răspunde și certificatul e valid.',
        status_http: raspuns.status,
      })
      return
    }

    res.status(200).json({
      stare: 'raspuns_neasteptat',
      mesaj: `Subdomeniul răspunde, dar cu status ${raspuns.status}.`,
      status_http: raspuns.status,
    })
  } catch (err) {
    clearTimeout(timer)

    const cod = err?.cause?.code || err?.code || err?.name || ''
    const codStr = String(cod).toUpperCase()

    if (codStr.includes('ABORT')) {
      res.status(200).json({
        stare: 'timeout',
        mesaj: 'Nu am primit răspuns în 8 secunde. Mai încearcă peste un minut.',
      })
      return
    }

    if (codStr.includes('ENOTFOUND') || codStr.includes('EAI_AGAIN') || codStr.includes('NXDOMAIN')) {
      res.status(200).json({
        stare: 'lipsa_dns',
        mesaj: 'Subdomeniul nu există încă în DNS. Verifică CNAME-ul din Cloudflare (pasul 1) sau mai așteaptă câteva minute.',
      })
      return
    }

    if (codStr.includes('CERT') || codStr.includes('ALTNAME') || codStr.includes('SSL') || codStr.includes('TLS')) {
      res.status(200).json({
        stare: 'lipsa_certificat',
        mesaj: 'DNS-ul merge, dar certificatul nu e emis încă. De obicei se rezolvă în 1-2 minute după ce adaugi domeniul în Vercel.',
      })
      return
    }

    console.error('Verificare domeniu eșuată:', url, cod, err?.message)
    res.status(200).json({
      stare: 'eroare',
      mesaj: 'Nu am putut verifica subdomeniul. Mai încearcă...',
    })
  }
}