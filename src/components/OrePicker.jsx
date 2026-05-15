import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function OrePicker({ data, durata, oraSelectata, onChange, frizerId }) {
  const [oreOcupate, setOreOcupate] = useState([])
  const [oreBlocate, setOreBlocate] = useState([])
  const [orarZi, setOrarZi] = useState(null)
  const [hover, setHover] = useState(null)
  const [animat, setAnimat] = useState(null)

  useEffect(() => {
    if (!data || !frizerId) return
    async function fetchDate() {
      const { data: programari } = await supabase
        .from('programari')
        .select('ora_start, ora_sfarsit')
        .eq('data_programare', data)
        .eq('frizer_id', frizerId)
        .eq('status', 'confirmata')
      setOreOcupate(programari || [])

      const { data: blocate } = await supabase
        .from('ore_blocate')
        .select('ora_start, ora_sfarsit')
        .eq('data', data)
        .eq('frizer_id', frizerId)
      setOreBlocate(blocate || [])

      const ziSaptamana = new Date(data + 'T00:00:00').getDay()
      const { data: orarData } = await supabase
        .from('orar')
        .select('*')
        .eq('zi_saptamana', ziSaptamana)
        .eq('frizer_id', frizerId)
        .single()
      setOrarZi(orarData)
    }
    fetchDate()
  }, [data, frizerId])

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
      return startNou < sh * 60 + sm && sfarsitNou > ph * 60 + pm
    })

    const conflictBlocat = oreBlocate.some(b => {
      const [bh, bm] = b.ora_start.split(':').map(Number)
      const [sh, sm] = b.ora_sfarsit.split(':').map(Number)
      return startNou < sh * 60 + sm && sfarsitNou > bh * 60 + bm
    })

    return conflictProgramare || conflictBlocat
  }

  function handleClick(ora) {
    setAnimat(ora)
    setTimeout(() => setAnimat(null), 300)
    onChange(ora)
  }

  if (!data || !frizerId) return null

  if (durata === 0) return (
    <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: T.shadowCard }}>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>Ora</span>
      <p style={{ color: T.muted, fontSize: '14px', marginTop: '12px', marginBottom: 0 }}>
        Selecteaza mai intai cel putin un serviciu.
      </p>
    </div>
  )

  const ore = genereazaOre()

  return (
    <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: T.shadowCard }}>
      <style>{`
        @keyframes popOra {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInOre {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Ora
      </span>

      {ore.length === 0 ? (
        <p style={{ color: T.muted, fontSize: '14px', margin: 0 }}>Nu exista ore disponibile pentru aceasta zi.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', animation: 'fadeInOre 0.25s ease' }}>
          {ore.map(ora => {
            const ocupata = esteOcupata(ora)
            const selectata = oraSelectata === ora
            const esteHover = hover === ora
            const esteAnimat = animat === ora

            return (
              <button
                key={ora}
                disabled={ocupata}
                onClick={() => !ocupata && handleClick(ora)}
                onMouseEnter={() => !ocupata && setHover(ora)}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: `0.5px solid ${selectata ? T.accent : esteHover ? T.borderHover : T.border}`,
                  background: selectata ? T.accent : T.surface2,
                  color: selectata ? '#fff' : ocupata ? T.muted : esteHover ? T.accent : T.text,
                  fontSize: '14px',
                  cursor: ocupata ? 'not-allowed' : 'pointer',
                  fontWeight: selectata ? '600' : 'normal',
                  opacity: ocupata ? 0.3 : 1,
                  transition: T.transition,
                  animation: esteAnimat ? 'popOra 0.3s ease' : 'none',
                  transform: esteHover && !selectata ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectata ? T.shadow : esteHover ? T.shadowCard : 'none',
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