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
  const [directionNav, setDirectionNav] = useState(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    async function fetchDate() {
      const { data: blocate } = await supabase.from('zile_blocate').select('data, data_sfarsit')
      setZileBlocate(blocate || [])
      const { data: orarData } = await supabase.from('orar').select('*').order('zi_saptamana')
      setOrar(orarData || [])
    }
    fetchDate()
  }, [])

  function navigheaza(directie) {
    if (animating) return
    setDirectionNav(directie)
    setAnimating(true)
    setTimeout(() => {
      setLuna(new Date(luna.getFullYear(), luna.getMonth() + directie, 1))
      setAnimating(false)
      setDirectionNav(null)
    }, 180)
  }

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
    transition: T.transition,
  }

  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '12px',
      boxShadow: T.shadowCard,
    }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .nav-btn:hover {
          background: ${T.accentSoft} !important;
          border-color: ${T.accent} !important;
          color: ${T.accent} !important;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>
          Data
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="nav-btn"
            style={btnNav}
            onClick={() => navigheaza(-1)}
          >
            ‹
          </button>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: T.text,
            minWidth: '140px',
            textAlign: 'center',
          }}>
            {LUNI[luna.getMonth()]} {luna.getFullYear()}
          </span>
          <button
            className="nav-btn"
            style={btnNav}
            onClick={() => navigheaza(1)}
          >
            ›
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {ZILE.map(z => (
          <div key={z} style={{
            fontSize: '11px',
            color: T.muted,
            padding: '4px 0',
            letterSpacing: '0.05em',
            fontWeight: '500',
          }}>
            {z}
          </div>
        ))}

        <div style={{
          display: 'contents',
          animation: animating
            ? 'slideOut 0.18s ease'
            : directionNav === 1
              ? 'slideInRight 0.18s ease'
              : directionNav === -1
                ? 'slideInLeft 0.18s ease'
                : 'slideInRight 0.18s ease',
        }}>
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
            let shadow = 'none'

            if (selectat) {
              bg = T.accent
              color = '#fff'
              border = T.accent
              shadow = T.shadow
            } else if (blocat) {
              bg = T.dangerSoft
              color = T.danger
            } else if (inchis || trecut) {
              color = T.border
            } else if (azi) {
              border = T.accent
              color = T.accent
            } else {
              color = T.text
            }

            return (
              <div
                key={i}
                onClick={() => handleClick(date)}
                style={{
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  cursor: dezactivat ? 'default' : 'pointer',
                  background: bg,
                  color: color,
                  border: `0.5px solid ${border}`,
                  opacity: (trecut && !blocat && !inchis) ? 0.25 : 1,
                  fontWeight: selectat ? '600' : azi ? '500' : 'normal',
                  boxShadow: shadow,
                  transition: T.transition,
                }}
              >
                {date ? date.getDate() : ''}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarPicker