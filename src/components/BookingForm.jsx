import { useState } from 'react'
import { supabase } from '../lib/supabase'

function BookingForm({ serviciiSelectate, dataSelectata, oraSelectata, durataTotala, onSuccess }) {
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erori, setErori] = useState({ nume: false, telefon: false })
  const [eroareGenerala, setEroareGenerala] = useState(null)

  function valideazaNume(val) {
    return val.trim().length >= 3 && /^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/.test(val.trim())
  }

  function valideazaTelefon(val) {
    return /^07[0-9]{8}$/.test(val.trim())
  }

  function calculeazaOraStop(oraStart, durata) {
    const [h, m] = oraStart.split(':').map(Number)
    const total = h * 60 + m + durata
    const hStop = Math.floor(total / 60).toString().padStart(2, '0')
    const mStop = (total % 60).toString().padStart(2, '0')
    return `${hStop}:${mStop}`
  }

  async function handleSubmit() {
    const numeOk = valideazaNume(nume)
    const telefonOk = valideazaTelefon(telefon)

    setErori({ nume: !numeOk, telefon: !telefonOk })
    setEroareGenerala(null)
    if (!numeOk || !telefonOk) return

    setLoading(true)

    // Verificam daca exista programare viitoare pe acelasi telefon
    const azi = new Date().toISOString().split('T')[0]
    const { data: existente } = await supabase
      .from('programari')
      .select('id')
      .eq('telefon', telefon.trim())
      .gte('data_programare', azi)

    if (existente && existente.length > 0) {
      setEroareGenerala('Există deja o programare activă pe acest număr de telefon. Te rugăm să ne contactezi pentru modificări.')
      setLoading(false)
      return
    }

    const oraStop = calculeazaOraStop(oraSelectata, durataTotala)

    const { data: programare, error } = await supabase
      .from('programari')
      .insert({
        nume_client: nume.trim(),
        telefon: telefon.trim(),
        email: email.trim() || null,
        data_programare: dataSelectata,
        ora_start: oraSelectata,
        ora_sfarsit: oraStop,
        durata_totala: durataTotala,
      })
      .select()
      .single()

    if (error) {
      setEroareGenerala('A apărut o eroare. Încearcă din nou.')
      setLoading(false)
      return
    }

    const legaturi = serviciiSelectate.map(s => ({
      programare_id: programare.id,
      serviciu_id: s.id,
    }))

    await supabase.from('programari_servicii').insert(legaturi)
if (email.trim()) {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nume: nume.trim(),
      email: email.trim(),
      data: dataSelectata,
      ora: oraSelectata,
      servicii: serviciiSelectate.map(s => s.nume).join(', '),
      durata: durataTotala,
    }),
  })
}
    setLoading(false)
    onSuccess()
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>Datele tale</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            placeholder="Nume complet"
            value={nume}
            onChange={e => {
              setNume(e.target.value)
              setErori(prev => ({ ...prev, nume: false }))
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${erori.nume ? '#ef4444' : '#ddd'}`,
              fontSize: '16px'
            }}
          />
          <p style={{ margin: 0, fontSize: '13px', color: erori.nume ? '#ef4444' : '#999' }}>
            Minim 3 litere, doar caractere alfabetice
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="tel"
            placeholder="Număr de telefon"
            value={telefon}
            onChange={e => {
              setTelefon(e.target.value)
              setErori(prev => ({ ...prev, telefon: false }))
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${erori.telefon ? '#ef4444' : '#ddd'}`,
              fontSize: '16px'
            }}
          />
          <p style={{ margin: 0, fontSize: '13px', color: erori.telefon ? '#ef4444' : '#999' }}>
            Introdu numărul sub forma 07XXXXXXXX (10 cifre, fără spații)
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="email"
            placeholder="Adresă de email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
          <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
            Te vom ține la curent cu statusul programării (opțional)
          </p>
        </div>

        {eroareGenerala && (
          <p style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>{eroareGenerala}</p>
        )}

        <button
          onClick={handleSubmit}
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
          {loading ? 'Se trimite...' : 'Confirmă programarea'}
        </button>

      </div>
    </div>
  )
}

export default BookingForm