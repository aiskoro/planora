import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Anulare() {
  const { token } = useParams()
  const [programare, setProgramare] = useState(null)
  const [stare, setStare] = useState('incarcare') // incarcare | confirmare | anulata | eroare | expirata | inexistenta
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function incarcaProgramare() {
      const { data, error } = await supabase
        .from('programari')
        .select('*')
        .eq('cancel_token', token)
        .single()

      if (error || !data) {
        setStare('inexistenta')
        return
      }

      if (data.status === 'anulata') {
        setStare('anulata')
        setProgramare(data)
        return
      }

      // Verificare 2h înainte
      const acum = new Date()
      const dataProgramare = new Date(`${data.data_programare}T${data.ora_start}`)
      const diferentaMinute = (dataProgramare - acum) / 1000 / 60

      if (diferentaMinute < 120) {
        setStare('expirata')
        setProgramare(data)
        return
      }

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

    if (error) {
      setStare('eroare')
    } else {
      setStare('anulata')
    }

    setLoading(false)
  }

  const stilContainer = {
    maxWidth: '480px',
    margin: '60px auto',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  }

  if (stare === 'incarcare') {
    return (
      <div style={stilContainer}>
        <p style={{ color: '#666' }}>Se încarcă...</p>
      </div>
    )
  }

  if (stare === 'inexistenta') {
    return (
      <div style={stilContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: '#ef4444' }}>Link invalid</h2>
        <p style={{ color: '#666' }}>Acest link de anulare nu este valid sau a expirat.</p>
      </div>
    )
  }

  if (stare === 'expirata') {
    return (
      <div style={stilContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
        <h2 style={{ color: '#f59e0b' }}>Termen depășit</h2>
        <p style={{ color: '#666' }}>
          Programarea din <strong>{programare.data_programare}</strong> la ora <strong>{programare.ora_start.slice(0, 5)}</strong> nu
          mai poate fi anulată online. Anularea este posibilă doar cu cel puțin 2 ore înainte.
        </p>
        <p style={{ color: '#666' }}>Te rugăm să ne contactezi direct.</p>
      </div>
    )
  }

  if (stare === 'anulata') {
    return (
      <div style={stilContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ color: '#22c55e' }}>Programare anulată</h2>
        <p style={{ color: '#666' }}>
          Programarea din <strong>{programare.data_programare}</strong> la ora <strong>{programare.ora_start.slice(0, 5)}</strong> a
          fost anulată cu succes.
        </p>
        <a href="/" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 'bold' }}>
          Fă o programare nouă &#8594;
        </a>
      </div>
    )
  }

  if (stare === 'eroare') {
    return (
      <div style={stilContainer}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#ef4444' }}>Eroare</h2>
        <p style={{ color: '#666' }}>A apărut o eroare. Te rugăm să încerci din nou.</p>
      </div>
    )
  }

  // stare === 'confirmare'
  return (
    <div style={stilContainer}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✂️</div>
      <h2 style={{ marginBottom: '8px' }}>Anulare programare</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Ești sigur că vrei să anulezi programarea din{' '}
        <strong>{programare.data_programare}</strong> la ora{' '}
        <strong>{programare.ora_start.slice(0, 5)}</strong>?
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleAnulare}
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Se procesează...' : 'Da, anulează'}
        </button>

        
          href="/"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: '#fff',
            color: '#333',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Nu, păstrează
        </a>
      </div>
    </div>
  )
}

export default Anulare