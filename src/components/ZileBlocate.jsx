import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function ZileBlocate() {
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
      .order('data', { ascending: true })
    setZile(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchZile()
  }, [fetchZile])

  async function adaugaInterval() {
    if (!dataStart) return setEroare('Alege data de început.')
    if (!dataSfarsit) return setEroare('Alege data de sfârșit.')
    if (dataSfarsit < dataStart) return setEroare('Data de sfârșit trebuie să fie după data de început.')
    setEroare(null)

    const { error } = await supabase
      .from('zile_blocate')
      .insert({
        data: dataStart,
        data_sfarsit: dataSfarsit,
        motiv: motiv.trim() || null,
      })

    if (error) {
      setEroare('A apărut o eroare. Încearcă din nou.')
      return
    }

    setDataStart('')
    setDataSfarsit('')
    setMotiv('')
    fetchZile()
  }

  async function stergeInterval(id) {
    if (!window.confirm('Sigur vrei să deblochezi acest interval?')) return
    const { error } = await supabase
      .from('zile_blocate')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Eroare: ' + error.message)
      return
    }

    setZile(prev => prev.filter(z => z.id !== id))
  }

  function formateazaInterval(z) {
    if (!z.data_sfarsit || z.data === z.data_sfarsit) return z.data
    return `${z.data} → ${z.data_sfarsit}`
  }

  const azi = new Date().toISOString().split('T')[0]
  const zileViitoare = zile.filter(z => (z.data_sfarsit || z.data) >= azi)
  const zileTrecute = zile.filter(z => (z.data_sfarsit || z.data) < azi)

  if (loading) return <p>Se încarcă...</p>

  return (
    <div style={{ marginTop: '24px' }}>

      {/* Adaugă interval */}
      <div style={{
        padding: '16px',
        borderRadius: '10px',
        border: '1px solid #eee',
        backgroundColor: '#fafafa',
        marginBottom: '24px',
      }}>
        <h4 style={{ margin: '0 0 16px' }}>Blochează un interval</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>De la</label>
            <input
              type="date"
              value={dataStart}
              min={azi}
              onChange={e => {
                setDataStart(e.target.value)
                if (dataSfarsit && dataSfarsit < e.target.value) setDataSfarsit(e.target.value)
                setEroare(null)
              }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>Până la</label>
            <input
              type="date"
              value={dataSfarsit}
              min={dataStart || azi}
              onChange={e => { setDataSfarsit(e.target.value); setEroare(null) }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' }}>
            <label style={{ fontSize: '13px', color: '#666' }}>Motiv (opțional)</label>
            <input
              type="text"
              placeholder="ex: Concediu, Sărbătoare..."
              value={motiv}
              onChange={e => setMotiv(e.target.value)}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <button
            onClick={adaugaInterval}
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

      {/* Intervale viitoare */}
      <h4 style={{ margin: '0 0 12px' }}>Intervale blocate ({zileViitoare.length})</h4>
      {zileViitoare.length === 0 ? (
        <p style={{ color: '#999', fontSize: '14px' }}>Nu există intervale blocate viitoare.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
          {zileViitoare.map(z => (
            <div
              key={z.id}
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
                  📅 {formateazaInterval(z)}
                </p>
                {z.motiv && (
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#92400e' }}>{z.motiv}</p>
                )}
              </div>
              <button
                onClick={() => stergeInterval(z.id)}
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
                Deblochează
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Intervale trecute */}
      {zileTrecute.length > 0 && (
        <>
          <h4 style={{ margin: '0 0 12px', color: '#999' }}>Intervale trecute ({zileTrecute.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {zileTrecute.map(z => (
              <div
                key={z.id}
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
                  <p style={{ margin: 0, fontSize: '15px' }}>📅 {formateazaInterval(z)}</p>
                  {z.motiv && (
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#999' }}>{z.motiv}</p>
                  )}
                </div>
                <button
                  onClick={() => stergeInterval(z.id)}
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

export default ZileBlocate