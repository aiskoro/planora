import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const ORE = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTE = ['00', '10', '20', '30', '40', '50']
const ROW_H = 34

const IconChevron = ({ up = false, color = 'currentColor' }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: up ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

function SelectOra({ value, onChange, style, placeholder = '--:--' }) {
  const { T } = useTheme()
  const val = value ? value.slice(0, 5) : ''
  const oraActiva = val ? val.split(':')[0] : null
  const minutActiv = val ? val.split(':')[1] : null

  const [deschis, setDeschis] = useState(false)
  const [oraTemp, setOraTemp] = useState(oraActiva || null)
  const [minutTemp, setMinutTemp] = useState(minutActiv || null)
  const [hoverOra, setHoverOra] = useState(null)
  const [hoverMin, setHoverMin] = useState(null)
  const ref = useRef(null)
  const oreRef = useRef(null)

  // FIX Bug 4: adăugate oraActiva și minutActiv în deps
  useEffect(() => {
    if (deschis) {
      setOraTemp(oraActiva || null)
      setMinutTemp(minutActiv || null)
    }
  }, [deschis, oraActiva, minutActiv])

  // Scroll la ora activă când se deschide
  useEffect(() => {
    if (deschis && oreRef.current) {
      // Folosim oraActiva direct (din props), nu oraTemp din state
      // pentru că setState din efectul de sync e asincron
      const target = oraActiva || oraTemp
      if (target) {
        const idx = ORE.indexOf(target)
        if (idx >= 0) {
          oreRef.current.scrollTop = idx * ROW_H - ROW_H * 2
        }
      }
    }
  }, [deschis, oraActiva, oraTemp])

  // Închide la click afară
  useEffect(() => {
    if (!deschis) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setDeschis(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [deschis])

  function selecteazaOra(h) {
    setOraTemp(h)
    if (minutTemp !== null) {
      onChange(`${h}:${minutTemp}`)
      setDeschis(false)
    }
  }

  function selecteazaMinut(m) {
    setMinutTemp(m)
    if (oraTemp !== null) {
      onChange(`${oraTemp}:${m}`)
      setDeschis(false)
    }
  }

  let hint = 'Selectează ora și minutul'
  if (oraTemp && !minutTemp) hint = `${oraTemp}:__ — acum minutul`
  else if (!oraTemp && minutTemp) hint = `__:${minutTemp} — acum ora`
  else if (oraTemp && minutTemp) hint = `${oraTemp}:${minutTemp}`

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>

      {/* Trigger */}
      <div
        onClick={() => setDeschis(d => !d)}
        style={{
          ...style,
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxSizing: 'border-box',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span style={{ color: val ? T.text : T.muted, letterSpacing: '0.03em' }}>
          {val || placeholder}
        </span>
        <IconChevron up={deschis} color={T.muted} />
      </div>

      {/* Dropdown */}
      {deschis && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 999,
          background: T.surface,
          border: `1.5px solid ${T.border}`,
          borderRadius: '12px',
          boxShadow: T.shadowCard || '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          minWidth: '200px',
          fontFamily: 'Manrope, sans-serif',
        }}>

          {/* Hint */}
          <div style={{
            padding: '8px 14px',
            fontSize: '11px',
            fontWeight: '600',
            color: T.muted,
            letterSpacing: '0.04em',
            borderBottom: `1px solid ${T.border}`,
            fontFamily: 'Manrope, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            {oraTemp && minutTemp ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke={T.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: T.accent, fontWeight: '700' }}>
                  {oraTemp}:{minutTemp}
                </span>
              </>
            ) : (
              <span>{hint}</span>
            )}
          </div>

          {/* 2 coloane */}
          <div style={{ display: 'flex' }}>

            {/* Coloana ORE */}
            <div style={{ flex: 1, borderRight: `1px solid ${T.border}` }}>
              <div style={{
                fontSize: '10px', fontWeight: '700', color: T.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '6px 14px', borderBottom: `1px solid ${T.border}`,
                fontFamily: 'Manrope, sans-serif',
              }}>
                Ora
              </div>
              <div ref={oreRef} style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {ORE.map(h => {
                  const activ = h === oraTemp
                  const hover = h === hoverOra && !activ
                  return (
                    <div
                      key={h}
                      onClick={() => selecteazaOra(h)}
                      onMouseEnter={() => setHoverOra(h)}
                      onMouseLeave={() => setHoverOra(null)}
                      style={{
                        padding: '0 14px',
                        height: `${ROW_H}px`,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: activ ? '700' : '400',
                        background: activ ? T.accentSoft : hover ? T.surface2 : 'transparent',
                        color: activ ? T.accent : T.text,
                        transition: 'background 0.1s, color 0.1s',
                      }}
                    >
                      {h}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Coloana MINUTE */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '10px', fontWeight: '700', color: T.muted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '6px 14px', borderBottom: `1px solid ${T.border}`,
                fontFamily: 'Manrope, sans-serif',
              }}>
                Minut
              </div>
              <div>
                {MINUTE.map(m => {
                  const activ = m === minutTemp
                  const hover = m === hoverMin && !activ
                  return (
                    <div
                      key={m}
                      onClick={() => selecteazaMinut(m)}
                      onMouseEnter={() => setHoverMin(m)}
                      onMouseLeave={() => setHoverMin(null)}
                      style={{
                        padding: '0 14px',
                        height: `${ROW_H}px`,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: activ ? '700' : '400',
                        background: activ ? T.accentSoft : hover ? T.surface2 : 'transparent',
                        color: activ ? T.accent : T.text,
                        transition: 'background 0.1s, color 0.1s',
                      }}
                    >
                      :{m}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default SelectOra
