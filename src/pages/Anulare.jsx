import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Anulare() {
  const { token } = useParams()
  const [programare, setProgramare] = useState(null)
  const [stare, setStare] = useState('incarcare')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function incarcaProgramare() {
      const { data, error } = await supabase
        .from('programari')
        .select('*')
        .eq('cancel_token', token)
        .single()
      if (error || !data) { setStare('inexistenta'); return }
      if (data.status === 'anulata') { setProgramare(data); setStare('anulata'); return }
      const acum = new Date()
      const dataProgramare = new Date(data.data_programare + 'T' + data.ora_start)
      const diferentaMinute = (dataProgramare - acum) / 1000 / 60
      if (diferentaMinute < 120) { setProgramare(data); setStare('expirata'); return }
      setProgramare(data)
      setStare('confirmare')
    }
    incarcaProgramare()
  }, [token])

  async function handleAnulare() {
    setLoading(true)
    const { error } = await supabase
      .from('programari')
      .update({ status: 'anulata' })
      .eq('cancel_token', token)
    setStare(error ? 'eroare' : 'anulata')
    setLoading(false)
  }

  const box = {
    maxWidth: '480px',
    margin: '60px auto',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  }

  const btnRed = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'wait' : 'pointer',
  }

  const btnGray = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
  }

  if (stare === 'incarcare') return <div style={box}><p>Se incarca...</p></div>

  if (stare === 'inexistenta') return (
    <div style={box}>
      <h2 style={{ color: '#ef4444' }}>Link invalid</h2>
      <p style={{ color: '#666' }}>Acest link nu este valid sau a expirat.</p>
    </div>
  )

  if (stare === 'expirata') return (
    <div style={box}>
      <h2 style={{ color: '#f59e0b' }}>Termen depasit</h2>
      <p style={{ color: '#666' }}>
        Programarea din <strong>{programare.data_programare}</strong> la ora <strong>{programare.ora_start.slice(0, 5)}</strong> nu mai poate fi anulata online.
        Anularea este posibila doar cu cel putin 2 ore inainte.
      </p>
      <p style={{ color: '#666' }}>Te rugam sa ne contactezi direct.</p>
    </div>
  )

  if (stare === 'anulata') return (
    <div style={box}>
      <h2 style={{ color: '#22c55e' }}>Programare anulata</h2>
      <p style={{ color: '#666' }}>
        Programarea din <strong>{programare.data_programare}</strong> la ora <strong>{programare.ora_start.slice(0, 5)}</strong> a fost anulata cu succes.
      </p>
      <a href="/" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 'bold' }}>Fa o programare noua</a>
    </div>
  )

  if (stare === 'eroare') return (
    <div style={box}>
      <h2 style={{ color: '#ef4444' }}>Eroare</h2>
      <p style={{ color: '#666' }}>A aparut o eroare. Te rugam sa incerci din nou.</p>
    </div>
  )

  return (
    <div style={box}>
      <h2 style={{ marginBottom: '8px' }}>Anulare programare</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Esti sigur ca vrei sa anulezi programarea din <strong>{programare.data_programare}</strong> la ora <strong>{programare.ora_start.slice(0, 5)}</strong>?
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={handleAnulare} disabled={loading} style={btnRed}>
          {loading ? 'Se proceseaza...' : 'Da, anuleaza'}
        </button>
        <a href="/" style={btnGray}>Nu, pastreaza</a>
      </div>
    </div>
  )
}

export default Anulare