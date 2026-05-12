import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function OrePicker({ data, durata, oraSelectata, onChange }) {
  const [oreOcupate, setOreOcupate] = useState([])
  const [orarZi, setOrarZi] = useState(null)

  useEffect(() => {
    if (!data) return
    async function fetchDate() {
      const { data: programari } = await supabase
        .from('programari')
        .select('ora_start, ora_sfarsit')
        .eq('data_programare', data)
        .eq('status', 'confirmata')
      setOreOcupate(programari || [])

      const ziSaptamana = new Date(data + 'T00:00:00').getDay()
      const { data: orarData } = await supabase
        .from('orar')
        .select('*')
        .eq('zi_saptamana', ziSaptamana)
        .single()
      setOrarZi(orarData)
    }
    fetchDate()
  }, [data])

  function genereazaOre() {
    if (!orarZi || !orarZi.deschis) return []
    const ore = []
    const [hStart, mStart] = orarZi.ora_start.split(':').map(Number)
    const [hStop, mStop] = orarZi.ora_sfarsit.split(':').map(Number)
    const start = hStart * 60 + mStart
    const sfarsit = hStop * 60 + mStop

    for (let min = start; min + durata <= sfarsit; min += 30) {
      const h = Math.floor(min / 60).toString().padStart(2, '0')
      const m = (min % 60).toString().padStart(2, '0')
      ore.push(`${h}:${m}`)
    }
    return ore
  }

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

  const ore = genereazaOre()

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>Alege ora</h3>
      {ore.length === 0 ? (
        <p style={{ color: '#999' }}>Nu există ore disponibile pentru această zi.</p>
      ) : (
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
      )}
    </div>
  )
}

export default OrePicker