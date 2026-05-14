import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function OreBlocate() {
  const [ore, setOre] = useState([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState('')
  const [oraStart, setOraStart] = useState('')
  const [oraSfarsit, setOraSfarsit] = useState('')
  const [motiv, setMotiv] = useState('')
  const [eroare, setEroare] = useState(null)

  const fetchOre = useCallback(async () => {
    setLoading(true)
    const { data: result } = await supabase
      .from('ore_blocate')
      .select('*')
      .order('data', { ascending: true })
      .order('ora_start', { ascending: true })
    setOre(result || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOre()
  }, [fetchOre])

  async function adauga() {
    if (!data) return setEroare('Alege o dată.')
    if (!oraStart) return setEroare('Alege ora de început.')
    if (!oraSfarsit) return setEroare('Alege ora de sfârșit.')
    if (oraSfarsit <= oraStart) return setEroare('Ora de sfârșit trebuie să fie după ora de început.')
    setEroare(null)

    const { error } = await supabase
      .from('ore_blocate')
      .insert({
        data,
        ora_start: oraStart,
        ora_sfarsit: oraSfarsit,
        motiv: motiv.trim() || null,
      })

    if (error) return setEroare('A apărut o eroare. Încearcă din nou.')

    setData('')
    setOraStart('')
    setOraSfarsit('')
    setMotiv('')
    fetchOre()
  }

  async function sterge(id) {
    if (!window.confirm('Sigur vrei să ștergi acest interval?')) return
    const { error } = await supabase.from('ore_blocate').delete().eq('id', id)
    if (error) return alert('Eroare: ' + error.message)
    setOre(prev => prev.filter(o => o.id !== id))
  }

  const azi = new Date().toISOString().split('T')[0]
  const oreViitoare = ore.filter(o => o.data >= azi)
  const oreTrecute = ore.filter(o => o.data < azi)

  if (loading) return <p>Se încarcă...</p>

  return (
    <div style={{ marginTop: '24px' }}>

      {/* Formular adăugare */}
      <div style={{
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #eee',
        backgroundColor: '#fafafa',
        marginBottom: '24px',
      }}>
        <h4 style={{ margin: '0 0 16px' }}>Blochează un interval orar</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>Data</label>
            <input
              type="date"
              value={data}
              min={azi}
              onChange={e => { setData(e.target.value); setEroare(null) }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>De la</label>
            <input
              type="time"
              value={oraStart}
              onChange={e => { setOraStart(e.target.value); setEroare(null) }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>Până la</label>
            <input
              type="time"
              value={oraSfarsit}
              onChange={e => { setOraSfarsit(e.target.value); setEroare(null) }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>Motiv (opțional)</label>
            <input
              type="text"
              placeholder="ex: Pauză masă..."
              value={motiv}
              onChange={e => setMotiv(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <button
            onClick={adauga}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4F46E5',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Blochează
          </button>
        </div>
        {eroare && <p style={{ color: '#ef4444', margin: '8px 0 0', fontSize: '13px' }}>{eroare}</p>}
      </div>

      {/* Ore viitoare */}
      <h4 style={{ margin: '0 0 12px' }}>Intervale blocate ({oreViitoare.length})</h4>
      {oreViitoare.length === 0 ? (
        <p style={{ color: '#999', fontSize: '14px' }}>Nu există intervale orare blocate.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          {oreViitoare.map(o => (
            <div
              key={o.id}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #fde68a',
                backgroundColor: '#fffbeb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>
                  📅 {o.data} · ⏰ {o.ora_start.slice(0, 5)} — {o.ora_sfarsit.slice(0, 5)}
                </p>
                {o.motiv && (
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#92400e' }}>{o.motiv}</p>
                )}
              </div>
              <button
                onClick={() => sterge(o.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d97706',
                  backgroundColor: '#fff',
                  color: '#d97706',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                Șterge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ore trecute */}
      {oreTrecute.length > 0 && (
        <>
          <h4 style={{ margin: '0 0 12px', color: '#999' }}>Trecute ({oreTrecute.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {oreTrecute.map(o => (
              <div
                key={o.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #eee',
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: 0.7,
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    📅 {o.data} · ⏰ {o.ora_start.slice(0, 5)} — {o.ora_sfarsit.slice(0, 5)}
                  </p>
                  {o.motiv && (
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#999' }}>{o.motiv}</p>
                  )}
                </div>
                <button
                  onClick={() => sterge(o.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Șterge
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default OreBlocate