import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../hooks/useTenant'
import { useFrizer } from '../hooks/useFrizer'
import { useTheme } from '../context/ThemeContext'

function calculeazaOraSfarsit(oraStart, durataMinute) {
  const [h, m] = oraStart.split(':').map(Number)
  const start = new Date(2000, 0, 1, h, m)
  const sfarsit = new Date(start.getTime() + durataMinute * 60000)
  const hh = String(sfarsit.getHours()).padStart(2, '0')
  const mm = String(sfarsit.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default function FaOProgramare() {
  const { theme } = useTheme()
  const { tenant } = useTenant()
  const { frizer } = useFrizer()

  const [servicii, setServicii] = useState([])
  const [selectate, setSelectate] = useState([])
  const [numeClient, setNumeClient] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [data, setData] = useState('')
  const [oraStart, setOraStart] = useState('')
  const [durata, setDurata] = useState('')
  const [saving, setSaving] = useState(false)
  const [mesaj, setMesaj] = useState(null)

  useEffect(() => {
    if (!tenant?.id) return
    supabase
      .from('servicii')
      .select('id, nume')
      .eq('tenant_id', tenant.id)
      .eq('activ', true)
      .order('ordine', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setServicii(data || [])
      })
  }, [tenant?.id])

  function toggleServiciu(id) {
    setSelectate((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function resetForm() {
    setNumeClient('')
    setTelefon('')
    setEmail('')
    setData('')
    setOraStart('')
    setDurata('')
    setSelectate([])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMesaj(null)

    if (!numeClient || !telefon || !data || !oraStart || !durata) {
      setMesaj({ tip: 'eroare', text: 'Completează toate câmpurile obligatorii.' })
      return
    }
    if (selectate.length === 0) {
      setMesaj({ tip: 'eroare', text: 'Selectează cel puțin un serviciu.' })
      return
    }
    if (!frizer?.id) {
      setMesaj({ tip: 'eroare', text: 'Nu s-a putut identifica angajatul logat.' })
      return
    }

    setSaving(true)
    try {
      const durataNum = parseInt(durata, 10)
      const oraSfarsit = calculeazaOraSfarsit(oraStart, durataNum)
      const cancelToken = crypto.randomUUID()

      const { data: programare, error: errProgramare } = await supabase
        .from('programari')
        .insert({
          frizer_id: frizer.id,
          nume_client: numeClient,
          telefon,
          email: email || null,
          data_programare: data,
          ora_start: oraStart,
          ora_sfarsit: oraSfarsit,
          durata_totala: durataNum,
          status: 'confirmata',
          cancel_token: cancelToken,
        })
        .select()
        .single()

      if (errProgramare) throw errProgramare

      const rows = selectate.map((serviciuId) => ({
        programare_id: programare.id,
        serviciu_id: serviciuId,
      }))

      const { error: errServicii } = await supabase
        .from('programari_servicii')
        .insert(rows)

      if (errServicii) throw errServicii

      setMesaj({ tip: 'succes', text: 'Programare adăugată cu succes!' })
      resetForm()
    } catch (err) {
      console.error(err)
      setMesaj({ tip: 'eroare', text: 'A apărut o eroare la salvare. Încearcă din nou.' })
    } finally {
      setSaving(false)
    }
  }

  const styles = {
    container: {
      maxWidth: 480,
      margin: '0 auto',
      padding: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 16,
      color: theme.text,
    },
    label: {
      display: 'block',
      fontSize: 14,
      marginBottom: 6,
      marginTop: 14,
      color: theme.text,
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 8,
      border: `1px solid ${theme.border || '#ccc'}`,
      background: theme.inputBackground || theme.background,
      color: theme.text,
      fontSize: 14,
    },
    serviciiBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8,
      padding: 12,
      borderRadius: 8,
      border: `1px solid ${theme.border || '#ccc'}`,
    },
    serviciuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 14,
      color: theme.text,
    },
    button: {
      marginTop: 20,
      width: '100%',
      padding: '12px',
      borderRadius: 8,
      border: 'none',
      background: theme.primary || '#4F6BF0',
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      cursor: saving ? 'not-allowed' : 'pointer',
      opacity: saving ? 0.6 : 1,
    },
    mesaj: (tip) => ({
      marginTop: 14,
      padding: '10px 12px',
      borderRadius: 8,
      fontSize: 14,
      background: tip === 'succes' ? '#d4f7dc' : '#f8d7da',
      color: tip === 'succes' ? '#1a7a34' : '#a12631',
    }),
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Fă o programare</div>

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Nume client *</label>
        <input
          style={styles.input}
          value={numeClient}
          onChange={(e) => setNumeClient(e.target.value)}
          placeholder="Ex: Maria Popescu"
        />

        <label style={styles.label}>Telefon *</label>
        <input
          style={styles.input}
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          placeholder="Ex: 07xx xxx xxx"
        />

        <label style={styles.label}>Email (opțional)</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: client@email.com"
        />

        <label style={styles.label}>Dată *</label>
        <input
          style={styles.input}
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <label style={styles.label}>Ora start *</label>
        <input
          style={styles.input}
          type="time"
          value={oraStart}
          onChange={(e) => setOraStart(e.target.value)}
        />

        <label style={styles.label}>Durată (minute) *</label>
        <input
          style={styles.input}
          type="number"
          min="1"
          value={durata}
          onChange={(e) => setDurata(e.target.value)}
          placeholder="Ex: 45"
        />

        <label style={styles.label}>Servicii *</label>
        <div style={styles.serviciiBox}>
          {servicii.length === 0 && (
            <span style={{ fontSize: 13, opacity: 0.7, color: theme.text }}>
              Nu există servicii configurate.
            </span>
          )}
          {servicii.map((s) => (
            <label key={s.id} style={styles.serviciuItem}>
              <input
                type="checkbox"
                checked={selectate.includes(s.id)}
                onChange={() => toggleServiciu(s.id)}
              />
              {s.nume}
            </label>
          ))}
        </div>

        <button type="submit" style={styles.button} disabled={saving}>
          {saving ? 'Se salvează...' : 'Salvează programarea'}
        </button>

        {mesaj && <div style={styles.mesaj(mesaj.tip)}>{mesaj.text}</div>}
      </form>
    </div>
  )
}