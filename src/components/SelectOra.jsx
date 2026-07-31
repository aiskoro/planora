import { useMemo } from 'react'

const ORE = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
)

const MINUTE = ['00', '10', '20', '30', '40', '50']

function SelectOra({ value, onChange, style }) {
  const { ora, minut } = useMemo(() => {
    if (!value) return { ora: '', minut: '' }

    const [h, m] = value.slice(0, 5).split(':')
    return { ora: h, minut: m }
  }, [value])

  function actualizeaza(oraNoua, minutNou) {
    if (!oraNoua || !minutNou) {
      onChange('')
      return
    }

    onChange(`${oraNoua}:${minutNou}`)
  }

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 12px',
      }}
    >
      <select
        value={ora}
        onChange={e => actualizeaza(e.target.value, minut)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '15px',
          color: 'inherit',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      >
        <option value="">Ora</option>
        {ORE.map(h => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span
        style={{
          fontWeight: 600,
          opacity: 0.7,
          userSelect: 'none',
        }}
      >
        :
      </span>

      <select
        value={minut}
        onChange={e => actualizeaza(ora, e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '15px',
          color: 'inherit',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
      >
        <option value="">Min</option>
        {MINUTE.map(m => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectOra
