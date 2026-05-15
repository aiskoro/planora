import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function ZileBlocate({ frizerId }) {
  const [zile, setZile] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataStart, setDataStart] = useState('')
  const [dataSfarsit, setDataSfarsit] = useState('')
  const [motiv, setMotiv] = useState('')
  const [eroare, setEroare] = useState(null)

  const fetchZile = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('zile_blocate')
      .select('*')
      .eq('frizer_id', frizerId)
      .order('data', { ascending: true })
    setZile(data || [])
    setLoading(false)
  }, [frizerId])

  useEffect(() => {
    if (frizerId) fetchZile()
  }, [fetchZile, frizerId])

  async function adaugaInterval() {
    if (!dataStart) return setEroare('Alege data de inceput.')
    if (!dataSfarsit) return setEroare('Alege data de sfarsit.')
    if (dataSfarsit < dataStart) return setEroare('Data de sfarsit trebuie sa fie dupa data de inceput.')
    setEroare(null)

    const { error } = await supabase
      .from('zile_blocate')
      .insert({ data: dataStart, data_sfarsit: dataSfarsit, motiv: motiv.trim() || null, frizer_id: frizerId })

    if (error) { setEroare('A aparut o eroare. Incearca din nou.'); return }
    setDataStart('')
    setDataSfarsit('')
    setMotiv('')
    fetchZile()
  }

  async function stergeInterval(id) {
    if (!window.confirm('Sigur vrei sa deblochezi acest interval?')) return
    const { error } = await supabase.from('zile_blocate').delete().eq('id', id)
    if (error) { alert('Eroare: ' + error.message); return }
    setZile(prev => prev.filter(z => z.id !== id))
  }

  function formateazaInterval(z) {
    if (!z.data_sfarsit || z.data === z.data_sfarsit) return z.data
    return `${z.data} → ${z.data_sfarsit}`
  }

  const azi = new Date().toISOString().split('T')[0]
  const zileViitoare = zile.filter(z => (z.data_sfarsit || z.data) >= azi)
  const zileTrecute = zile.filter(z => (z.data_sfarsit || z.data) < azi)

  const stilInput = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `0.5px solid ${T.border}`,
    background: T.surface2,
    color: T.text,
    fontSize: '14px',
    outline: 'none',
    transition: T.transition,
  }

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Se incarca...</div>

  return (
    <div>
      <div style={{ padding: '20px', borderRadius: '12px', border: `0.5px solid ${T.border}`, background: T.surface2, marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
          Blocheaza un interval
        </span>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>De la</label>
            <input type="date" value={dataStart} min={azi} onChange={e => { setDataStart(e.target.value); if (dataSfarsit && dataSfarsit < e.target.value) setDataSfarsit(e.target.value); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>Pana la</label>
            <input type="date" value={dataSfarsit} min={dataStart || azi} onChange={e => { setDataSfarsit(e.target.value); setEroare(null) }} style={stilInput} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '12px', color: T.muted }}>Motiv (optional)</label>
            <input type="text" placeholder="ex: Concediu..." value={motiv} onChange={e => setMotiv(e.target.value)} style={stilInput} />
          </div>
          <button onClick={adaugaInterval} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: T.transition, boxShadow: T.shadow, whiteSpace: 'nowrap' }}>
            Blocheaza
          </button>
        </div>
        {eroare && <p style={{ color: T.danger, background: T.dangerSoft, padding: '8px 12px', borderRadius: '8px', margin: '10px 0 0', fontSize: '13px' }}>{eroare}</p>}
      </div>

      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
        Intervale blocate ({zileViitoare.length})
      </span>
      {zileViitoare.length === 0 ? (
        <p style={{ color: T.muted, fontSize: '14px', marginBottom: '24px' }}>Nu exista intervale blocate viitoare.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {zileViitoare.map(z => (
            <div key={z.id} style={{ padding: '14px 16px', borderRadius: '10px', border: '0.5px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: T.text }}>{formateazaInterval(z)}</p>
                {z.motiv && <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>{z.motiv}</p>}
              </div>
              <button onClick={() => stergeInterval(z.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '0.5px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)', color: '#d97706', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', transition: T.transition }}>
                Deblocheaza
              </button>
            </div>
          ))}
        </div>
      )}

      {zileTrecute.length > 0 && (
        <>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Trecute ({zileTrecute.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {zileTrecute.map(z => (
              <div key={z.id} style={{ padding: '12px 16px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: T.text }}>{formateazaInterval(z)}</p>
                  {z.motiv && <p style={{ margin: '2px 0 0', fontSize: '13px', color: T.muted }}>{z.motiv}</p>}
                </div>
                <button onClick={() => stergeInterval(z.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', transition: T.transition }}>
                  Sterge
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ZileBlocate