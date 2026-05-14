import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

const ZILE = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du']
const LUNI = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
               'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']

function formatData(date) {
  const an = date.getFullYear()
  const luna = String(date.getMonth() + 1).padStart(2, '0')
  const zi = String(date.getDate()).padStart(2, '0')
  return `${an}-${luna}-${zi}`
}

function CalendarPicker({ dataSelectata, onChange }) {
  const [luna, setLuna] = useState(new Date())
  const [zileBlocate, setZileBlocate] = useState([])
  const [orar, setOrar] = useState([])

  useEffect(() => {
    async function fetchDate() {
      const { data: blocate } = await supabase.from('zile_blocate').select('data, data_sfarsit')
      setZileBlocate(blocate || [])
      const { data: orarData } = await supabase.from('orar').select('*').order('zi_saptamana')
      setOrar(orarData || [])
    }
    fetchDate()
  }, [])

  function zileleLunii() {
    const an = luna.getFullYear()
    const l = luna.getMonth()
    let primaZi = new Date(an, l, 1).getDay()
    primaZi = primaZi === 0 ? 6 : primaZi - 1
    const totalZile = new Date(an, l + 1, 0).getDate()
    const zile = []
    for (let i = 0; i < primaZi; i++) zile.push(null)
    for (let i = 1; i <= totalZile; i++) zile.push(new Date(an, l, i))
    return zile
  }

  function esteBlocata(date) {
    if (!date) return false
    const dataStr = formatData(date)
    return zileBlocate.some(z => {
      const sfarsit = z.data_sfarsit || z.data
      return dataStr >= z.data && dataStr <= sfarsit
    })
  }

  function esteInchisa(date) {
    if (!date) return false
    const ziSaptamana = date.getDay()
    const ziOrar = orar.find(z => z.zi_saptamana === ziSaptamana)
    return ziOrar ? !ziOrar.deschis : true
  }

  function esteTrecuta(date) {
    if (!date) return false
    const azi = new Date()
    azi.setHours(0, 0, 0, 0)
    return date < azi
  }

  function esteAzi(date) {
    if (!date) return false
    const azi = new Date()
    return formatData(date) === formatData(azi)
  }

  function esteSelectata(date) {
    if (!date) return false
    return formatData(date) === dataSelectata
  }

  function handleClick(date) {
    if (!date || esteBlocata(date) || esteTrecuta(date) || esteInchisa(date)) return
    onChange(formatData(date))
  }

  const zile = zileleLunii()

  const btnNav = {
    background: T.surface2,
    border: `0.5px solid ${T.border}`,
    color: T.text,
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

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
          Data
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={btnNav} onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() - 1, 1))}>
            ‹
          </button>
          <span style={{ fontSize: '14px', color: T.text, minWidth: '140px', textAlign: 'center' }}>
            {LUNI[luna.getMonth()]} {luna.getFullYear()}
          </span>
          <button style={btnNav} onClick={() => setLuna(new Date(luna.getFullYear(), luna.getMonth() + 1, 1))}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {ZILE.map(z => (
          <div key={z} style={{ fontSize: '11px', color: T.muted, padding: '4px 0', letterSpacing: '0.05em' }}>
            {z}
          </div>
        ))}
        {zile.map((date, i) => {
          const blocat = esteBlocata(date)
          const inchis = esteInchisa(date)
          const trecut = esteTrecuta(date)
          const selectat = esteSelectata(date)
          const azi = esteAzi(date)
          const dezactivat = !date || blocat || trecut || inchis

          let bg = 'transparent'
          let color = T.muted
          let border = 'transparent'

          if (selectat) { bg = T.accent; color = '#fff'; border = T.accent }
          else if (blocat) { bg = T.dangerSoft; color = T.danger }
          else if (inchis || trecut) { color = T.surface2; }
          else if (azi) { border = T.accent; color = T.accent }
          else { color = T.text }

          return (
            <div
              key={i}
              onClick={() => handleClick(date)}
              style={{
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                cursor: dezactivat ? 'default' : 'pointer',
                background: bg,
                color: color,
                border: `0.5px solid ${border}`,
                opacity: (trecut && !blocat && !inchis) ? 0.3 : 1,
                fontWeight: selectat ? '500' : 'normal',
              }}
            >
              {date ? date.getDate() : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarPicker