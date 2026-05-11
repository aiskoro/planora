import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
    <div>
      <h3>Alege serviciile</h3>
      {servicii.map(serviciu => (
        <label key={serviciu.id} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!selectate.find(s => s.id === serviciu.id)}
            onChange={() => toggleServiciu(serviciu)}
            style={{ marginRight: '8px' }}
          />
          {serviciu.nume} — {serviciu.durata} min
        </label>
      ))}
      {selectate.length > 0 && (
        <p style={{ marginTop: '12px', fontWeight: 'bold' }}>
          Durată totală: {durataTotala} minute
        </p>
      )}
    </div>
  )
}

export default ServiciiList