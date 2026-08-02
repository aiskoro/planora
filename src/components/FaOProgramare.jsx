import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTenant } from '../hooks/useTenant'
import { useFrizer } from '../hooks/useFrizer'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

// ─── helpers ────────────────────────────────────────────────────────────────

function calculeazaOraSfarsit(oraStart, durataMinute) {
  const [h, m] = oraStart.split(':').map(Number)
  const start = new Date(2000, 0, 1, h, m)
  const sfarsit = new Date(start.getTime() + durataMinute * 60000)
  const hh = String(sfarsit.getHours()).padStart(2, '0')
  const mm = String(sfarsit.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

async function verificaSuprapunere(frizerId, dataProgramare, oraStart, oraSfarsit, excludeId = null) {
  const { data, error } = await supabase
    .from('programari')
    .select('id, nume_client, ora_start, ora_sfarsit')
    .eq('frizer_id', frizerId)
    .eq('data_programare', dataProgramare)
    .neq('status', 'anulata')

  if (error || !data) return null

  for (const p of data) {
    if (excludeId && p.id === excludeId) continue
    const startExistent = p.ora_start.slice(0, 5)
    const sfarsitExistent = p.ora_sfarsit.slice(0, 5)
    if (oraStart < sfarsitExistent && oraSfarsit > startExistent) return p
  }
  return null
}

// ─── SVG icons ──────────────────────────────────────────────────────────────

const IconClock = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconSearch = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconCheck = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconAlert = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ─── component ──────────────────────────────────────────────────────────────

export default function FaOProgramare({ onSuccess }) {
  const { T } = useTheme()
  const { tenant } = useTenant()
  const { frizer } = useFrizer()

  const [servicii, setServicii] = useState([])
  const [selectate, setSelectate] = useState([])
  const [search, setSearch] = useState('')

  const [numeClient, setNumeClient] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [data, setData] = useState('')
  const [oraStart, setOraStart] = useState('')
  const [durata, setDurata] = useState('')
  const [oreLucru, setOreLucru] = useState(null) // { min, max } ore în care lucrează, sau null (fallback)

  const [saving, setSaving] = useState(false)
  const [mesaj, setMesaj] = useState(null)
  const [btnPress, setBtnPress] = useState(false)

  const durataNum = parseInt(durata, 10) || 0

  const oraSfarsitPreview =
    oraStart && durataNum > 0 ? calculeazaOraSfarsit(oraStart, durataNum) : null

  // ── fetch servicii + frecvență ──
  useEffect(() => {
    if (!tenant?.id || !frizer?.id) return

    async function load() {
      const { data: svc } = await supabase
        .from('servicii')
        .select('id, nume, durata, ordine')
        .eq('tenant_id', tenant.id)
        .eq('activ', true)
        .order('ordine', { ascending: true })

      if (!svc) return

      const { data: usage } = await supabase
        .from('programari_servicii')
        .select('serviciu_id, programari!inner(frizer_id)')
        .eq('programari.frizer_id', frizer.id)

      const countMap = {}
      if (usage) {
        for (const row of usage) {
          countMap[row.serviciu_id] = (countMap[row.serviciu_id] || 0) + 1
        }
      }

      const sorted = svc
        .map(s => ({ ...s, count: countMap[s.id] || 0 }))
        .sort((a, b) => b.count - a.count || (a.ordine ?? 999) - (b.ordine ?? 999))

      setServicii(sorted)
    }

    load()
  }, [tenant?.id, frizer?.id])

  // ── fetch orar de lucru pentru ziua selectată → limitează orele afișate în SelectOra ──
  useEffect(() => {
    if (!data || !frizer?.id) { setOreLucru(null); return }

    async function loadOrar() {
      const ziSaptamana = new Date(`${data}T00:00:00`).getDay()
      const { data: rand } = await supabase
        .from('orar')
        .select('ora_start, ora_sfarsit, deschis')
        .eq('frizer_id', frizer.id)
        .eq('zi_saptamana', ziSaptamana)
        .maybeSingle()

      if (!rand || !rand.deschis) { setOreLucru(null); return }

      const [hStart] = rand.ora_start.split(':').map(Number)
      const [hEnd, mEnd] = rand.ora_sfarsit.split(':').map(Number)
      setOreLucru({
        min: hStart,
        max: mEnd > 0 ? hEnd : Math.max(hStart, hEnd - 1),
      })
    }

    loadOrar()
  }, [data, frizer?.id])

  // ── handlers ──
  function toggleServiciu(id) {
    setSelectate(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
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
    setSearch('')
    setMesaj(null)
  }

  const serviciiFiltered = servicii.filter(s =>
    s.nume.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setMesaj(null)

    // FIX Bug 1: frizer check primul, înainte de orice altă validare
    if (!frizer?.id) {
      setMesaj({ tip: 'eroare', text: 'Nu s-a putut identifica angajatul logat.' })
      return
    }
    if (!numeClient.trim() || !data || !oraStart) {
      setMesaj({ tip: 'eroare', text: 'Completează toate câmpurile obligatorii.' })
      return
    }
    if (selectate.length === 0) {
      setMesaj({ tip: 'eroare', text: 'Selectează cel puțin un serviciu.' })
      return
    }
    if (!durata || durataNum <= 0) {
      setMesaj({ tip: 'eroare', text: 'Introdu durata programării.' })
      return
    }

    const acum = new Date()
    const dataProgramare = new Date(`${data}T${oraStart}:00`)
    if (dataProgramare < acum) {
      setMesaj({ tip: 'eroare', text: 'Nu poți programa în trecut. Alege o dată și oră viitoare.' })
      return
    }

    setSaving(true)
    try {
      const oraSfarsit = calculeazaOraSfarsit(oraStart, durataNum)

      const conflict = await verificaSuprapunere(frizer.id, data, oraStart, oraSfarsit)
      if (conflict) {
        setMesaj({
          tip: 'eroare',
          text: `Suprapunere cu ${conflict.nume_client} (${conflict.ora_start.slice(0, 5)}–${conflict.ora_sfarsit.slice(0, 5)}). Alege altă oră.`,
        })
        setSaving(false)
        return
      }

      const cancelToken = crypto.randomUUID()

      const { data: programare, error: errProgramare } = await supabase
        .from('programari')
        .insert({
          frizer_id: frizer.id,
          nume_client: numeClient.trim(),
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

      const rows = selectate.map(serviciuId => ({
        programare_id: programare.id,
        serviciu_id: serviciuId,
      }))

      const { error: errServicii } = await supabase
        .from('programari_servicii')
        .insert(rows)

      if (errServicii) throw errServicii

      setMesaj({ tip: 'succes', text: 'Programare adăugată cu succes!' })
      resetForm()
      onSuccess?.()
    } catch (err) {
      console.error(err)
      setMesaj({ tip: 'eroare', text: 'Eroare la salvare. Încearcă din nou.' })
    } finally {
      setSaving(false)
    }
  }

  // ── styles ──
  const inp = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1.5px solid ${T.border}`,
    background: T.surface2,
    color: T.text,
    fontSize: '14px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const inpMono = {
    ...inp,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '13px',
  }

  const lbl = {
    display: 'block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    color: T.muted,
    fontFamily: 'Manrope, sans-serif',
  }

  const divider = {
    height: '1px',
    background: T.border,
    margin: '20px 0',
    opacity: 0.5,
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: 'Manrope, sans-serif' }}>

      <h3 style={{
        margin: '0 0 24px',
        fontSize: '21px',
        fontWeight: '700',
        fontFamily: 'Fraunces, Georgia, serif',
        fontStyle: 'italic',
        color: T.text,
        letterSpacing: '-0.02em',
      }}>
        Programare nouă
      </h3>

      <form onSubmit={handleSubmit} noValidate>

        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>Nume client *</label>
          <input
            style={inp}
            value={numeClient}
            onChange={e => setNumeClient(e.target.value)}
            placeholder="Maria Popescu"
            autoComplete="off"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={lbl}>Telefon</label>
            <input
              style={inp}
              value={telefon}
              onChange={e => setTelefon(e.target.value)}
              placeholder="07xx xxx xxx"
            />
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input
              style={inp}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="client@email.com"
            />
          </div>
        </div>

        <div style={divider} />

        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>Dată *</label>
          <input
            style={inpMono}
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={lbl}>Ora start *</label>
            <SelectOra
              style={inpMono}
              value={oraStart}
              onChange={val => setOraStart(val)}
              oraMin={oreLucru ? oreLucru.min : 7}
              oraMax={oreLucru ? oreLucru.max : 22}
            />
            {data && !oreLucru && (
              <span style={{ display: 'block', marginTop: '5px', fontSize: '11px', color: T.muted }}>
                Nu există orar setat pentru această zi — interval implicit 07–22.
              </span>
            )}
          </div>
          <div>
            <label style={lbl}>Durată (minute) *</label>
            <input
              style={inpMono}
              type="number"
              min="1"
              value={durata}
              onChange={e => setDurata(e.target.value)}
              placeholder="45"
            />
          </div>
        </div>

        <div style={divider} />

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Servicii *</label>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: T.muted, display: 'flex',
            }}>
              <IconSearch size={14} color={T.muted} />
            </span>
            <input
              style={{ ...inp, paddingLeft: '34px', fontSize: '13px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Caută serviciu..."
            />
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '7px',
            padding: '12px',
            borderRadius: '12px',
            border: `1.5px solid ${T.border}`,
            background: T.surface2,
            minHeight: '56px',
          }}>
            {serviciiFiltered.length === 0 && (
              <span style={{ fontSize: '13px', color: T.muted, padding: '4px 0' }}>
                {search ? 'Niciun serviciu găsit.' : 'Nu există servicii configurate.'}
              </span>
            )}

            {serviciiFiltered.map(s => {
              const sel = selectate.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleServiciu(s.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '20px',
                    border: sel ? `1.5px solid ${T.accent}` : `1.5px solid ${T.border}`,
                    background: sel ? T.accent : 'transparent',
                    color: sel ? '#fff' : T.text,
                    fontSize: '13px',
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {sel && (
                    <span style={{ display: 'flex', opacity: 0.9 }}>
                      <IconCheck size={12} color="#fff" />
                    </span>
                  )}
                  {s.nume}
                  {!sel && s.count > 0 && (
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      background: T.accentSoft, color: T.accent,
                      borderRadius: '8px', padding: '1px 5px', lineHeight: '16px',
                    }}>
                      ×{s.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {oraStart && durataNum > 0 && oraSfarsitPreview && (
            <div style={{
              marginTop: '10px', padding: '10px 14px', borderRadius: '10px',
              background: T.accentSoft, display: 'flex', alignItems: 'center',
              gap: '8px', fontSize: '13px',
            }}>
              <IconClock size={14} color={T.accent} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '600', color: T.accent }}>
                {oraStart} → {oraSfarsitPreview}
              </span>
              <span style={{ color: T.muted, fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>
                · {durataNum} min · {selectate.length} {selectate.length === 1 ? 'serviciu' : 'servicii'}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          onMouseDown={() => setBtnPress(true)}
          onMouseUp={() => setBtnPress(false)}
          onMouseLeave={() => setBtnPress(false)}
          style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            background: saving ? T.muted : T.accent, color: '#fff',
            fontSize: '15px', fontWeight: '700', fontFamily: 'Manrope, sans-serif',
            cursor: saving ? 'wait' : 'pointer', letterSpacing: '0.01em',
            transition: 'all 0.12s',
            transform: btnPress ? 'scale(0.97)' : 'scale(1)',
          }}
        >
          {saving ? 'Se salvează...' : 'Salvează programarea'}
        </button>

        {mesaj && (
          <div style={{
            marginTop: '14px', padding: '12px 16px', borderRadius: '12px',
            fontSize: '13px', fontWeight: '500', fontFamily: 'Manrope, sans-serif',
            background: mesaj.tip === 'succes' ? T.accentSoft : T.dangerSoft,
            color: mesaj.tip === 'succes' ? T.accent : T.danger,
            display: 'flex', alignItems: 'flex-start', gap: '9px',
          }}>
            <span style={{ flexShrink: 0, marginTop: '1px' }}>
              {mesaj.tip === 'succes'
                ? <IconCheck size={15} color={T.accent} />
                : <IconAlert size={15} color={T.danger} />
              }
            </span>
            {mesaj.text}
          </div>
        )}

      </form>
    </div>
  )
}
