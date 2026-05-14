import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function ServiciiList({ selectate, onChange }) {
  const [servicii, setServicii] = useState([])

  useEffect(() => {
    async function fetchServicii() {
      const { data } = await supabase
        .from('servicii')
        .select('*')
        .eq('activ', true)
        .order('ordine')
      setServicii(data || [])
    }
    fetchServicii()
  }, [])

  function toggleServiciu(serviciu) {
    const exista = selectate.find(s => s.id === serviciu.id)
    if (exista) {
      onChange(selectate.filter(s => s.id !== serviciu.id))
    } else {
      onChange([...selectate, serviciu])
    }
  }

  const durataTotala = selectate.reduce((sum, s) => sum + s.durata, 0)

  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>
          Servicii
        </span>
        {selectate.length > 0 && (
          <span style={{
            padding: '3px 10px',
            borderRadius: '20px',
            background: T.accentSoft,
            border: `0.5px solid ${T.accent}`,
            color: T.accent,
            fontSize: '12px',
          }}>
            {durataTotala} min
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {servicii.map(serviciu => {
          const activ = !!selectate.find(s => s.id === serviciu.id)
          return (
            <button
              key={serviciu.id}
              onClick={() => toggleServiciu(serviciu)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `0.5px solid ${activ ? T.accent : T.border}`,
                background: activ ? T.accentSoft : T.surface2,
                color: activ ? T.accent : T.muted,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {serviciu.nume}
              <span style={{ marginLeft: '6px', opacity: 0.6, fontSize: '11px' }}>
                {serviciu.durata}min
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ServiciiList