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
  const ref = useRef(null)

  // Inchide la click afara
  useEffect(() => {
    if (!deschis) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setDeschis(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [deschis])

  function selecteaza(ora, minut) {
    onChange(`${ora}:${minut}`)
    setDeschis(false)
  }

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
      <div
        onClick={() => setDeschis(d => !d)}
        style={triggerStyle}
      >
        <span style={{ color: val ? T.text : T.muted }}>{val || placeholder}</span>
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
          display: 'flex',
          overflow: 'hidden',
          minWidth: '180px',
        }}>
          {/* Coloana ORE */}
          <div style={{ flex: 1, borderRight: `0.5px solid ${T.border}` }}>
            <div style={{
              fontSize: '11px', fontWeight: '600', color: T.muted,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '8px 12px 6px', borderBottom: `0.5px solid ${T.border}`,
            }}>
              Ora
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {ORE.map(h => {
                const activ = h === oraActiva
                return (
                  <div
                    key={h}
                    onClick={() => selecteaza(h, minutActiv || '00')}
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
              padding: '8px 12px 6px', borderBottom: `0.5px solid ${T.border}`,
            }}>
              Minut
            </div>
            <div>
              {MINUTE.map(m => {
                const activ = m === minutActiv
                return (
                  <div
                    key={m}
                    onClick={() => selecteaza(oraActiva || '08', m)}
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
      )}
    </div>
  )
}

export default SelectOra