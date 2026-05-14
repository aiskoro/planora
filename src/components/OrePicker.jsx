import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function OrePicker({ data, durata, oraSelectata, onChange }) {
  const [oreOcupate, setOreOcupate] = useState([])
  const [oreBlocate, setOreBlocate] = useState([])
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

      const { data: blocate } = await supabase
        .from('ore_blocate')
        .select('ora_start, ora_sfarsit')
        .eq('data', data)
      setOreBlocate(blocate || [])

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

    const conflictProgramare = oreOcupate.some(p => {
      const [ph, pm] = p.ora_start.split(':').map(Number)
      const [sh, sm] = p.ora_sfarsit.split(':').map(Number)
      const pStart = ph * 60 + pm
      const pSfarsit = sh * 60 + sm
      return startNou < pSfarsit && sfarsitNou > pStart
    })

    const conflictBlocat = oreBlocate.some(b => {
      const [bh, bm] = b.ora_start.split(':').map(Number)
      const [sh, sm] = b.ora_sfarsit.split(':').map(Number)
      const bStart = bh * 60 + bm
      const bSfarsit = sh * 60 + sm
      return startNou < bSfarsit && sfarsitNou > bStart
    })

    return conflictProgramare || conflictBlocat
  }

  if (!data) return null

  if (durata === 0) return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>
        Ora
      </span>
      <p style={{ color: T.muted, fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
        Selecteaza mai intai cel putin un serviciu.
      </p>
    </div>
  )

  const ore = genereazaOre()

  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Ora
      </span>

      {ore.length === 0 ? (
        <p style={{ color: T.muted, fontSize: '14px', margin: 0 }}>
          Nu exista ore disponibile pentru aceasta zi.
        </p>
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
                  border: `0.5px solid ${selectata ? T.accent : ocupata ? T.border : T.borderHover}`,
                  background: selectata ? T.accentSoft : T.surface2,
                  color: selectata ? T.accent : ocupata ? T.muted : T.text,
                  fontSize: '14px',
                  cursor: ocupata ? 'not-allowed' : 'pointer',
                  fontWeight: selectata ? '500' : 'normal',
                  opacity: ocupata ? 0.35 : 1,
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