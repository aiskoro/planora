import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

const IconTrash = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const IconAlert = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

function OreBlocate({ frizerId }) {
  const { T } = useTheme()
  const [ore, setOre] = useState([])
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState('')
  const [oraStart, setOraStart] = useState('')
  const [oraSfarsit, setOraSfarsit] = useState('')
  const [motiv, setMotiv] = useState('')
  const [eroare, setEroare] = useState(null)       // erori formular
  const [deleteEroare, setDeleteEroare] = useState(null) // FIX Bug 3: eroare ștergere separată
  const [adding, setAdding] = useState(false)
  const [btnPress, setBtnPress] = useState(false)

  // FIX Bug 2 + 3: confirmare inline pentru TOATE ștergerile (viitoare + trecute)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchOre = useCallback(async () => {
    setLoading(true)
    const { data: result } = await supabase
      .from('ore_blocate')
      .select('*')
      .eq('frizer_id', frizerId)
      .order('data', { ascending: true })
      .order('ora_start', { ascending: true })
    setOre(result || [])
    setLoading(false)
  }, [frizerId])

  useEffect(() => { if (frizerId) fetchOre() }, [fetchOre, frizerId])

  async function adauga() {
    if (!data) return setEroare('Alege o dată.')
    if (!oraStart) return setEroare('Alege ora de început.')
    if (!oraSfarsit) return setEroare('Alege ora de sfârșit.')
    if (oraSfarsit <= oraStart) return setEroare('Ora de sfârșit trebuie să fie după ora de început.')
    setEroare(null)
    setAdding(true)
    const { error } = await supabase.from('ore_blocate').insert({
      data, ora_start: oraStart, ora_sfarsit: oraSfarsit,
      motiv: motiv.trim() || null, frizer_id: frizerId,
    })
    setAdding(false)
    if (error) return setEroare('A apărut o eroare. Încearcă din nou.')
    setData(''); setOraStart(''); setOraSfarsit(''); setMotiv('')
    fetchOre()
  }

  async function sterge(id) {
    setDeleteEroare(null)
    const { error } = await supabase.from('ore_blocate').delete().eq('id', id)
    if (error) {
      setDeleteEroare('Eroare la ștergere. Încearcă din nou.')
      setConfirmDeleteId(null)
      return
    }
    setConfirmDeleteId(null)
    setOre(prev => prev.filter(o => o.id !== id))
  }

  const azi = new Date().toISOString().split('T')[0]
  const oreViitoare = ore.filter(o => o.data >= azi)
  const oreTrecute = ore.filter(o => o.data < azi)

  const lbl = {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: T.muted, fontFamily: 'Manrope, sans-serif',
  }

  const stilInput = {
    padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${T.border}`,
    background: T.surface2, color: T.text, fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace', outline: 'none', boxSizing: 'border-box',
  }

  const stilInputText = {
    ...stilInput, fontFamily: 'Manrope, sans-serif',
    fontSize: '14px', width: '100%',
  }

  // Randează un rând (folosit atât pt viitoare cât și pt trecute)
  function RandOra({ o, culoareBorder, culoareBg, culoareStergeBorder, culoareStergeText, opacitate = 1 }) {
    return (
      <div>
        <div style={{
          padding: '12px 16px', borderRadius: '10px',
          border: `1.5px solid ${culoareBorder}`,
          background: culoareBg,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: '12px', opacity: opacitate,
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '13px', color: T.text, fontFamily: 'JetBrains Mono, monospace' }}>
              {o.data} · {o.ora_start.slice(0, 5)}–{o.ora_sfarsit.slice(0, 5)}
            </p>
            {o.motiv && (
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: T.muted, fontFamily: 'Manrope, sans-serif' }}>
                {o.motiv}
              </p>
            )}
          </div>
          <button
            onClick={() => setConfirmDeleteId(o.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '8px',
              border: `1.5px solid ${culoareStergeBorder}`,
              background: 'transparent', color: culoareStergeText,
              fontSize: '13px', fontFamily: 'Manrope, sans-serif',
              fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <IconTrash size={13} color={culoareStergeText} />
            Șterge
          </button>
        </div>

        {/* FIX Bug 2: confirmare inline pentru toate (viitoare + trecute) */}
        {confirmDeleteId === o.id && (
          <div style={{
            margin: '4px 0 4px 12px', padding: '10px 14px',
            borderRadius: '8px', border: `1.5px solid ${T.danger}`,
            background: T.dangerSoft, display: 'flex',
            alignItems: 'center', gap: '10px', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '13px', color: T.danger, fontWeight: '600', flex: 1, fontFamily: 'Manrope, sans-serif' }}>
              Sigur ștergi acest interval?
            </span>
            <button onClick={() => sterge(o.id)} style={{
              padding: '5px 14px', borderRadius: '7px', border: 'none',
              background: T.danger, color: '#fff', fontSize: '13px',
              fontFamily: 'Manrope, sans-serif', fontWeight: '700', cursor: 'pointer',
            }}>
              Da, șterge
            </button>
            <button onClick={() => setConfirmDeleteId(null)} style={{
              padding: '5px 12px', borderRadius: '7px',
              border: `1.5px solid ${T.border}`, background: 'transparent',
              color: T.muted, fontSize: '13px',
              fontFamily: 'Manrope, sans-serif', fontWeight: '600', cursor: 'pointer',
            }}>
              Anulează
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}>
      Se încarcă...
    </div>
  )

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Formular ── */}
      <div style={{
        padding: '18px 20px', borderRadius: '14px',
        border: `1.5px solid ${T.border}`, background: T.surface2, marginBottom: '28px',
      }}>
        <span style={{ ...lbl, display: 'block', marginBottom: '16px' }}>
          Blochează un interval orar
        </span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Dată</label>
            <input type="date" value={data} min={azi}
              onChange={e => { setData(e.target.value); setEroare(null) }}
              style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>De la</label>
            <SelectOra value={oraStart} onChange={val => { setOraStart(val); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Până la</label>
            <SelectOra value={oraSfarsit} onChange={val => { setOraSfarsit(val); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '150px' }}>
            <label style={lbl}>Motiv (opțional)</label>
            <input type="text" placeholder="ex: Pauză masă..." value={motiv}
              onChange={e => setMotiv(e.target.value)} style={stilInputText} />
          </div>
          <button
            onClick={adauga} disabled={adding}
            onMouseDown={() => setBtnPress(true)}
            onMouseUp={() => setBtnPress(false)}
            onMouseLeave={() => setBtnPress(false)}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none',
              background: adding ? T.muted : T.accent, color: '#fff',
              fontSize: '14px', fontFamily: 'Manrope, sans-serif',
              fontWeight: '700', cursor: adding ? 'wait' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.12s',
              transform: btnPress ? 'scale(0.97)' : 'scale(1)',
            }}
          >
            {adding ? 'Se adaugă...' : 'Blochează'}
          </button>
        </div>

        {eroare && (
          <div style={{
            marginTop: '12px', padding: '9px 12px', borderRadius: '8px',
            background: T.dangerSoft, color: T.danger, fontSize: '13px',
            fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <IconAlert size={13} color={T.danger} />
            {eroare}
          </div>
        )}
      </div>

      {/* FIX Bug 3: eroarea de la ștergere apare lângă liste, nu în formular */}
      {deleteEroare && (
        <div style={{
          marginBottom: '14px', padding: '9px 12px', borderRadius: '8px',
          background: T.dangerSoft, color: T.danger, fontSize: '13px',
          fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: '7px',
        }}>
          <IconAlert size={13} color={T.danger} />
          {deleteEroare}
        </div>
      )}

      {/* ── Viitoare ── */}
      <span style={{ ...lbl, display: 'block', marginBottom: '10px' }}>
        Intervale blocate ({oreViitoare.length})
      </span>
      {oreViitoare.length === 0 ? (
        <p style={{ color: T.muted, fontSize: '14px', marginBottom: '28px' }}>
          Nu există intervale orare blocate.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
          {oreViitoare.map(o => (
            <RandOra
              key={o.id} o={o}
              culoareBorder="rgba(245,158,11,0.3)"
              culoareBg="rgba(245,158,11,0.05)"
              culoareStergeBorder="rgba(245,158,11,0.3)"
              culoareStergeText="#d97706"
            />
          ))}
        </div>
      )}

      {/* ── Trecute ── */}
      {oreTrecute.length > 0 && (
        <>
          <span style={{ ...lbl, display: 'block', marginBottom: '10px' }}>
            Trecute ({oreTrecute.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {oreTrecute.map(o => (
              <RandOra
                key={o.id} o={o}
                culoareBorder={T.border}
                culoareBg={T.surface2}
                culoareStergeBorder={T.border}
                culoareStergeText={T.muted}
                opacitate={0.55}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default OreBlocate
