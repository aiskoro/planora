import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useFrizer } from '../hooks/useFrizer'
import { useTenant } from '../hooks/useTenant'
import AdminPanel from '../components/AdminPanel'
import ZileBlocate from '../components/ZileBlocate'
import OrarSaptamanal from '../components/OrarSaptamanal'
import GestionareServicii from '../components/GestionareServicii'
import OreBlocate from '../components/OreBlocate'
import GestionareFrizeri from '../components/GestionareFrizeri'
import FaOProgramare from '../components/FaOProgramare'
import { useTheme } from '../context/ThemeContext'
import Statistici from '../components/Statistici'

// ---- Font-uri & stiluri globale (Fraunces + Manrope + JetBrains Mono) ----
function GlobalStyles({ T }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500;1,9..144,600&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      @keyframes tvFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes tvPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      .tv-input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft} !important; outline: none; }
      .tv-tab:focus-visible, .tv-iconbtn:focus-visible, .tv-chip:focus-visible, .tv-input:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 2px; }
      .tv-scrollx::-webkit-scrollbar { height: 5px; }
      .tv-scrollx::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
    `}</style>
  )
}

// ---- Iconite proprii, minimale (fara emoji, fara librarii externe) ----
const ip = { width: 17, height: 17, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const IconCalendar = () => (<svg {...ip}><rect x="2.5" y="4" width="15" height="13.5" rx="2.2" /><path d="M2.5 8.2h15" /><path d="M6.7 2v4M13.3 2v4" /></svg>)
const IconCalendarPlus = () => (<svg {...ip}><rect x="2.5" y="4" width="15" height="13.5" rx="2.2" /><path d="M2.5 8.2h15" /><path d="M6.7 2v4M13.3 2v4" /><path d="M10 11v4M8 13h4" /></svg>)
const IconBars = () => (<svg {...ip}><rect x="3" y="10" width="3" height="6" rx="0.6" /><rect x="8.5" y="5.5" width="3" height="10.5" rx="0.6" /><rect x="14" y="8" width="3" height="8" rx="0.6" /></svg>)
const IconUsers = () => (<svg {...ip}><circle cx="7.2" cy="7" r="2.7" /><path d="M2.2 17c0-2.9 2.2-5 5-5s5 2.1 5 5" /><circle cx="14.6" cy="8.1" r="2.1" /><path d="M12.8 12.3c2.5.4 4.4 2.3 4.4 4.7" /></svg>)
const IconCalendarOff = () => (<svg {...ip}><rect x="2.5" y="4" width="15" height="13.5" rx="2.2" /><path d="M2.5 8.2h15" /><path d="M6.7 2v4M13.3 2v4" /><path d="M4 4l12 12" /></svg>)
const IconClock = () => (<svg {...ip}><circle cx="10" cy="10.3" r="7.3" /><path d="M10 6.3v4l2.8 1.7" /></svg>)
const IconClockOff = () => (<svg {...ip}><circle cx="10" cy="10.3" r="7.3" /><path d="M10 6.3v4l2.2 1.4" /><path d="M4 4l12 12.6" /></svg>)
const IconTag = () => (<svg {...ip}><path d="M11.3 3H4.3a1 1 0 0 0-1 1v7l8.3 8.3a1 1 0 0 0 1.4 0l5.6-5.6a1 1 0 0 0 0-1.4L11.3 3Z" /><circle cx="7.2" cy="7.4" r="1.1" fill="currentColor" stroke="none" /></svg>)
const IconSun = () => (<svg {...ip}><circle cx="10" cy="10" r="3.6" /><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" /></svg>)
const IconMoon = () => (<svg {...ip}><path d="M16.5 12.3A7 7 0 1 1 7.7 3.5a5.6 5.6 0 0 0 8.8 8.8Z" /></svg>)
const IconLogOut = () => (<svg {...ip}><path d="M8.2 3.2H4.4a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1 1h3.8" /><path d="M12.8 14l4-4-4-4" /><path d="M16.6 10H7.2" /></svg>)
const IconLock = () => (<svg {...ip} width={22} height={22}><rect x="4.5" y="8.5" width="11" height="8" rx="1.6" /><path d="M6.8 8.5V6a3.2 3.2 0 0 1 6.4 0v2.5" /></svg>)

const DISPLAY_FONT = "'Fraunces', Georgia, serif"
const BODY_FONT = "'Manrope', sans-serif"
const MONO_FONT = "'JetBrains Mono', monospace"

function Admin() {
  const { T, isDark, toggleTheme } = useTheme()
  const { tenant, loading: loadingTenant } = useTenant()
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabAdmin, setTabAdmin] = useState('programari')
  const [hoverLogout, setHoverLogout] = useState(false)
  const { frizer, isMaster, loading: loadingFrizer } = useFrizer()

  const [angajati, setAngajati] = useState([])
  const [selectedFrizerId, setSelectedFrizerId] = useState(null)

  // Ceas viu — leaga vizual dashboard-ul de identitatea "Timevia" (timp)
  const [acum, setAcum] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setAcum(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isMaster || !tenant?.id) return
    supabase
      .from('frizeri')
      .select('id, nume')
      .eq('tenant_id', tenant.id)
      .eq('activ', true)
      .order('nume')
      .then(({ data }) => {
        setAngajati(data || [])
        if (data && data.length > 0) setSelectedFrizerId(data[0].id)
      })
  }, [isMaster, tenant?.id])

  async function handleLogin() {
    setEroare(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: parola })
    if (error) setEroare('Email sau parola gresita.')
    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut() }

  const TABS_MASTER = [
    { key: 'programari', label: 'Programări', icon: IconCalendar },
    { key: 'programare_noua', label: 'Programare nouă', icon: IconCalendarPlus },
    { key: 'statistici', label: 'Statistici', icon: IconBars },
    { key: 'angajati', label: 'Angajați', icon: IconUsers },
    { key: 'zile', label: 'Zile blocate', icon: IconCalendarOff },
    { key: 'ore', label: 'Ore blocate', icon: IconClockOff },
    { key: 'orar', label: 'Orar', icon: IconClock },
    { key: 'servicii', label: 'Servicii', icon: IconTag },
  ]

  const TABS_ANGAJAT = [
    { key: 'programari', label: 'Programările mele', icon: IconCalendar },
    { key: 'programare_noua', label: 'Programare nouă', icon: IconCalendarPlus },
    { key: 'zile', label: 'Zile blocate', icon: IconCalendarOff },
    { key: 'ore', label: 'Ore blocate', icon: IconClockOff },
    { key: 'orar', label: 'Orar', icon: IconClock },
    { key: 'servicii', label: 'Servicii', icon: IconTag },
  ]

  if (loadingTenant) return (
    <>
      <GlobalStyles T={T} />
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontFamily: BODY_FONT }}>
        Se încarcă...
      </div>
    </>
  )

  if (!session) {
    const initiala = (tenant?.nume_afacere || 'Timevia').trim().charAt(0).toUpperCase()
    return (
      <>
        <GlobalStyles T={T} />
        <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: BODY_FONT }}>
          <div style={{ width: '100%', maxWidth: '400px', background: T.surface, border: `0.5px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: '18px', padding: '40px 32px', boxShadow: T.shadowCard, animation: 'tvFadeUp 0.35s ease', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: '#fff', fontFamily: DISPLAY_FONT, fontStyle: 'italic', fontWeight: 600, fontSize: '22px' }}>
                {initiala}
              </div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', fontFamily: DISPLAY_FONT, fontStyle: 'italic', color: T.text }}>
                {tenant?.nume_afacere || 'Timevia'}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: T.muted }}>Intră în contul tău</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input className="tv-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: '15px', fontFamily: BODY_FONT, transition: T.transition, outline: 'none', boxSizing: 'border-box' }} />
              <input className="tv-input" type="password" placeholder="Parolă" value={parola} onChange={e => setParola(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ padding: '12px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: '15px', fontFamily: BODY_FONT, transition: T.transition, outline: 'none', boxSizing: 'border-box' }} />
              {eroare && <p style={{ margin: 0, fontSize: '13px', color: T.danger, background: T.dangerSoft, padding: '10px 14px', borderRadius: '10px' }}>{eroare}</p>}
              <button onClick={handleLogin} disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', background: T.accent, color: '#fff', fontSize: '15px', fontFamily: BODY_FONT, fontWeight: '700', cursor: loading ? 'wait' : 'pointer', marginTop: '4px', transition: T.transition }}>
                {loading ? 'Se conectează...' : 'Intră în cont'}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (loadingFrizer) return (
    <>
      <GlobalStyles T={T} />
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontFamily: BODY_FONT }}>
        Se încarcă...
      </div>
    </>
  )

  const TABS = isMaster ? TABS_MASTER : TABS_ANGAJAT
  const frizer_id_activ = isMaster ? selectedFrizerId : frizer?.id
  const tabCuSelector = ['orar', 'zile', 'ore'].includes(tabAdmin)

  // Panglica vie: cat din "ziua de lucru" generica (08:00-20:00) a trecut
  const nowMin = acum.getHours() * 60 + acum.getMinutes()
  const zStart = 8 * 60, zEnd = 20 * 60
  const pctZi = Math.min(100, Math.max(0, Math.round(((nowMin - zStart) / (zEnd - zStart)) * 100)))
  const labelZi = nowMin < zStart ? 'Ziua începe la 08:00' : nowMin > zEnd ? 'Ziua s-a încheiat' : `Ziua e ${pctZi}% parcursă`
  const oraAfisata = acum.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  const TEAL = '#2DD4BF'
  const TEAL_DEEP = isDark ? '#12665F' : '#0E7C74'

  function SelectorAngajat() {
    if (!isMaster || !tabCuSelector) return null
    if (angajati.length === 0) return (
      <p style={{ fontSize: '13px', color: T.muted, marginBottom: '16px' }}>Nu există angajați activi în acest tenant.</p>
    )
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: BODY_FONT }}>Angajat</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {angajati.map(a => {
            const activ = selectedFrizerId === a.id
            return (
              <button
                key={a.id}
                className="tv-chip"
                onClick={() => setSelectedFrizerId(a.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `0.5px solid ${activ ? T.accent : T.border}`,
                  background: activ ? T.accent : T.surface2,
                  color: activ ? '#fff' : T.muted,
                  fontSize: '13px',
                  fontFamily: BODY_FONT,
                  fontWeight: activ ? '700' : '500',
                  cursor: 'pointer',
                  transition: T.transition,
                }}
              >
                {a.nume}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: 'clamp(12px, 4vw, 32px) clamp(10px, 3vw, 20px)', boxSizing: 'border-box', overflowX: 'hidden', fontFamily: BODY_FONT }}>
      <GlobalStyles T={T} />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ---- Bloc unificat: header + panglica timp + tab-uri ---- */}
        <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', boxShadow: T.shadowCard, marginBottom: '16px', overflow: 'hidden', boxSizing: 'border-box' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 12px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '600', fontFamily: DISPLAY_FONT, fontStyle: 'italic', color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isMaster ? (tenant?.nume_afacere || 'Dashboard') : `Bună, ${frizer?.nume || 'angajat'}`}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: T.muted, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{session.user.email}</span>
                {isMaster && (
                  <span style={{ fontSize: '10px', background: TEAL_DEEP, color: '#fff', padding: '2px 8px', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                    MASTER
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{ fontFamily: MONO_FONT, fontSize: '13px', color: T.muted, background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '8px', padding: '7px 10px', lineHeight: 1 }}>
                {oraAfisata}
              </span>
              <button className="tv-iconbtn" onClick={toggleTheme} title={isDark ? 'Mod luminos' : 'Mod întunecat'} aria-label="Schimbă tema" style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted, transition: T.transition }}>
                {isDark ? <IconSun /> : <IconMoon />}
              </button>
              <button className="tv-iconbtn" onClick={handleLogout} onMouseEnter={() => setHoverLogout(true)} onMouseLeave={() => setHoverLogout(false)} aria-label="Ieși din cont" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', border: `0.5px solid ${hoverLogout ? T.danger : T.border}`, background: hoverLogout ? T.dangerSoft : T.surface2, color: hoverLogout ? T.danger : T.muted, cursor: 'pointer', fontSize: '12px', fontFamily: BODY_FONT, fontWeight: '600', transition: T.transition }}>
                <IconLogOut /> Ieși
              </button>
            </div>
          </div>

          {/* Panglica timp — semnatura vizuala: cat din ziua de lucru a trecut */}
          <div style={{ padding: '0 18px 14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: T.muted, fontFamily: BODY_FONT }}>{labelZi}</span>
              <span style={{ fontSize: '11px', color: TEAL_DEEP, fontFamily: MONO_FONT, fontWeight: '600' }}>{pctZi}%</span>
            </div>
            <div style={{ position: 'relative', height: '4px', borderRadius: '4px', background: T.surface2, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pctZi}%`, background: TEAL, borderRadius: '4px', transition: 'width 0.4s ease' }} />
              {pctZi > 0 && pctZi < 100 && (
                <div style={{ position: 'absolute', top: '-2px', left: `calc(${pctZi}% - 4px)`, width: '8px', height: '8px', borderRadius: '50%', background: TEAL, boxShadow: `0 0 0 3px ${T.surface}`, animation: 'tvPulse 2.4s ease-in-out infinite' }} />
              )}
            </div>
          </div>

          {/* Tab-uri — underline, iconite SVG, scroll orizontal pe mobil */}
          <div className="tv-scrollx" style={{ overflowX: 'auto', borderTop: `0.5px solid ${T.border}`, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', gap: '2px', padding: '0 12px', width: 'max-content' }}>
              {TABS.map(tab => {
                const activ = tabAdmin === tab.key
                const Ic = tab.icon
                return (
                  <button
                    key={tab.key}
                    className="tv-tab"
                    onClick={() => setTabAdmin(tab.key)}
                    aria-current={activ ? 'page' : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '11px 14px', border: 'none', background: 'transparent',
                      borderBottom: `2px solid ${activ ? T.accent : 'transparent'}`,
                      color: activ ? T.accent : T.muted,
                      fontSize: '13px', fontFamily: BODY_FONT, fontWeight: activ ? '700' : '500',
                      cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                      transition: T.transition, marginBottom: '-0.5px',
                    }}
                  >
                    <Ic /> {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Continut */}
        <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: T.shadowCard, boxSizing: 'border-box', overflowX: 'hidden' }}>
          <SelectorAngajat />
          {tabAdmin === 'programari' && <AdminPanel isMaster={isMaster} frizerId={frizer?.id} frizer={frizer} tenantId={tenant?.id} />}
          {tabAdmin === 'programare_noua' && <FaOProgramare />}
          {tabAdmin === 'statistici' && isMaster && <Statistici tenantId={tenant?.id} />}
          {tabAdmin === 'angajati' && isMaster && <GestionareFrizeri isMaster={isMaster} tenantId={tenant?.id} />}
          {tabAdmin === 'zile' && frizer_id_activ && <ZileBlocate frizerId={frizer_id_activ} />}
          {tabAdmin === 'ore' && frizer_id_activ && <OreBlocate frizerId={frizer_id_activ} />}
          {tabAdmin === 'orar' && frizer_id_activ && <OrarSaptamanal frizerId={frizer_id_activ} />}
          {tabAdmin === 'servicii' && <GestionareServicii isMaster={isMaster} tenantId={tenant?.id} />}
        </div>

      </div>
    </div>
  )
}

export default Admin