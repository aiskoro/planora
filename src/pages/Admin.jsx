import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminPanel from '../components/AdminPanel'
import ZileBlocate from '../components/ZileBlocate'
import OrarSaptamanal from '../components/OrarSaptamanal'
import GestionareServicii from '../components/GestionareServicii'

function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [eroare, setEroare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tabAdmin, setTabAdmin] = useState('programari')

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
    if (error) setEroare('Email sau parolă greșită.')
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const stilTab = (activ) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activ ? 'bold' : 'normal',
    backgroundColor: activ ? '#4F46E5' : '#f3f4f6',
    color: activ ? '#fff' : '#555',
  })

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '0 20px' }}>
        <h2>Admin — Planora</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
          />
          <input
            type="password"
            placeholder="Parolă"
            value={parola}
            onChange={e => setParola(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
          />
          {eroare && (
            <p style={{ color: '#ef4444', margin: 0 }}>{eroare}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4F46E5',
              color: '#fff',
              fontSize: '16px',
              cursor: loading ? 'wait' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Se conectează...' : 'Intră în cont'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Dashboard Admin</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Deconectare
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <button style={stilTab(tabAdmin === 'programari')} onClick={() => setTabAdmin('programari')}>
          Programări
        </button>
        <button style={stilTab(tabAdmin === 'zile')} onClick={() => setTabAdmin('zile')}>
          Zile blocate
        </button>
        <button style={stilTab(tabAdmin === 'orar')} onClick={() => setTabAdmin('orar')}>
          Orar
        </button>
        <button style={stilTab(tabAdmin === 'servicii')} onClick={() => setTabAdmin('servicii')}>
          Servicii
        </button>
      </div>

      {tabAdmin === 'programari' && <AdminPanel />}
      {tabAdmin === 'zile' && <ZileBlocate />}
      {tabAdmin === 'orar' && <OrarSaptamanal />}
      {tabAdmin === 'servicii' && <GestionareServicii />}
    </div>
  )
}

export default Admin