import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const ZILE_NUME = ['Duminica', 'Luni', 'Marti', 'Miercuri', 'Joi', 'Vineri', 'Sambata']

function OrarSaptamanal({ frizerId }) {
  const { T } = useTheme()
  const [orar, setOrar] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvat, setSalvat] = useState(false)
  const [hoverSalveaza, setHoverSalveaza] = useState(false)

  const fetchOrar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('orar').select('*').eq('frizer_id', frizerId).order('zi_saptamana')
    setOrar(data || [])
    setLoading(false)
  }, [frizerId])

  useEffect(() => { if (frizerId) fetchOrar() }, [fetchOrar, frizerId])

  function updateZi(id, camp, valoare) {
    setOrar(prev => prev.map(z => z.id === id ? { ...z, [camp]: valoare } : z))
  }

  async function salveaza() {
    for (const zi of orar) {
      await supabase.from('orar').update({ deschis: zi.deschis, ora_start: zi.ora_start, ora_sfarsit: zi.ora_sfarsit }).eq('id', zi.id)
    }
    setSalvat(true)
    setTimeout(() => setSalvat(false), 3000)
  }

  const stilInput = {
    padding: '7px 10px', borderRadius: '8px', border: `0.5px solid ${T.border}`,
    background: T.surface, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition,
  }

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Se incarca...</div>
  if (orar.length === 0) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Nu exista orar configurat pentru acest frizer.</div>

  return (
    <div>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Program saptamanal
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {orar.map(zi => (
          <div key={zi.id} style={{ padding: '14px 16px', borderRadius: '12px', border: `0.5px solid ${zi.deschis ? T.border : 'transparent'}`, background: zi.deschis ? T.surface2 : 'rgba(107,114,128,0.06)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', transition: T.transition }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '130px' }}>
              <div onClick={() => updateZi(zi.id, 'deschis', !zi.deschis)} style={{ width: '36px', height: '20px', borderRadius: '20px', background: zi.deschis ? T.accent : T.border, cursor: 'pointer', position: 'relative', transition: T.transition, flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: zi.deschis ? '19px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: T.transition, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
              </div>
              <span style={{ fontWeight: '500', fontSize: '14px', color: zi.deschis ? T.text : T.muted, transition: T.transition }}>
                {ZILE_NUME[zi.zi_saptamana]}
              </span>
            </div>
            {zi.deschis ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="time" value={zi.ora_start} onChange={e => updateZi(zi.id, 'ora_start', e.target.value)} style={stilInput} />
                <span style={{ color: T.muted, fontSize: '14px' }}>—</span>
                <input type="time" value={zi.ora_sfarsit} onChange={e => updateZi(zi.id, 'ora_sfarsit', e.target.value)} style={stilInput} />
              </div>
            ) : (
              <span style={{ color: T.muted, fontSize: '14px' }}>Inchis</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={salveaza}
        onMouseEnter={() => setHoverSalveaza(true)}
        onMouseLeave={() => setHoverSalveaza(false)}
        style={{ padding: '11px 28px', borderRadius: '10px', border: 'none', background: salvat ? `linear-gradient(135deg, ${T.success}, #16a34a)` : hoverSalveaza ? `linear-gradient(135deg, #5a7af5, ${T.accent})` : `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: T.transition, boxShadow: T.shadow, transform: hoverSalveaza && !salvat ? 'scale(1.02)' : 'scale(1)' }}
      >
        {salvat ? 'Salvat!' : 'Salveaza orarul'}
      </button>
    </div>
  )
}

export default OrarSaptamanal