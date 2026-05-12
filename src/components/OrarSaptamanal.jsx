import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ZILE_NUME = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']

function OrarSaptamanal() {
  const [orar, setOrar] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvat, setSalvat] = useState(false)

  const fetchOrar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orar')
      .select('*')
      .order('zi_saptamana')
    setOrar(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrar()
  }, [fetchOrar])

  function updateZi(id, camp, valoare) {
    setOrar(prev => prev.map(z => z.id === id ? { ...z, [camp]: valoare } : z))
  }

  async function salveaza() {
    for (const zi of orar) {
      await supabase
        .from('orar')
        .update({
          deschis: zi.deschis,
          ora_start: zi.ora_start,
          ora_sfarsit: zi.ora_sfarsit,
        })
        .eq('id', zi.id)
    }
    setSalvat(true)
    setTimeout(() => setSalvat(false), 3000)
  }

  if (loading) return <p>Se încarcă...</p>

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orar.map(zi => (
          <div
            key={zi.id}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #eee',
              backgroundColor: zi.deschis ? '#fafafa' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            {/* Zi + toggle deschis */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '140px' }}>
              <input
                type="checkbox"
                checked={zi.deschis}
                onChange={e => updateZi(zi.id, 'deschis', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{
                fontWeight: 'bold',
                fontSize: '15px',
                color: zi.deschis ? '#333' : '#999',
              }}>
                {ZILE_NUME[zi.zi_saptamana]}
              </span>
            </div>

            {/* Ore */}
            {zi.deschis ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="time"
                  value={zi.ora_start}
                  onChange={e => updateZi(zi.id, 'ora_start', e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
                <span style={{ color: '#999' }}>—</span>
                <input
                  type="time"
                  value={zi.ora_sfarsit}
                  onChange={e => updateZi(zi.id, 'ora_sfarsit', e.target.value)}
                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
            ) : (
              <span style={{ color: '#999', fontSize: '14px' }}>Închis</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={salveaza}
        style={{
          marginTop: '20px',
          padding: '10px 28px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: salvat ? '#10b981' : '#4F46E5',
          color: '#fff',
          fontSize: '15px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
      >
        {salvat ? '✓ Salvat!' : 'Salvează orarul'}
      </button>
    </div>
  )
}

export default OrarSaptamanal