// ============================================================================
// Timevia — Panou de platformă (super-admin)
// Se pune la: src/pages/Platform.jsx   →   accesibil la timevia.ro/platform
// ============================================================================
//
// Ce face: creează tenanți, utilizatori și servicii, apoi îți dă pașii manuali
// exacți pentru Cloudflare și Vercel, cu valorile gata de copiat.
//
// Ce NU face: nu atinge Cloudflare și nu atinge Vercel. Nu există niciun token
// de API în aplicație. Pașii ăia îi faci tu, iar panoul doar ține minte unde ai rămas.
//
// Autorizare: fiecare RPC și fiecare apel de funcție verifică server-side că
// ești în `platform_admins`. Ce vezi mai jos e doar interfață — dacă cineva
// ocolește React-ul, baza de date îl oprește oricum.
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const BASE_DOMAIN = 'timevia.ro'
const CNAME_TARGET = '940003a706d08ada.vercel-dns.com'
const VERCEL_PROJECT = 'planora'
const FUNCTION_URL =
  'https://owkolupotmipgqekzgvq.supabase.co/functions/v1/platform-provisioning'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

// Ține minte ce tenant era deschis, ca revenirea din alt tab (sau un refresh)
// să nu te arunce înapoi în listă. Doar ID-ul; dispare la închiderea tab-ului.
const CHEIE_TENANT_DESCHIS = 'timevia-platform-tenant'

// ---------------------------------------------------------------------------
// Utilitare
// ---------------------------------------------------------------------------

function slugDinNume(nume) {
  return nume
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // scoate diacriticele: a-breve -> a, s-virgula -> s
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '')
}

function genereazaParola() {
  const mici = 'abcdefghijkmnpqrstuvwxyz'
  const mari = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const cifre = '23456789'
  const semne = '-_'
  const toate = mici + mari + cifre
  const rnd = new Uint32Array(12)
  crypto.getRandomValues(rnd)

  let p = ''
  p += mari[rnd[0] % mari.length]
  p += mici[rnd[1] % mici.length]
  p += mici[rnd[2] % mici.length]
  p += cifre[rnd[3] % cifre.length]
  p += semne[rnd[4] % semne.length]
  for (let i = 5; i < 12; i++) p += toate[rnd[i] % toate.length]
  return p
}

function dataRo(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

async function copiaza(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Componente mici
// ---------------------------------------------------------------------------

function Camp({ T, eticheta, ajutor, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 6 }}>
        {eticheta}
      </span>
      {children}
      {ajutor && (
        <span style={{ display: 'block', fontSize: 12, color: T.muted, marginTop: 5, lineHeight: 1.5 }}>
          {ajutor}
        </span>
      )}
    </label>
  )
}

function stilInput(T) {
  return {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    color: T.text,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    outline: 'none',
    transition: T.transition,
  }
}

function Buton({ T, variant = 'primar', onClick, disabled, children, style }) {
  const baza = {
    padding: '9px 16px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: T.transition,
    border: '1px solid transparent',
    ...style,
  }
  const variante = {
    primar: { background: T.accent, color: '#fff', border: `1px solid ${T.accent}` },
    secundar: { background: T.surface, color: T.text, border: `1px solid ${T.border}` },
    pericol: { background: T.dangerSoft, color: T.danger, border: `1px solid ${T.danger}` },
    text: { background: 'transparent', color: T.muted, border: '1px solid transparent', padding: '6px 8px' },
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ ...baza, ...variante[variant] }}>
      {children}
    </button>
  )
}

function ValoareCopiabila({ T, eticheta, valoare }) {
  const [copiat, setCopiat] = useState(false)
  async function handle() {
    const ok = await copiaza(valoare)
    if (ok) {
      setCopiat(true)
      setTimeout(() => setCopiat(false), 1600)
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: T.muted, minWidth: 110 }}>{eticheta}</span>
      <code
        style={{
          flex: '1 1 200px',
          fontFamily: MONO,
          fontSize: 13,
          color: T.text,
          background: T.surface2,
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: '6px 10px',
          wordBreak: 'break-all',
        }}
      >
        {valoare}
      </code>
      <Buton T={T} variant="secundar" onClick={handle} style={{ padding: '6px 12px', fontSize: 13 }}>
        {copiat ? 'Copiat ✓' : 'Copiază'}
      </Buton>
    </div>
  )
}

function Badge({ T, culoare, children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 999,
        background: culoare === 'verde' ? 'rgba(34,197,94,0.12)' : culoare === 'rosu' ? T.dangerSoft : T.accentSoft,
        color: culoare === 'verde' ? T.success : culoare === 'rosu' ? T.danger : T.accent,
      }}
    >
      {children}
    </span>
  )
}

