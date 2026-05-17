import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useFrizer } from '../hooks/useFrizer'
import AdminPanel from '../components/AdminPanel'
import ZileBlocate from '../components/ZileBlocate'
import OrarSaptamanal from '../components/OrarSaptamanal'
import GestionareServicii from '../components/GestionareServicii'
import OreBlocate from '../components/OreBlocate'
import GestionareFrizeri from '../components/GestionareFrizeri'
import { T } from '../styles/theme'

function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabAdmin, setTabAdmin] = useState('programari')
  const [hoverLogout, setHoverLogout] = useState(false)
  const { frizer, isMaster, loading: loadingFrizer } = useFrizer()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogin() {
    setEroare(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: parola })
    if (error) setEroare('Email sau parola gresita.')
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const TABS_MASTER = [
    { key: 'programari', label: 'Programari' },
    { key: 'frizeri', label: 'Frizeri' },
    { key: 'zile', label: 'Zile blocate' },
    { key: 'ore', label: 'Ore blocate' },
    { key: 'orar', label: 'Orar' },
    { key: 'servicii', label: 'Servicii' },
  ]

  const TABS_FRIZER = [
    { key: 'programari', label: 'Programarile mele' },
    { key: 'zile', label: 'Zile blocate' },
    { key: 'ore', label: 'Ore blocate' },
    { key: 'orar', label: 'Orar' },
    { key: 'servicii', label: 'Servicii' },
  ]

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .planora-input:focus {
            border-color: ${T.accent} !important;
            box-shadow: 0 0 0 3px ${T.accentSoft} !important;
            outline: none;
          }
        `}</style>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: T.shadowCard,
          animation: 'fadeUp 0.3s ease',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
              boxShadow: T.shadow,
            }}>
              🔐
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: T.text }}>
              Admin Timevia
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: T.muted }}>
              Intra in contul tau
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              className="planora-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: `0.5px solid ${T.border}`,
                background: T.surface2,
                color: T.text,
                fontSize: '15px',
                transition: T.transition,
              }}
            />
            <input
              className="planora-input"
              type="password"
              placeholder="Parola"
              value={parola}
              onChange={e => setParola(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: `0.5px solid ${T.border}`,
                background: T.surface2,
                color: T.text,
                fontSize: '15px',
                transition: T.transition,
              }}
            />
            {eroare && (
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: T.danger,
                background: T.dangerSoft,
                padding: '10px 14px',
                borderRadius: '10px',
              }}>
                {eroare}
              </p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
                color: '#fff',
                fontSize: '15px',
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: '600',
                marginTop: '4px',
                transition: T.transition,
                boxShadow: T.shadow,
              }}
            >
              {loading ? 'Se conecteaza...' : 'Intra in cont'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loadingFrizer) return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: T.muted,
    }}>
      Se incarca...
    </div>
  )

  const TABS = isMaster ? TABS_MASTER : TABS_FRIZER

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '32px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '16px',
          padding: '16px 24px',
          boxShadow: T.shadowCard,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: T.text }}>
              {isMaster ? 'Dashboard Admin' : `Buna, ${frizer?.nume || 'Frizer'}!`}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>
              {session.user.email}
              {isMaster && (
                <span style={{
                  marginLeft: '8px',
                  fontSize: '11px',
                  background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontWeight: '600',
                }}>
                  Master
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoverLogout(true)}
            onMouseLeave={() => setHoverLogout(false)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: `0.5px solid ${hoverLogout ? T.danger : T.border}`,
              background: hoverLogout ? T.dangerSoft : T.surface2,
              color: hoverLogout ? T.danger : T.muted,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: T.transition,
            }}
          >
            Deconectare
          </button>
        </div>

        {/* Tab-uri */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '14px',
          padding: '8px',
          boxShadow: T.shadowCard,
        }}>
          {TABS.map(tab => {
            const activ = tabAdmin === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setTabAdmin(tab.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activ ? '600' : '400',
                  background: activ ? `linear-gradient(135deg, ${T.accent}, #3a56d4)` : 'transparent',
                  color: activ ? '#fff' : T.muted,
                  transition: T.transition,
                  boxShadow: activ ? T.shadow : 'none',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Continut */}
        <div style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: T.shadowCard,
        }}>
        {tabAdmin === 'programari' && <AdminPanel isMaster={isMaster} frizerId={frizer?.id} frizer={frizer} />}
          {tabAdmin === 'frizeri' && isMaster && <GestionareFrizeri isMaster={isMaster} />}
          {tabAdmin === 'zile' && <ZileBlocate frizerId={frizer?.id} />}
          {tabAdmin === 'ore' && <OreBlocate frizerId={frizer?.id} />}
          {tabAdmin === 'orar' && <OrarSaptamanal frizerId={frizer?.id} />}
          {tabAdmin === 'servicii' && <GestionareServicii isMaster={isMaster} />}
        </div>

      </div>
    </div>
  )
}

export default Admin