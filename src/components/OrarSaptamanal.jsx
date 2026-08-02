import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

const ZILE_NUME = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
const ZILE_SCURT = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ']

const IconCopy = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconCheck = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function ziChanged(original, current) {
  return (
    original.deschis !== current.deschis ||
    original.ora_start !== current.ora_start ||
    original.ora_sfarsit !== current.ora_sfarsit
  )
}

function OrarSaptamanal({ frizerId }) {
  const { T } = useTheme()
  const [orar, setOrar] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvat, setSalvat] = useState(false)
  const [saving, setSaving] = useState(false)
  const [btnPress, setBtnPress] = useState(false)

  // FIX Bug 5: ținem originalul pentru a salva doar rândurile modificate
  const orarOriginal = useRef([])

  const [copyFromId, setCopyFromId] = useState(null)
  const [copyTargets, setCopyTargets] = useState([])

  const fetchOrar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orar')
      .select('*')
      .eq('frizer_id', frizerId)
      .order('zi_saptamana')
    const rezultat = data || []
    setOrar(rezultat)
    orarOriginal.current = rezultat.map(z => ({ ...z }))
    setLoading(false)
  }, [frizerId])

  useEffect(() => { if (frizerId) fetchOrar() }, [fetchOrar, frizerId])

  function updateZi(id, camp, valoare) {
    setOrar(prev => prev.map(z => z.id === id ? { ...z, [camp]: valoare } : z))
  }

  function startCopy(id) {
    setCopyFromId(id)
    setCopyTargets([])
  }

  function cancelCopy() {
    setCopyFromId(null)
    setCopyTargets([])
  }

  function toggleTarget(ziIndex) {
    setCopyTargets(prev =>
      prev.includes(ziIndex) ? prev.filter(z => z !== ziIndex) : [...prev, ziIndex]
    )
  }

  function aplicaCopy() {
    const sursa = orar.find(z => z.id === copyFromId)
    if (!sursa) return
    setOrar(prev => prev.map(z =>
      copyTargets.includes(z.zi_saptamana)
        ? { ...z, ora_start: sursa.ora_start, ora_sfarsit: sursa.ora_sfarsit, deschis: true }
        : z
    ))
    cancelCopy()
  }

  async function salveaza() {
    setSaving(true)
    // FIX Bug 5: salvăm doar zilele care s-au schimbat față de original
    const modified = orar.filter(zi => {
      const orig = orarOriginal.current.find(o => o.id === zi.id)
      return orig ? ziChanged(orig, zi) : true
    })
    for (const zi of modified) {
      await supabase
        .from('orar')
        .update({ deschis: zi.deschis, ora_start: zi.ora_start, ora_sfarsit: zi.ora_sfarsit })
        .eq('id', zi.id)
    }
    // Actualizăm originalul după salvare
    orarOriginal.current = orar.map(z => ({ ...z }))
    setSaving(false)
    setSalvat(true)
    setTimeout(() => setSalvat(false), 2500)
  }

  const lbl = {
    fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em',
    textTransform: 'uppercase', color: T.muted,
    fontFamily: 'Manrope, sans-serif', display: 'block', marginBottom: '14px',
  }

  const stilSelectOra = {
    padding: '8px 12px', borderRadius: '8px', border: `1.5px solid ${T.border}`,
    background: T.surface, color: T.text, fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace', outline: 'none', width: '100px',
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}>
      Se încarcă...
    </div>
  )

  if (orar.length === 0) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}>
      Nu există orar configurat.
    </div>
  )

  const sursa = orar.find(z => z.id === copyFromId)

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif' }}>
      <span style={lbl}>Program săptămânal</span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        {orar.map(zi => {
          const esteSursa = zi.id === copyFromId
          return (
            <div key={zi.id}>
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                border: `1.5px solid ${esteSursa ? T.accent : zi.deschis ? T.border : 'transparent'}`,
                background: esteSursa ? T.accentSoft : zi.deschis ? T.surface2 : 'rgba(107,114,128,0.04)',
                display: 'flex', alignItems: 'center', gap: '14px',
                flexWrap: 'wrap', transition: 'all 0.15s',
              }}>
                {/* Toggle */}
                <div
                  onClick={() => updateZi(zi.id, 'deschis', !zi.deschis)}
                  style={{
                    width: '34px', height: '20px', borderRadius: '20px',
                    background: zi.deschis ? T.accent : T.border,
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: zi.deschis ? '17px' : '3px',
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>

                {/* Zi */}
                <span style={{
                  fontWeight: '600', fontSize: '14px',
                  color: zi.deschis ? T.text : T.muted,
                  minWidth: '90px', transition: 'color 0.15s',
                }}>
                  {ZILE_NUME[zi.zi_saptamana]}
                </span>

                {/* Ore */}
                {zi.deschis ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SelectOra value={zi.ora_start} onChange={val => updateZi(zi.id, 'ora_start', val)} style={stilSelectOra} />
                    <span style={{ color: T.muted, fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                    <SelectOra value={zi.ora_sfarsit} onChange={val => updateZi(zi.id, 'ora_sfarsit', val)} style={stilSelectOra} />
                  </div>
                ) : (
                  <span style={{ color: T.muted, fontSize: '13px' }}>Închis</span>
                )}

                {/* Buton copy */}
                {zi.deschis && !copyFromId && (
                  <button type="button" onClick={() => startCopy(zi.id)} style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', borderRadius: '8px', border: `1.5px solid ${T.border}`,
                    background: 'transparent', color: T.muted, fontSize: '12px',
                    fontFamily: 'Manrope, sans-serif', fontWeight: '600', cursor: 'pointer',
                  }}>
                    <IconCopy size={12} color={T.muted} />
                    Copiază
                  </button>
                )}

                {esteSursa && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '11px', fontWeight: '700',
                    color: T.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Sursă
                  </span>
                )}
              </div>

              {/* Panel copy inline */}
              {esteSursa && sursa && (
                <div style={{
                  margin: '4px 0 4px 16px', padding: '12px 14px', borderRadius: '10px',
                  border: `1.5px solid ${T.accent}`, background: T.surface2,
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted }}>
                    Copiază {sursa.ora_start?.slice(0, 5)}–{sursa.ora_sfarsit?.slice(0, 5)} în:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {orar.filter(z => z.id !== copyFromId).map(z => {
                      const sel = copyTargets.includes(z.zi_saptamana)
                      return (
                        <button key={z.id} type="button" onClick={() => toggleTarget(z.zi_saptamana)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '5px 10px', borderRadius: '20px',
                          border: `1.5px solid ${sel ? T.accent : T.border}`,
                          background: sel ? T.accent : 'transparent',
                          color: sel ? '#fff' : T.text, fontSize: '12px',
                          fontFamily: 'Manrope, sans-serif', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.12s',
                        }}>
                          {sel && <IconCheck size={11} color="#fff" />}
                          {ZILE_SCURT[z.zi_saptamana]}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={aplicaCopy} disabled={copyTargets.length === 0} style={{
                      padding: '7px 16px', borderRadius: '8px', border: 'none',
                      background: copyTargets.length === 0 ? T.border : T.accent,
                      color: copyTargets.length === 0 ? T.muted : '#fff',
                      fontSize: '13px', fontFamily: 'Manrope, sans-serif', fontWeight: '700',
                      cursor: copyTargets.length === 0 ? 'default' : 'pointer', transition: 'all 0.12s',
                    }}>
                      Aplică
                    </button>
                    <button type="button" onClick={cancelCopy} style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: `1.5px solid ${T.border}`, background: 'transparent',
                      color: T.muted, fontSize: '13px', fontFamily: 'Manrope, sans-serif',
                      fontWeight: '600', cursor: 'pointer',
                    }}>
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={salveaza}
        disabled={saving}
        onMouseDown={() => setBtnPress(true)}
        onMouseUp={() => setBtnPress(false)}
        onMouseLeave={() => setBtnPress(false)}
        style={{
          padding: '11px 28px', borderRadius: '10px', border: 'none',
          background: salvat ? (T.success || '#16a34a') : T.accent,
          color: '#fff', fontSize: '14px', fontFamily: 'Manrope, sans-serif',
          fontWeight: '700', cursor: saving ? 'wait' : 'pointer',
          transition: 'all 0.12s', transform: btnPress && !salvat ? 'scale(0.97)' : 'scale(1)',
          display: 'flex', alignItems: 'center', gap: '7px', letterSpacing: '0.01em',
        }}
      >
        {salvat && <IconCheck size={14} color="#fff" />}
        {saving ? 'Se salvează...' : salvat ? 'Salvat!' : 'Salvează orarul'}
      </button>
    </div>
  )
}

export default OrarSaptamanal
