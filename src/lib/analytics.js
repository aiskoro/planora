// Google Tag Manager, încărcat doar după consimțământul vizitatorului
// (vezi CookieConsent.jsx). ID-ul containerului vine din variabila de mediu
// VITE_GTM_ID — se setează în Vercel (Project Settings → Environment
// Variables) și local în .env, format GTM-XXXXXXX.

const GTM_ID = import.meta.env.VITE_GTM_ID
const STORAGE_KEY = 'timevia-consent'

export function getConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // localStorage indisponibil (ex. mod privat) — nu blocăm nimic
  }
}

let loaded = false

export function loadGTM() {
  if (loaded || typeof window === 'undefined') return
  if (!GTM_ID) {
    console.warn('VITE_GTM_ID nu e setat — GTM nu se încarcă.')
    return
  }
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`
  document.head.appendChild(script)

  const noscript = document.createElement('noscript')
  const iframe = document.createElement('iframe')
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`
  iframe.height = '0'
  iframe.width = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  noscript.appendChild(iframe)
  document.body.insertBefore(noscript, document.body.firstChild)
}

// Trimite un eveniment custom în dataLayer (ex. pushEvent('rezervare_creata')).
// Nu face nimic dacă GTM încă nu s-a încărcat (vizitator fără consimțământ).
export function pushEvent(event, params = {}) {
  if (!loaded) return
  window.dataLayer?.push({ event, ...params })
}

// Apelat o dată, la pornirea aplicației — încarcă GTM automat dacă
// vizitatorul a acceptat deja cookie-urile la o vizită anterioară.
export function initAnalytics() {
  if (getConsent() === 'accepted') loadGTM()
}
