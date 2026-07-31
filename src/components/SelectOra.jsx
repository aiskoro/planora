// Select reutilizabil pentru ora, cu pas fix de 10 minute (00, 10, 20, 30, 40, 50)
const OPTIUNI_ORA = (() => {
  const ore = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 10) {
      ore.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return ore
})()

function SelectOra({ value, onChange, style, placeholder = '--:--' }) {
  // valoarea poate veni din DB cu secunde (ex: "09:00:00") — normalizam la "HH:MM"
  const valoareNormalizata = value ? value.slice(0, 5) : ''

  return (
    <select value={valoareNormalizata} onChange={e => onChange(e.target.value)} style={style}>
      <option value="">{placeholder}</option>
      {OPTIUNI_ORA.map(ora => (
        <option key={ora} value={ora}>{ora}</option>
      ))}
    </select>
  )
}

export default SelectOra
