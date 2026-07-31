import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../hooks/useTenant'
import { useFrizer } from '../hooks/useFrizer'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

function calculeazaOraSfarsit(oraStart, durataMinute) {
  const [h, m] = oraStart.split(':').map(Number)
  const start = new Date(2000, 0, 1, h, m)
  const sfarsit = new Date(start.getTime() + durataMinute * 60000)
  const hh = String(sfarsit.getHours()).padStart(2, '0')
  const mm = String(sfarsit.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default function FaOProgramare() {
  const { T } = useTheme()
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

    if (!numeClient || !data || !oraStart || !durata) {
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
          telefon: telefon || null,
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

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `0.5px solid ${T.border}`,
    background: T.surface2,
    color: T.text,
    fontSize: '15px',
    outline: 'none',
    transition: T.transition,
    boxSizing: 'border-box',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
    marginTop: '14px',
    color: T.muted,
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: T.text }}>
        Fă o programare
      </h3>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nume client *</label>
        <input
          style={inputStyle}
          value={numeClient}
          onChange={(e) => setNumeClient(e.target.value)}
          placeholder="Ex: Maria Popescu"
        />

        <label style={labelStyle}>Telefon (opțional)</label>
        <input
          style={inputStyle}
          value={telefon}
          onChange={(e) => setTelefon(e.target.value)}
          placeholder="Ex: 07xx xxx xxx"
        />

        <label style={labelStyle}>Email (opțional)</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: client@email.com"
        />

        <label style={labelStyle}>Dată *</label>
        <input
          style={inputStyle}
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <label style={labelStyle}>Ora start *</label>
        <SelectOra
          style={inputStyle}
          value={oraStart}
          onChange={(val) => setOraStart(val)}
        />

        <label style={labelStyle}>Durată (minute) *</label>
        <input
          style={inputStyle}
          type="number"
          min="1"
          value={durata}
          onChange={(e) => setDurata(e.target.value)}
          placeholder="Ex: 45"
        />

        <label style={labelStyle}>Servicii *</label>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '4px',
            padding: '14px',
            borderRadius: '10px',
            border: `0.5px solid ${T.border}`,
            background: T.surface2,
          }}
        >
          {servicii.length === 0 && (
            <span style={{ fontSize: '13px', color: T.muted }}>
              Nu există servicii configurate.
            </span>
          )}
          {servicii.map((s) => (
            <label
              key={s.id}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: T.text, cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={selectate.includes(s.id)}
                onChange={() => toggleServiciu(s.id)}
              />
              {s.nume}
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '13px',
            borderRadius: '10px',
            border: 'none',
            background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            cursor: saving ? 'wait' : 'pointer',
            boxShadow: T.shadow,
            transition: T.transition,
          }}
        >
          {saving ? 'Se salvează...' : 'Salvează programarea'}
        </button>

        {mesaj && (
          <p
            style={{
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              background: mesaj.tip === 'succes' ? T.accentSoft : T.dangerSoft,
              color: mesaj.tip === 'succes' ? T.accent : T.danger,
            }}
          >
            {mesaj.text}
          </p>
        )}
      </form>
    </div>
  )
}
