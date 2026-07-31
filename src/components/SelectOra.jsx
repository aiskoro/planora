import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const ORE = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTE = ['00', '10', '20', '30', '40', '50']

function SelectOra({ value, onChange, style, placeholder = '--:--' }) {
  const { T } = useTheme()
  const val = value ? value.slice(0, 5) : ''
  const oraActiva = val ? val.split(':')[0] : null
  const minutActiv = val ? val.split(':')[1] : null

  const [deschis, setDeschis] = useState(false)
  const [oraTemp, setOraTemp] = useState(oraActiva || null)
  const [minutTemp, setMinutTemp] = useState(minutActiv || null)
  const ref = useRef(null)

  // Sync temp state cand se deschide
  useEffect(() => {
    if (deschis) {
      setOraTemp(oraActiva || null)
      setMinutTemp(minutActiv || null)
    }
  }, [deschis])

  // Inchide la click afara
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
    // Daca minutul e deja selectat, finalizeaza direct
    if (minutTemp !== null) {
      onChange(`${h}:${minutTemp}`)
      setDeschis(false)
    }
  }

  function selecteazaMinut(m) {
    setMinutTemp(m)
    // Daca ora e deja selectata, finalizeaza direct
    if (oraTemp !== null) {
      onChange(`${oraTemp}:${m}`)
      setDeschis(false)
    }
  }

  const afisaj = val || placeholder

  const triggerStyle = {
    ...style,
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    boxSizing: 'border-box',
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div onClick={() => setDeschis(d => !d)} style={triggerStyle}>
        <span style={{ color: val ? T.text : T.muted }}>{afisaj}</span>
        <span style={{ color: T.muted, fontSize: '12px', flexShrink: 0 }}>{deschis ? '▲' : '▼'}</span>
      </div>

      {/* Dropdown */}
      {deschis && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 999,
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '12px',
          boxShadow: T.shadowCard,
          overflow: 'hidden',
          minWidth: '200px',
        }}>
          {/* Hint */}
          <div style={{
            padding: '8px 14px 6px',
            fontSize: '11px',
            color: T.muted,
            borderBottom: `0.5px solid ${T.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>
              {!oraTemp && !minutTemp && 'Selectează ora și minutul'}
              {oraTemp && !minutTemp && `${oraTemp}:__ — acum minutul`}
              {!oraTemp && minutTemp && `__:${minutTemp} — acum ora`}
              {oraTemp && minutTemp && `${oraTemp}:${minutTemp} ✓`}
            </span>
          </div>

          {/* 2 coloane */}
          <div style={{ display: 'flex' }}>
            {/* Coloana ORE */}
            <div style={{ flex: 1, borderRight: `0.5px solid ${T.border}` }}>
              <div style={{
                fontSize: '11px', fontWeight: '600', color: T.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '6px 12px', borderBottom: `0.5px solid ${T.border}`,
              }}>
                Ora
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {ORE.map(h => {
                  const activ = h === oraTemp
                  return (
                    <div
                      key={h}
                      onClick={() => selecteazaOra(h)}
                      style={{
                        padding: '7px 14px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: activ ? '700' : '400',
                        background: activ ? T.accentSoft : 'transparent',
                        color: activ ? T.accent : T.text,
                        transition: T.transition,
                      }}
                      onMouseEnter={e => { if (!activ) e.currentTarget.style.background = T.surface2 }}
                      onMouseLeave={e => { if (!activ) e.currentTarget.style.background = 'transparent' }}
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
                fontSize: '11px', fontWeight: '600', color: T.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '6px 12px', borderBottom: `0.5px solid ${T.border}`,
              }}>
                Minut
              </div>
              <div>
                {MINUTE.map(m => {
                  const activ = m === minutTemp
                  return (
                    <div
                      key={m}
                      onClick={() => selecteazaMinut(m)}
                      style={{
                        padding: '7px 14px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: activ ? '700' : '400',
                        background: activ ? T.accentSoft : 'transparent',
                        color: activ ? T.accent : T.text,
                        transition: T.transition,
                      }}
                      onMouseEnter={e => { if (!activ) e.currentTarget.style.background = T.surface2 }}
                      onMouseLeave={e => { if (!activ) e.currentTarget.style.background = 'transparent' }}
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