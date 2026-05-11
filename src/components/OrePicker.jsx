import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function genereazaOre(durata) {
  const ore = []
  const start = 9 * 60  // 09:00
  const sfarsit = 18 * 60 // 18:00

  for (let min = start; min + durata <= sfarsit; min += 30) {
    const h = Math.floor(min / 60).toString().padStart(2, '0')
    const m = (min % 60).toString().padStart(2, '0')
    ore.push(`${h}:${m}`)
  }
  return ore
}

function OrePicker({ data, durata, oraSelectata, onChange }) {
  const [oreOcupate, setOreOcupate] = useState([])

  useEffect(() => {
    if (!data) return
    async function fetchProgramari() {
      const { data: programari } = await supabase
        .from('programari')
        .select('ora_start, ora_sfarsit')
        .eq('data_programare', data)
        .eq('status', 'confirmata')
      setOreOcupate(programari || [])
    }
    fetchProgramari()
  }, [data])

  function esteOcupata(ora) {
    const [h, m] = ora.split(':').map(Number)
    const startNou = h * 60 + m
    const sfarsitNou = startNou + durata

    return oreOcupate.some(p => {
      const [ph, pm] = p.ora_start.split(':').map(Number)
      const [sh, sm] = p.ora_sfarsit.split(':').map(Number)
      const pStart = ph * 60 + pm
      const pSfarsit = sh * 60 + sm
      return startNou < pSfarsit && sfarsitNou > pStart
    })
  }

  if (!data) return null
  if (durata === 0) return (
    <div style={{ marginTop: '24px' }}>
      <h3>Alege ora</h3>
      <p style={{ color: '#999' }}>Selectează mai întâi cel puțin un serviciu.</p>
    </div>
  )

  const ore = genereazaOre(durata)

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>Alege ora</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {ore.map(ora => {
          const ocupata = esteOcupata(ora)
          const selectata = oraSelectata === ora
          return (
            <button
              key={ora}
              disabled={ocupata}
              onClick={() => onChange(ora)}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectata ? '#4F46E5' : ocupata ? '#eee' : '#ddd',
                backgroundColor: selectata ? '#4F46E5' : ocupata ? '#f9f9f9' : '#fff',
                color: selectata ? '#fff' : ocupata ? '#ccc' : '#333',
                cursor: ocupata ? 'not-allowed' : 'pointer',
                fontWeight: selectata ? 'bold' : 'normal',
              }}
            >
              {ora}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OrePicker