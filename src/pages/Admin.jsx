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

  // Selector angajat pentru master (orar / zile / ore)
  const [angajati, setAngajati] = useState([])
  const [selectedFrizerId, setSelectedFrizerId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  // Fetch angajați când e master și avem tenantId
  useEffect(() => {
    if (!isMaster || !tenant?.id) return
    supabase
      .from('frizeri')
      .select('id, nume')
      .eq('tenant_id', tenant.id)
      .eq('activ', true)
      .eq('is_master', false)
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
    { key: 'programari', label: 'Programari' },
    { key: 'programare_noua', label: 'Fa o programare' },
    { key: 'statistici', label: 'Statistici' },
    { key: 'angajati', label: 'Angajati' },
    { key: 'zile', label: 'Zile blocate' },
    { key: 'ore', label: 'Ore blocate' },
    { key: 'orar', label: 'Orar' },
    { key: 'servicii', label: 'Servicii' },
  ]

  const TABS_ANGAJAT = [
    { key: 'programari', label: 'Programarile mele' },
    { key: 'programare_noua', label: 'Fa o programare' },
    { key: 'zile', label: 'Zile blocate' },
    { key: 'ore', label: 'Ore blocate' },
    { key: 'orar', label: 'Orar' },
    { key: 'servicii', label: 'Servicii' },
  ]

  if (loadingTenant) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
      Se incarca...
    </div>
  )

  if (!session) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .planora-input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft} !important; outline: none; }
      `}</style>
      <div style={{ width: '100%', maxWidth: '400px', background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '20px', padding: '40px 32px', boxShadow: T.shadowCard, animation: 'fadeUp 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', boxShadow: T.shadow }}>🔐</div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: T.text }}>
            {tenant?.nume_afacere || 'Timevia'}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: T.muted }}>Intra in contul tau</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input className="planora-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: '15px', transition: T.transition, outline: 'none' }} />
          <input className="planora-input" type="password" placeholder="Parola" value={parola} onChange={e => setParola(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ padding: '12px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: '15px', transition: T.transition, outline: 'none' }} />
          {eroare && <p style={{ margin: 0, fontSize: '13px', color: T.danger, background: T.dangerSoft, padding: '10px 14px', borderRadius: '10px' }}>{eroare}</p>}
          <button onClick={handleLogin} disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '15px', cursor: loading ? 'wait' : 'pointer', fontWeight: '600', marginTop: '4px', transition: T.transition, boxShadow: T.shadow }}>
            {loading ? 'Se conecteaza...' : 'Intra in cont'}
          </button>
        </div>
      </div>
    </div>
  )

  if (loadingFrizer) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
      Se incarca...
    </div>
  )

  const TABS = isMaster ? TABS_MASTER : TABS_ANGAJAT

  // frizerId-ul efectiv folosit pentru orar/zile/ore
  const frizer_id_activ = isMaster ? selectedFrizerId : frizer?.id

  // Selector angajat (doar master, doar pe tab-urile relevante)
  const tabCuSelector = ['orar', 'zile', 'ore'].includes(tabAdmin)

  function SelectorAngajat() {
    if (!isMaster || !tabCuSelector) return null
    if (angajati.length === 0) return (
      <p style={{ fontSize: '13px', color: T.muted, marginBottom: '16px' }}>Nu exista angajati activi in acest tenant.</p>
    )
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Angajat:</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {angajati.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedFrizerId(a.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: `0.5px solid ${selectedFrizerId === a.id ? T.accent : T.border}`,
                background: selectedFrizerId === a.id ? `linear-gradient(135deg, ${T.accent}, #3a56d4)` : T.surface2,
                color: selectedFrizerId === a.id ? '#fff' : T.muted,
                fontSize: '13px',
                fontWeight: selectedFrizerId === a.id ? '600' : '400',
                cursor: 'pointer',
                transition: T.transition,
              }}
            >
              {a.nume}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '16px 24px', boxShadow: T.shadowCard }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: T.text }}>
              {isMaster ? `Dashboard — ${tenant?.nume_afacere || 'Admin'}` : `Buna, ${frizer?.nume || 'Angajat'}!`}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>
              {session.user.email}
              {isMaster && (
                <span style={{ marginLeft: '8px', fontSize: '11px', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                  Master
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={toggleTheme} title={isDark ? 'Mod luminos' : 'Mod întunecat'} style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontSize: '16px', color: T.muted, transition: T.transition }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} onMouseEnter={() => setHoverLogout(true)} onMouseLeave={() => setHoverLogout(false)} style={{ padding: '8px 16px', borderRadius: '10px', border: `0.5px solid ${hoverLogout ? T.danger : T.border}`, background: hoverLogout ? T.dangerSoft : T.surface2, color: hoverLogout ? T.danger : T.muted, cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: T.transition }}>
              Deconectare
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '14px', padding: '8px', boxShadow: T.shadowCard }}>
          {TABS.map(tab => {
            const activ = tabAdmin === tab.key
            return (
              <button key={tab.key} onClick={() => setTabAdmin(tab.key)} style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activ ? '600' : '400', background: activ ? `linear-gradient(135deg, ${T.accent}, #3a56d4)` : 'transparent', color: activ ? '#fff' : T.muted, transition: T.transition, boxShadow: activ ? T.shadow : 'none' }}>
                {tab.label}
              </button>
            )
          })}
        </div>

        <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadowCard }}>
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