function Card({ T, children, style }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: T.shadowCard,
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Alerta({ T, tip, children }) {
  if (!children) return null
  const culori = {
    eroare: { bg: T.dangerSoft, fg: T.danger, br: T.danger },
    succes: { bg: 'rgba(34,197,94,0.10)', fg: T.success, br: T.success },
    info: { bg: T.accentSoft, fg: T.accent, br: T.accent },
  }[tip] || { bg: T.surface2, fg: T.text, br: T.border }

  return (
    <div
      style={{
        background: culori.bg,
        color: culori.fg,
        border: `1px solid ${culori.br}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 14,
        marginBottom: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagina
// ---------------------------------------------------------------------------

export default function Platform() {
  const { T, isDark, toggleTheme } = useTheme()

  const [sesiune, setSesiune] = useState(null)
  const [esteAdmin, setEsteAdmin] = useState(null) // null = încă nu știm
  const [loading, setLoading] = useState(true)

  const esteDomeniulPrincipal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === BASE_DOMAIN ||
    window.location.hostname === `www.${BASE_DOMAIN}`

  // Sesiunea se restaurează asincron din localStorage. Un singur getSession()
  // la mount poate returna null înainte să apuce să se restaureze — exact bug-ul
  // care apărea pe contul Catei. De aceea ne abonăm la onAuthStateChange.
  //
  // ATENȚIE (bug reparat): Supabase re-emite evenimentul `SIGNED_IN` de fiecare
  // dată când tab-ul redevine vizibil. E în biblioteca lor, nu în codul nostru:
  // GoTrueClient ascultă `visibilitychange` → `_onVisibilityChanged` →
  // `_recoverAndRefresh` → `_notifyAllSubscribers('SIGNED_IN', session)`.
  // Obiectul sesiune primit e NOU de fiecare dată, chiar dacă e același user și
  // același token. Dacă îl punem direct în state, orice revenire din alt tab
  // (ex. te duci în Cloudflare și te întorci) schimbă identitatea obiectului,
  // re-rulează efectele care depind de el, demontează panoul și pierzi tenantul
  // deschis. Soluția: păstrăm obiectul vechi cât timp e vorba de același user.
  //
  // Nimeni nu citește `access_token` din state-ul ăsta — fiecare apel de rețea
  // face `getSession()` proaspăt — deci „înghețarea" obiectului nu învechește
  // tokenul. Din sesiune se folosește doar `user.email`, pentru afișare.
  function pastreazaSesiunea(prev, s) {
    if (!s) return null
    if (prev && prev.user?.id === s.user?.id) return prev
    return s
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSesiune((prev) => pastreazaSesiunea(prev, s))
      if (!s) {
        setEsteAdmin(null)
        setLoading(false)
      }
    })
    supabase.auth.getSession().then(({ data }) => {
      setSesiune((prev) => pastreazaSesiunea(prev, data.session))
      if (!data.session) setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Verificarea de admin depinde de ID-ul userului (un string), nu de obiectul
  // sesiune. Un token reîmprospătat nu mai declanșează o re-verificare.
  // Fără `setLoading(true)` aici: `loading` pornește true și devine false o
  // singură dată. Altfel, o re-verificare ar înlocui panoul cu ecranul de
  // încărcare, l-ar demonta și i-ar șterge starea.
  const userId = sesiune?.user?.id ?? null

  useEffect(() => {
    if (!userId) return
    let anulat = false
    supabase.rpc('rpc_este_platform_admin').then(({ data, error }) => {
      if (anulat) return
      setEsteAdmin(!error && data === true)
      setLoading(false)
    })
    return () => { anulat = true }
  }, [userId])

  if (!esteDomeniulPrincipal) {
    return (
      <Ecran T={T}>
        <Card T={T} style={{ maxWidth: 460 }}>
          <h1 style={{ fontSize: 18, margin: '0 0 8px', color: T.text }}>Pagina nu există</h1>
          <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>
            Panoul de platformă e disponibil doar pe {BASE_DOMAIN}.
          </p>
        </Card>
      </Ecran>
    )
  }

  return (
    <>
      <Helmet>
        <title>Platformă — Timevia</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {loading ? (
        <Ecran T={T}>
          <p style={{ color: T.muted, fontSize: 14 }}>Se încarcă…</p>
        </Ecran>
      ) : !sesiune ? (
        <Login T={T} />
      ) : !esteAdmin ? (
        <Ecran T={T}>
          <Card T={T} style={{ maxWidth: 460 }}>
            <h1 style={{ fontSize: 18, margin: '0 0 8px', color: T.text }}>Nu ai acces</h1>
            <p style={{ fontSize: 14, color: T.muted, margin: '0 0 16px', lineHeight: 1.55 }}>
              Contul <strong>{sesiune.user.email}</strong> nu e admin de platformă.
              Dacă voiai dashboard-ul unei afaceri, intră pe subdomeniul ei, la /admin.
            </p>
            <Buton T={T} variant="secundar" onClick={() => supabase.auth.signOut()}>
              Ieși din cont
            </Buton>
          </Card>
        </Ecran>
      ) : (
        <Panou T={T} isDark={isDark} toggleTheme={toggleTheme} sesiune={sesiune} />
      )}
    </>
  )
}

function Ecran({ T, children }) {
  return (
    <div
      style={{
        minHeight: '100svh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function Login({ T }) {
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState(null)
  const [loading, setLoading] = useState(false)

  async function intra(e) {
    e.preventDefault()
    setEroare(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: parola })
    if (error) {
      setEroare('Email sau parolă greșite.')
      setLoading(false)
    }
    // La succes, onAuthStateChange din Platform preia mai departe.
  }

  return (
    <Ecran T={T}>
      <form onSubmit={intra} style={{ width: '100%', maxWidth: 380 }}>
        <Card T={T}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', color: T.text }}>
              timevia <span style={{ color: T.accent }}>platformă</span>
            </h1>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              Administrare tenanți. Acces restricționat.
            </p>
          </div>

          <Alerta T={T} tip="eroare">{eroare}</Alerta>

          <Camp T={T} eticheta="Email">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="username" required style={stilInput(T)}
            />
          </Camp>

          <Camp T={T} eticheta="Parolă">
            <input
              type="password" value={parola} onChange={(e) => setParola(e.target.value)}
              autoComplete="current-password" required style={stilInput(T)}
            />
          </Camp>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '11px 16px', fontSize: 14, fontWeight: 500,
              background: T.accent, color: '#fff', border: 'none', borderRadius: 8,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Se verifică…' : 'Intră'}
          </button>
        </Card>
      </form>
    </Ecran>
  )
}

// ---------------------------------------------------------------------------
// Panoul
// ---------------------------------------------------------------------------

function Panou({ T, isDark, toggleTheme, sesiune }) {
  const [tenanti, setTenanti] = useState([])
  const [loading, setLoading] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [vizualizare, setVizualizare] = useState('lista') // lista | nou | detaliu
  const [tenantSelectat, setTenantSelectat] = useState(null)
  const [credentiale, setCredentiale] = useState(null)

  const incarcaTenanti = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('rpc_platform_tenanti')
    if (error) setEroare('Nu am putut încărca lista de tenanți.')
    else { setTenanti(data || []); setEroare(null) }
    setLoading(false)
  }, [])

  useEffect(() => { incarcaTenanti() }, [incarcaTenanti])

  // A doua plasă de siguranță: ținem minte ce tenant e deschis, ca să te întorci
  // la el chiar și după un refresh complet al paginii (F5, sau tab-ul reîncărcat
  // de browser din lipsă de memorie). Doar ID-ul, în sessionStorage — dispare
  // când închizi tab-ul.
  //
  // Credențialele NU se salvează niciodată aici, intenționat: parola se vede o
  // singură dată, doar în memorie. Nu are ce căuta scrisă pe disc.
  useEffect(() => {
    if (tenantSelectat || tenanti.length === 0) return
    let id = null
    try { id = sessionStorage.getItem(CHEIE_TENANT_DESCHIS) } catch { id = null }
    if (!id) return
    const gasit = tenanti.find((t) => t.id === id)
    if (gasit) {
      setTenantSelectat(gasit)
      setVizualizare('detaliu')
    }
  }, [tenanti, tenantSelectat])

  function deschide(tenant) {
    setTenantSelectat(tenant)
    setVizualizare('detaliu')
    try { sessionStorage.setItem(CHEIE_TENANT_DESCHIS, tenant.id) } catch { /* mod privat */ }
    window.scrollTo(0, 0)
  }

  function inapoi() {
    setVizualizare('lista')
    setTenantSelectat(null)
    setCredentiale(null)
    try { sessionStorage.removeItem(CHEIE_TENANT_DESCHIS) } catch { /* mod privat */ }
    incarcaTenanti()
  }

  const tenantCurent = tenantSelectat
    ? tenanti.find((t) => t.id === tenantSelectat.id) || tenantSelectat
    : null

  return (
    <div style={{ minHeight: '100svh', background: T.bg, color: T.text }}>
      {/* Antet */}
      <header
        style={{
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{ fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          onClick={inapoi}
        >
          timevia <span style={{ color: T.accent }}>platformă</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: T.muted }}>{sesiune.user.email}</span>
          <Buton T={T} variant="text" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</Buton>
          <Buton T={T} variant="secundar" onClick={() => supabase.auth.signOut()}>Ieși</Buton>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px 60px' }}>
        <Alerta T={T} tip="eroare">{eroare}</Alerta>

        {vizualizare === 'lista' && (
          <ListaTenanti
            T={T} tenanti={tenanti} loading={loading}
            onDeschide={deschide} onNou={() => setVizualizare('nou')}
          />
        )}

        {vizualizare === 'nou' && (
          <TenantNou
            T={T}
            onAnuleaza={() => setVizualizare('lista')}
            onCreat={async (rezultat) => {
              setCredentiale(rezultat)
              // Un singur fetch, nu două — `incarcaTenanti()` urmat de încă un
              // `rpc_platform_tenanti()` cerea aceleași date de două ori.
              const { data } = await supabase.rpc('rpc_platform_tenanti')
              setTenanti(data || [])
              const proaspat = (data || []).find((t) => t.id === rezultat.tenant_id)
              deschide(proaspat || {
                id: rezultat.tenant_id,
                slug: rezultat.slug,
                nume_afacere: rezultat.nume_afacere,
              })
            }}
          />
        )}

        {vizualizare === 'detaliu' && tenantCurent && (
          <DetaliuTenant
            T={T}
            tenant={tenantCurent}
            credentiale={credentiale}
            onInapoi={inapoi}
            onRefresh={incarcaTenanti}
            onCredentiale={setCredentiale}
          />
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lista tenanților
// ---------------------------------------------------------------------------

function ListaTenanti({ T, tenanti, loading, onDeschide, onNou }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 2px' }}>Tenanți</h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
            {tenanti.length} {tenanti.length === 1 ? 'afacere' : 'afaceri'} în platformă
          </p>
        </div>
        <Buton T={T} onClick={onNou}>+ Tenant nou</Buton>
      </div>

      {loading && <p style={{ color: T.muted, fontSize: 14 }}>Se încarcă…</p>}

      {!loading && tenanti.length === 0 && (
        <Card T={T}>
          <p style={{ margin: 0, color: T.muted, fontSize: 14 }}>Niciun tenant încă.</p>
        </Card>
      )}

      {tenanti.map((t) => {
        const pasiGata = [t.pas_cloudflare, t.pas_vercel, t.pas_verificat].filter(Boolean).length
        const completConfigurat = pasiGata === 3 && t.activ
        return (
          <div
            key={t.id}
            onClick={() => onDeschide(t)}
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              cursor: 'pointer',
              boxShadow: T.shadowCard,
              transition: T.transition,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{t.nume_afacere}</strong>
                  {completConfigurat
                    ? <Badge T={T} culoare="verde">activ</Badge>
                    : <Badge T={T} culoare="rosu">în provisioning ({pasiGata}/3)</Badge>}
                  {t.booking_public === false && <Badge T={T}>fără booking public</Badge>}
                </div>
                <code style={{ fontFamily: MONO, fontSize: 13, color: T.muted }}>
                  {t.slug}.{BASE_DOMAIN}
                </code>
              </div>
              <div style={{ fontSize: 12, color: T.muted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div>{t.nr_angajati} angajați · {t.nr_servicii} servicii</div>
                <div>{t.nr_programari} programări</div>
                <div style={{ marginTop: 3 }}>creat {dataRo(t.created_at)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Formular tenant nou
// ---------------------------------------------------------------------------

function TenantNou({ T, onAnuleaza, onCreat }) {
  const [numeAfacere, setNumeAfacere] = useState('')
  const [slug, setSlug] = useState('')
  const [slugAtins, setSlugAtins] = useState(false)
  const [numeMaster, setNumeMaster] = useState('')
  const [emailMaster, setEmailMaster] = useState('')
  const [parola, setParola] = useState(genereazaParola)
  const [bookingPublic, setBookingPublic] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [loading, setLoading] = useState(false)

  function schimbaNume(v) {
    setNumeAfacere(v)
    if (!slugAtins) setSlug(slugDinNume(v))
  }

  async function trimite(e) {
    e.preventDefault()
    setEroare(null)
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setEroare('Sesiunea a expirat. Reintră în cont.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          actiune: 'creeaza_tenant',
          slug: slug.trim().toLowerCase(),
          nume_afacere: numeAfacere.trim(),
          nume_master: numeMaster.trim(),
          email_master: emailMaster.trim(),
          parola,
          booking_public: bookingPublic,
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setEroare(json.error || 'Nu am putut crea tenantul.')
        setLoading(false)
        return
      }
      onCreat(json)
    } catch {
      setEroare('Nu am putut contacta serverul. Verifică conexiunea.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={trimite}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Buton T={T} variant="text" onClick={onAnuleaza}>← Înapoi</Buton>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Tenant nou</h1>
      </div>

      <Card T={T}>
        <Alerta T={T} tip="eroare">{eroare}</Alerta>

        <Camp T={T} eticheta="Numele afacerii">
          <input
            type="text" value={numeAfacere} onChange={(e) => schimbaNume(e.target.value)}
            placeholder="Dacia Service" required style={stilInput(T)}
          />
        </Camp>

        <Camp
          T={T}
          eticheta="Subdomeniu"
          ajutor={slug ? `Adresa clientului va fi: https://${slug}.${BASE_DOMAIN}` : 'Litere mici, cifre și cratimă. Minim 3 caractere.'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <input
              type="text" value={slug}
              onChange={(e) => { setSlugAtins(true); setSlug(e.target.value.toLowerCase()) }}
              placeholder="dacia" required
              style={{ ...stilInput(T), borderTopRightRadius: 0, borderBottomRightRadius: 0, fontFamily: MONO }}
            />
            <span
              style={{
                padding: '10px 12px', fontSize: 14, fontFamily: MONO, color: T.muted,
                background: T.surface2, border: `1px solid ${T.border}`, borderLeft: 'none',
                borderTopRightRadius: 8, borderBottomRightRadius: 8, whiteSpace: 'nowrap',
              }}
            >
              .{BASE_DOMAIN}
            </span>
          </div>
        </Camp>

        <div style={{ height: 1, background: T.border, margin: '4px 0 20px' }} />

        <Camp T={T} eticheta="Numele persoanei de contact" ajutor="Apare ca nume al contului master.">
          <input
            type="text" value={numeMaster} onChange={(e) => setNumeMaster(e.target.value)}
            placeholder="Ion Popescu" required style={stilInput(T)}
          />
        </Camp>

        <Camp T={T} eticheta="Email cont master" ajutor="Cu asta se loghează clientul.">
          <input
            type="email" value={emailMaster} onChange={(e) => setEmailMaster(e.target.value)}
            placeholder="contact@daciaservice.ro" required style={stilInput(T)}
          />
        </Camp>

        <Camp T={T} eticheta="Parolă" ajutor="Se afișează o singură dată, după creare. Notează-o sau trimite-o imediat.">
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={parola} onChange={(e) => setParola(e.target.value)}
              required minLength={8} style={{ ...stilInput(T), fontFamily: MONO }}
            />
            <Buton T={T} variant="secundar" onClick={() => setParola(genereazaParola())}>
              Generează
            </Buton>
          </div>
        </Camp>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
          <input
            type="checkbox" checked={bookingPublic}
            onChange={(e) => setBookingPublic(e.target.checked)}
            style={{ marginTop: 3, accentColor: T.accent }}
          />
          <span style={{ fontSize: 14 }}>
            Formular public de rezervare
            <span style={{ display: 'block', fontSize: 12, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>
              Bifat: clienții rezervă singuri de pe subdomeniu. Debifat: programările
              se fac doar din dashboard de către afacere (modelul Nails).
            </span>
          </span>
        </label>
      </Card>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit" disabled={loading}
          style={{
            padding: '11px 20px', fontSize: 14, fontWeight: 500,
            background: T.accent, color: '#fff', border: 'none', borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Se creează…' : 'Creează tenantul'}
        </button>
        <Buton T={T} variant="secundar" onClick={onAnuleaza}>Anulează</Buton>
      </div>

      <p style={{ fontSize: 12.5, color: T.muted, marginTop: 14, lineHeight: 1.6 }}>
        Tenantul se creează <strong>inactiv</strong>. Nu e vizibil pe internet până nu
        termini pașii de DNS și îl activezi tu. Serviciile nu se creează automat —
        le adaugi după, din ecranul tenantului.
      </p>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Detaliu tenant: checklist + servicii + utilizatori
// ---------------------------------------------------------------------------

function DetaliuTenant({ T, tenant, credentiale, onInapoi, onRefresh, onCredentiale }) {
  const [lucreaza, setLucreaza] = useState(false)
  const url = `https://${tenant.slug}.${BASE_DOMAIN}`

  async function setPas(pas, valoare) {
    setLucreaza(true)
    await supabase.rpc('rpc_platform_set_pas', {
      p_tenant_id: tenant.id, p_pas: pas, p_valoare: valoare,
    })
    await onRefresh()
    setLucreaza(false)
  }

  async function setActiv(valoare) {
    setLucreaza(true)
    await supabase.rpc('rpc_platform_set_activ', { p_tenant_id: tenant.id, p_activ: valoare })
    await onRefresh()
    setLucreaza(false)
  }

  async function setBookingPublic(valoare) {
    setLucreaza(true)
    await supabase.rpc('rpc_platform_set_booking_public', { p_tenant_id: tenant.id, p_valoare: valoare })
    await onRefresh()
    setLucreaza(false)
  }

  const totGata = tenant.pas_cloudflare && tenant.pas_vercel && tenant.pas_verificat && tenant.activ

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <Buton T={T} variant="text" onClick={onInapoi}>← Toți tenanții</Buton>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{tenant.nume_afacere}</h1>
        {totGata
          ? <Badge T={T} culoare="verde">activ</Badge>
          : <Badge T={T} culoare="rosu">în provisioning</Badge>}
      </div>

      {credentiale && (
        <Card T={T} style={{ borderColor: T.success, background: 'rgba(34,197,94,0.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Credențiale — se afișează o singură dată</h2>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 14px', lineHeight: 1.55 }}>
            Parola nu se mai poate citi după ce închizi pagina. Copiaz-o acum.
            Dacă o pierzi, o poți reseta mai jos, la Utilizatori.
          </p>
          <ValoareCopiabila T={T} eticheta="Adresă" valoare={`${url}/admin`} />
          <ValoareCopiabila T={T} eticheta="Utilizator" valoare={credentiale.email} />
          <ValoareCopiabila T={T} eticheta="Parolă" valoare={credentiale.parola} />
          <div style={{ marginTop: 14 }}>
            <ValoareCopiabila
              T={T}
              eticheta="Mesaj gata scris"
              valoare={
`Salut, contul tău Timevia e gata.

Adresă: ${url}/admin
Utilizator: ${credentiale.email}
Parolă: ${credentiale.parola}

Te rog schimbă parola la prima logare.`
              }
            />
          </div>
          <Buton T={T} variant="text" onClick={() => onCredentiale(null)} style={{ marginTop: 6 }}>
            Am notat, ascunde
          </Buton>
        </Card>
      )}

      <Checklist
        T={T} tenant={tenant} url={url} lucreaza={lucreaza}
        setPas={setPas} setActiv={setActiv}
      />

      <Servicii T={T} tenantId={tenant.id} onRefresh={onRefresh} />

      <Utilizatori
        T={T} tenantId={tenant.id}
        onRefresh={onRefresh} onCredentiale={onCredentiale}
      />

      <Card T={T}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px' }}>Setări</h2>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
          <input
            type="checkbox" checked={tenant.booking_public !== false}
            onChange={(e) => setBookingPublic(e.target.checked)}
            disabled={lucreaza} style={{ marginTop: 3, accentColor: T.accent }}
          />
          <span style={{ fontSize: 14 }}>
            Formular public de rezervare
            <span style={{ display: 'block', fontSize: 12, color: T.muted, marginTop: 3 }}>
              Debifat, subdomeniul arată pagina de prezentare, iar programările se fac doar din dashboard.
            </span>
          </span>
        </label>

        <div style={{ height: 1, background: T.border, margin: '0 0 14px' }} />

        {tenant.activ ? (
          <div>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 10px', lineHeight: 1.55 }}>
              Dezactivarea face subdomeniul invizibil imediat. Clienții primesc eroare de
              tenant, iar afacerea nu mai poate intra în dashboard. Datele rămân intacte.
            </p>
            <Buton T={T} variant="pericol" onClick={() => setActiv(false)} disabled={lucreaza}>
              Dezactivează tenantul
            </Buton>
          </div>
        ) : (
          <Buton T={T} onClick={() => setActiv(true)} disabled={lucreaza}>
            Activează tenantul
          </Buton>
        )}
      </Card>
    </>
  )
}

// ---------------------------------------------------------------------------
// Checklist provisioning
// ---------------------------------------------------------------------------

function Checklist({ T, tenant, url, lucreaza, setPas, setActiv }) {
  const [verificare, setVerificare] = useState(null)
  const [verifica, setVerifica] = useState(false)

  async function verificaDomeniul() {
    setVerifica(true)
    setVerificare(null)
    const { data: { session } } = await supabase.auth.getSession()
    try {
      const res = await fetch('/api/verifica-domeniu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ slug: tenant.slug }),
      })
      const json = await res.json()
      setVerificare(json)
      if (json.stare === 'ok' && !tenant.pas_verificat) await setPas('verificat', true)
    } catch {
      setVerificare({ stare: 'eroare', mesaj: 'Nu am putut face verificarea.' })
    }
    setVerifica(false)
  }

  const stilPas = (gata) => ({
    borderLeft: `3px solid ${gata ? T.success : T.border}`,
    paddingLeft: 16,
    marginBottom: 22,
    opacity: gata ? 0.72 : 1,
    transition: T.transition,
  })

  const titluPas = (nr, text, gata) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: gata ? T.success : T.accent }}>
        {gata ? '✓' : nr}
      </span>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0 }}>{text}</h3>
    </div>
  )

  const bifa = (etichetat, gata, onChange) => (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, marginTop: 4 }}>
      <input type="checkbox" checked={gata} onChange={onChange} disabled={lucreaza} style={{ accentColor: T.accent }} />
      <span style={{ color: gata ? T.muted : T.text }}>{etichetat}</span>
    </label>
  )

  return (
    <Card T={T}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Pași de configurare</h2>
      <p style={{ fontSize: 13, color: T.muted, margin: '0 0 22px', lineHeight: 1.55 }}>
        Astea se fac o singură dată, manual. Bifele se salvează, deci poți închide pagina
        și continua mai târziu de unde ai rămas.
      </p>

      {/* --- PASUL 1 --- */}
      <div style={stilPas(tenant.pas_cloudflare)}>
        {titluPas('1', 'Cloudflare — adaugă subdomeniul', tenant.pas_cloudflare)}
        <p style={{ fontSize: 13.5, color: T.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
          Intră pe <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" style={{ color: T.accent }}>dash.cloudflare.com</a>
          {' '}→ selectează <strong>{BASE_DOMAIN}</strong> → meniul <strong>DNS</strong> → <strong>Records</strong> → butonul <strong>Add record</strong>.
          Completează exact:
        </p>
        <ValoareCopiabila T={T} eticheta="Type" valoare="CNAME" />
        <ValoareCopiabila T={T} eticheta="Name" valoare={tenant.slug} />
        <ValoareCopiabila T={T} eticheta="Target" valoare={CNAME_TARGET} />
        <div style={{ fontSize: 13.5, color: T.muted, margin: '10px 0 0', lineHeight: 1.7 }}>
          <div><strong style={{ color: T.text }}>Proxy status:</strong> DNS only — norișorul trebuie să fie <strong>gri</strong>, nu portocaliu.</div>
          <div><strong style={{ color: T.text }}>TTL:</strong> Auto</div>
          <div style={{ marginTop: 6 }}>Apoi <strong>Save</strong>.</div>
        </div>
        {bifa('Am adăugat CNAME-ul în Cloudflare', tenant.pas_cloudflare, (e) => setPas('cloudflare', e.target.checked))}
      </div>

      {/* --- PASUL 2 --- */}
      <div style={stilPas(tenant.pas_vercel)}>
        {titluPas('2', 'Vercel — adaugă domeniul în proiect', tenant.pas_vercel)}
        <p style={{ fontSize: 13.5, color: T.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
          Intră pe <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" style={{ color: T.accent }}>vercel.com/dashboard</a>
          {' '}→ proiectul <strong>{VERCEL_PROJECT}</strong> → <strong>Settings</strong> → <strong>Domains</strong> → <strong>Add</strong>.
          Lipește:
        </p>
        <ValoareCopiabila T={T} eticheta="Domain" valoare={`${tenant.slug}.${BASE_DOMAIN}`} />
        <p style={{ fontSize: 13.5, color: T.muted, margin: '10px 0 0', lineHeight: 1.6 }}>
          Vercel va spune „Valid Configuration" după ce vede CNAME-ul de la pasul 1.
          Dacă zice că mai așteaptă, e normal — DNS-ul are nevoie de 1-5 minute.
          Certificatul se emite singur, nu ai nimic de făcut pentru el.
        </p>
        {bifa('Am adăugat domeniul în Vercel', tenant.pas_vercel, (e) => setPas('vercel', e.target.checked))}
      </div>

      {/* --- PASUL 3 --- */}
      <div style={stilPas(tenant.pas_verificat)}>
        {titluPas('3', 'Verifică', tenant.pas_verificat)}
        <p style={{ fontSize: 13.5, color: T.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
          Așteaptă 2-5 minute după pasul 2, apoi apasă butonul. Îți spun exact ce lipsește, dacă lipsește ceva.
        </p>
        <Buton T={T} onClick={verificaDomeniul} disabled={verifica}>
          {verifica ? 'Verific…' : `Verifică ${tenant.slug}.${BASE_DOMAIN}`}
        </Buton>

        {verificare && (
          <div style={{ marginTop: 12 }}>
            <Alerta T={T} tip={verificare.stare === 'ok' ? 'succes' : 'eroare'}>
              {verificare.mesaj}
            </Alerta>
          </div>
        )}

        {bifa('Subdomeniul răspunde', tenant.pas_verificat, (e) => setPas('verificat', e.target.checked))}
      </div>

      {/* --- PASUL 4 --- */}
      <div style={stilPas(tenant.activ)}>
        {titluPas('4', 'Activează tenantul', tenant.activ)}
        <p style={{ fontSize: 13.5, color: T.muted, margin: '0 0 12px', lineHeight: 1.6 }}>
          Până acum tenantul e inactiv, deci nimeni nu poate intra pe un site
          configurat pe jumătate. Activează-l abia după ce pasul 3 e verde.
        </p>
        {tenant.activ ? (
          <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: T.accent }}>
            Deschide {url} ↗
          </a>
        ) : (
          <Buton T={T} onClick={() => setActiv(true)} disabled={lucreaza || !tenant.pas_verificat}>
            Activează
          </Buton>
        )}
        {!tenant.activ && !tenant.pas_verificat && (
          <p style={{ fontSize: 12.5, color: T.muted, margin: '8px 0 0' }}>
            Se deblochează după ce bifezi pasul 3.
          </p>
        )}
      </div>

      {/* --- PASUL 5 --- */}
      <div style={{ borderLeft: `3px solid ${T.border}`, paddingLeft: 16 }}>
        {titluPas('5', 'Trimite credențialele clientului', false)}
        <p style={{ fontSize: 13.5, color: T.muted, margin: 0, lineHeight: 1.6 }}>
          Mesajul gata scris apare sus, imediat după crearea tenantului. Dacă ai
          închis deja pagina și ai pierdut parola, resetează-o din secțiunea Utilizatori.
        </p>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Servicii
// ---------------------------------------------------------------------------

function Servicii({ T, tenantId, onRefresh }) {
  const [servicii, setServicii] = useState([])
  const [loading, setLoading] = useState(true)
  const [nume, setNume] = useState('')
  const [durata, setDurata] = useState('30')
  const [eroare, setEroare] = useState(null)
  const [confirmSterge, setConfirmSterge] = useState(null)

  const incarca = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('rpc_platform_servicii', { p_tenant_id: tenantId })
    if (!error) setServicii(data || [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { incarca() }, [incarca])

  async function adauga(e) {
    e.preventDefault()
    setEroare(null)
    const d = parseInt(durata, 10)
    if (!nume.trim()) return setEroare('Numele serviciului nu poate fi gol.')
    if (!d || d <= 0) return setEroare('Durata trebuie să fie mai mare ca 0.')

    const { error } = await supabase.rpc('rpc_platform_adauga_serviciu', {
      p_tenant_id: tenantId, p_nume: nume.trim(), p_durata: d,
    })
    if (error) return setEroare('Nu am putut adăuga serviciul.')
    setNume(''); setDurata('30')
    await incarca(); await onRefresh()
  }

  async function sterge(id) {
    await supabase.rpc('rpc_platform_sterge_serviciu', { p_serviciu_id: id })
    setConfirmSterge(null)
    await incarca(); await onRefresh()
  }

  return (
    <Card T={T}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Servicii</h2>
      <p style={{ fontSize: 13, color: T.muted, margin: '0 0 16px', lineHeight: 1.55 }}>
        Adaugă aici ce îți cere clientul la început. Ulterior le poate gestiona
        și el singur, din dashboard-ul lui.
      </p>

      <Alerta T={T} tip="eroare">{eroare}</Alerta>

      {loading && <p style={{ fontSize: 13, color: T.muted }}>Se încarcă…</p>}

      {!loading && servicii.length === 0 && (
        <p style={{ fontSize: 13.5, color: T.muted, margin: '0 0 16px' }}>Niciun serviciu încă.</p>
      )}

      {servicii.map((s) => (
        <div
          key={s.id}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 10, padding: '9px 0', borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 14 }}>
            {s.nume}
            <span style={{ color: T.muted, fontSize: 13 }}> · {s.durata} min</span>
            {!s.activ && <span style={{ color: T.muted, fontSize: 12 }}> · inactiv</span>}
          </span>
          {confirmSterge === s.id ? (
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: T.muted }}>Sigur?</span>
              <Buton T={T} variant="pericol" onClick={() => sterge(s.id)} style={{ padding: '5px 10px', fontSize: 13 }}>Da</Buton>
              <Buton T={T} variant="text" onClick={() => setConfirmSterge(null)} style={{ fontSize: 13 }}>Nu</Buton>
            </span>
          ) : (
            <Buton T={T} variant="text" onClick={() => setConfirmSterge(s.id)} style={{ fontSize: 13, color: T.danger }}>
              Șterge
            </Buton>
          )}
        </div>
      ))}

      <form onSubmit={adauga} style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <input
          type="text" value={nume} onChange={(e) => setNume(e.target.value)}
          placeholder="Nume serviciu" style={{ ...stilInput(T), flex: '2 1 180px', width: 'auto' }}
        />
        <input
          type="number" value={durata} onChange={(e) => setDurata(e.target.value)}
          placeholder="min" min="1" style={{ ...stilInput(T), flex: '0 1 90px', width: 'auto' }}
        />
        <Buton T={T} onClick={adauga}>+ Adaugă</Buton>
      </form>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Utilizatori
// ---------------------------------------------------------------------------

function Utilizatori({ T, tenantId, onRefresh, onCredentiale }) {
  const [utilizatori, setUtilizatori] = useState([])
  const [loading, setLoading] = useState(true)
  const [adaugaMod, setAdaugaMod] = useState(false)
  const [nume, setNume] = useState('')
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState(genereazaParola)
  const [eroare, setEroare] = useState(null)
  const [lucreaza, setLucreaza] = useState(false)

  const incarca = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('rpc_platform_utilizatori', { p_tenant_id: tenantId })
    if (!error) setUtilizatori(data || [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { incarca() }, [incarca])

  async function apel(payload) {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    })
    return { res, json: await res.json() }
  }

  async function adauga(e) {
    e.preventDefault()
    setEroare(null)
    setLucreaza(true)
    try {
      const { res, json } = await apel({
        actiune: 'creeaza_user',
        tenant_id: tenantId,
        nume: nume.trim(),
        email: email.trim(),
        parola,
      })
      if (!res.ok || json.error) {
        setEroare(json.error || 'Nu am putut crea contul.')
        setLucreaza(false)
        return
      }
      onCredentiale({ email: json.email, parola: json.parola })
      setNume(''); setEmail(''); setParola(genereazaParola()); setAdaugaMod(false)
      await incarca(); await onRefresh()
      window.scrollTo(0, 0)
    } catch {
      setEroare('Nu am putut contacta serverul.')
    }
    setLucreaza(false)
  }

  async function reseteaza(u) {
    setEroare(null)
    setLucreaza(true)
    const parolaNoua = genereazaParola()
    try {
      const { res, json } = await apel({
        actiune: 'reseteaza_parola', user_id: u.user_id, parola: parolaNoua,
      })
      if (!res.ok || json.error) setEroare(json.error || 'Nu am putut reseta parola.')
      else {
        onCredentiale({ email: json.email, parola: json.parola })
        window.scrollTo(0, 0)
      }
    } catch {
      setEroare('Nu am putut contacta serverul.')
    }
    setLucreaza(false)
  }

  return (
    <Card T={T}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Utilizatori</h2>
        {!adaugaMod && <Buton T={T} variant="secundar" onClick={() => setAdaugaMod(true)}>+ Adaugă</Buton>}
      </div>
      <p style={{ fontSize: 13, color: T.muted, margin: '0 0 16px', lineHeight: 1.55 }}>
        Masterul vede tot dashboard-ul. Angajații văd doar programările lor.
      </p>

      <Alerta T={T} tip="eroare">{eroare}</Alerta>

      {loading && <p style={{ fontSize: 13, color: T.muted }}>Se încarcă…</p>}

      {utilizatori.map((u) => (
        <div
          key={u.id}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 10, padding: '10px 0', borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 14, minWidth: 0 }}>
            {u.nume}
            {u.is_master && <span style={{ marginLeft: 8 }}><Badge T={T}>master</Badge></span>}
            {!u.activ && <span style={{ color: T.muted, fontSize: 12 }}> · inactiv</span>}
            <span style={{ display: 'block', fontSize: 12.5, color: T.muted, fontFamily: MONO, wordBreak: 'break-all' }}>
              {u.email}
            </span>
          </span>
          <Buton T={T} variant="text" onClick={() => reseteaza(u)} disabled={lucreaza} style={{ fontSize: 13 }}>
            Resetează parola
          </Buton>
        </div>
      ))}

      {adaugaMod && (
        <form onSubmit={adauga} style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <Camp T={T} eticheta="Nume">
            <input type="text" value={nume} onChange={(e) => setNume(e.target.value)} required style={stilInput(T)} />
          </Camp>
          <Camp T={T} eticheta="Email">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={stilInput(T)} />
          </Camp>
          <Camp T={T} eticheta="Parolă">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={parola} onChange={(e) => setParola(e.target.value)}
                required minLength={8} style={{ ...stilInput(T), fontFamily: MONO }}
              />
              <Buton T={T} variant="secundar" onClick={() => setParola(genereazaParola())}>Generează</Buton>
            </div>
          </Camp>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit" disabled={lucreaza}
              style={{
                padding: '9px 16px', fontSize: 14, fontWeight: 500, background: T.accent,
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: lucreaza ? 'not-allowed' : 'pointer', opacity: lucreaza ? 0.6 : 1,
              }}
            >
              {lucreaza ? 'Se creează…' : 'Creează contul'}
            </button>
            <Buton T={T} variant="secundar" onClick={() => { setAdaugaMod(false); setEroare(null) }}>
              Anulează
            </Buton>
          </div>
        </form>
      )}
    </Card>
  )
}