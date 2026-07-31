import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

function OreBlocate({ frizerId }) {
  const { T } = useTheme()
  const [ore, setOre] = useState([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState('')
  const [oraStart, setOraStart] = useState('')
  const [oraSfarsit, setOraSfarsit] = useState('')
  const [motiv, setMotiv] = useState('')
  const [eroare, setEroare] = useState(null)

  const fetchOre = useCallback(async () => {
    setLoading(true)
    const { data: result } = await supabase.from('ore_blocate').select('*').eq('frizer_id', frizerId).order('data', { ascending: true }).order('ora_start', { ascending: true })
    setOre(result || [])
    setLoading(false)
  }, [frizerId])

  useEffect(() => { if (frizerId) fetchOre() }, [fetchOre, frizerId])

  async function adauga() {
    if (!data) return setEroare('Alege o data.')
    if (!oraStart) return setEroare('Alege ora de inceput.')
    if (!oraSfarsit) return setEroare('Alege ora de sfarsit.')
    if (oraSfarsit <= oraStart) return setEroare('Ora de sfarsit trebuie sa fie dupa ora de inceput.')
    setEroare(null)
    const { error } = await supabase.from('ore_blocate').insert({ data, ora_start: oraStart, ora_sfarsit: oraSfarsit, motiv: motiv.trim() || null, frizer_id: frizerId })
    if (error) return setEroare('A aparut o eroare. Incearca din nou.')
    setData(''); setOraStart(''); setOraSfarsit(''); setMotiv('')
    fetchOre()
  }

  async function sterge(id) {
    if (!window.confirm('Sigur vrei sa stergi acest interval?')) return
    const { error } = await supabase.from('ore_blocate').delete().eq('id', id)
    if (error) return alert('Eroare: ' + error.message)
    setOre(prev => prev.filter(o => o.id !== id))
  }

  const azi = new Date().toISOString().split('T')[0]
  const oreViitoare = ore.filter(o => o.data >= azi)
  const oreTrecute = ore.filter(o => o.data < azi)

  const stilInput = {
    padding: '8px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`,
    background: T.surface2, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition,
  }

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Se incarca...</div>

  return (
    <div>
      <div style={{ padding: '20px', borderRadius: '12px', border: `0.5px solid ${T.border}`, background: T.surface2, marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>Blocheaza un interval orar</span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>Data</label>
            <input type="date" value={data} min={azi} onChange={e => { setData(e.target.value); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>De la</label>
            <SelectOra value={oraStart} onChange={val => { setOraStart(val); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>Pana la</label>
            <SelectOra value={oraSfarsit} onChange={val => { setOraSfarsit(val); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>Motiv (optional)</label>
            <input type="text" placeholder="ex: Pauza masa..." value={motiv} onChange={e => setMotiv(e.target.value)} style={stilInput} />
          </div>
          <button onClick={adauga} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: T.transition, boxShadow: T.shadow, whiteSpace: 'nowrap' }}>Blocheaza</button>
        </div>
        {eroare && <p style={{ color: T.danger, background: T.dangerSoft, padding: '8px 12px', borderRadius: '8px', margin: '10px 0 0', fontSize: '13px' }}>{eroare}</p>}
      </div>

      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Intervale blocate ({oreViitoare.length})</span>
      {oreViitoare.length === 0 ? (
        <p style={{ color: T.muted, fontSize: '14px', marginBottom: '24px' }}>Nu exista intervale orare blocate.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {oreViitoare.map(o => (
            <div key={o.id} style={{ padding: '14px 16px', borderRadius: '10px', border: '0.5px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: T.text }}>{o.data} · {o.ora_start.slice(0, 5)} — {o.ora_sfarsit.slice(0, 5)}</p>
                {o.motiv && <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>{o.motiv}</p>}
              </div>
              <button onClick={() => sterge(o.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '0.5px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)', color: '#d97706', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', transition: T.transition }}>Sterge</button>
            </div>
          ))}
        </div>
      )}

      {oreTrecute.length > 0 && (
        <>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Trecute ({oreTrecute.length})</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {oreTrecute.map(o => (
              <div key={o.id} style={{ padding: '12px 16px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: T.text }}>{o.data} · {o.ora_start.slice(0, 5)} — {o.ora_sfarsit.slice(0, 5)}</p>
                  {o.motiv && <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>{o.motiv}</p>}
                </div>
                <button onClick={() => sterge(o.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', transition: T.transition }}>Sterge</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default OreBlocate
