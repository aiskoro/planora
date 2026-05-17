import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

const SERVICIU_ICON = {
  'Tuns': '✂️',
  'Barba': '🪒',
  'Spalat': '🚿',
  'Vopsit par': '🎨',
  'Vopsit barba': '🎨',
}

function ServiciiList({ selectate, onChange, frizerId }) {
  const [servicii, setServicii] = useState([])
  const [hover, setHover] = useState(null)
  const [animat, setAnimat] = useState(null)

  useEffect(() => {
    if (!frizerId) return
    async function fetchServicii() {
      const { data } = await supabase
        .from('frizer_servicii')
        .select('servicii(*)')
        .eq('frizer_id', frizerId)

      const lista = (data || [])
        .map(row => row.servicii)
        .filter(s => s && s.activ)
        .sort((a, b) => a.ordine - b.ordine)

      setServicii(lista)
    }
    fetchServicii()
  }, [frizerId])

  function toggleServiciu(serviciu) {
    setAnimat(serviciu.id)
    setTimeout(() => setAnimat(null), 300)
    const exista = selectate.find(s => s.id === serviciu.id)
    if (exista) {
      onChange(selectate.filter(s => s.id !== serviciu.id))
    } else {
      onChange([...selectate, serviciu])
    }
  }

  const durataTotala = selectate.reduce((sum, s) => sum + s.durata, 0)

  if (!frizerId) return null

  return (
    <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: T.shadowCard }}>
      <style>{`
        @keyframes pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.13); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>
          Servicii
        </span>
        {selectate.length > 0 && (
          <span style={{ padding: '3px 10px', borderRadius: '20px', background: T.accentSoft, border: `0.5px solid ${T.accent}`, color: T.accent, fontSize: '12px', fontWeight: '500', transition: T.transition }}>
            {durataTotala} min
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {servicii.map(serviciu => {
          const activ = !!selectate.find(s => s.id === serviciu.id)
          const esteHover = hover === serviciu.id
          const esteAnimat = animat === serviciu.id
          const icon = SERVICIU_ICON[serviciu.nume] || '💈'

          return (
            <button
              key={serviciu.id}
              onClick={() => toggleServiciu(serviciu)}
              onMouseEnter={() => setHover(serviciu.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `0.5px solid ${activ ? T.accent : esteHover ? T.borderHover : T.border}`,
                background: activ ? T.accentSoft : T.surface2,
                color: activ ? T.accent : esteHover ? T.text : T.muted,
                fontSize: '13px',
                cursor: 'pointer',
                transition: T.transition,
                animation: esteAnimat ? 'pop 0.3s ease' : 'none',
                transform: esteHover && !esteAnimat ? 'scale(1.04)' : 'scale(1)',
                boxShadow: activ ? `0 2px 8px ${T.accentSoft}` : esteHover ? T.shadow : 'none',
                fontWeight: activ ? '500' : 'normal',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px' }}>{icon}</span>
              {serviciu.nume}
              <span style={{ opacity: 0.55, fontSize: '11px', marginLeft: '2px' }}>{serviciu.durata}min</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ServiciiList