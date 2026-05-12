import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ZILE = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
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
      const { data: blocate } = await supabase
        .from('zile_blocate')
        .select('data, data_sfarsit')
      setZileBlocate(blocate || [])

      const { data: orarData } = await supabase
        .from('orar')
        .select('*')
        .order('zi_saptamana')
      setOrar(orarData || [])
    }
    fetchDate()
  }, [])

function zileleLunii() {
  const an = luna.getFullYear()
  const luna_ = luna.getMonth()
  const primaZi = new Date(an, luna_, 1).getDay()
  const totalZile = new Date(an, luna_ + 1, 0).getDate()
  const zile = []
  for (let i = 0; i < primaZi; i++) zile.push(null)
  for (let i = 1; i <= totalZile; i++) {
    const d = new Date(an, luna_, i)
    zile.push(d)
  }
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
  console.log(formatData(date), 'ziSaptamana:', ziSaptamana, 'orar:', ziOrar)
  return ziOrar ? !ziOrar.deschis : true
}

  function esteTrecuta(date) {
    if (!date) return false
    const azi = new Date()
    azi.setHours(0, 0, 0, 0)
    return date < azi
  }

  function esteSelectata(date) {
    if (!date) return false
    return formatData(date) === dataSelectata
  }

  function lunaPrecedenta() {
    setLuna(new Date(luna.getFullYear(), luna.getMonth() - 1, 1))
  }

  function lunaUrmatoare() {
    setLuna(new Date(luna.getFullYear(), luna.getMonth() + 1, 1))
  }

  function handleClick(date) {
    if (!date || esteBlocata(date) || esteTrecuta(date) || esteInchisa(date)) return
    onChange(formatData(date))
  }

  const zile = zileleLunii()

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>Alege data</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
        <button onClick={lunaPrecedenta}>‹</button>
        <strong>{LUNI[luna.getMonth()]} {luna.getFullYear()}</strong>
        <button onClick={lunaUrmatoare}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {ZILE.map(z => (
          <div key={z} style={{ fontWeight: 'bold', fontSize: '12px', padding: '4px' }}>{z}</div>
        ))}
        {zile.map((date, i) => {
          const blocat = esteBlocata(date)
          const inchis = esteInchisa(date)
          const trecut = esteTrecuta(date)
          const selectat = esteSelectata(date)
          const dezactivat = !date || blocat || trecut || inchis

          return (
            <div
              key={i}
              onClick={() => handleClick(date)}
              style={{
                padding: '8px 4px',
                borderRadius: '6px',
                cursor: dezactivat ? 'default' : 'pointer',
                backgroundColor: selectat ? '#4F46E5' : blocat ? '#fee2e2' : inchis ? '#f3f4f6' : 'transparent',
                color: selectat ? '#fff' : blocat ? '#ef4444' : inchis ? '#ccc' : trecut ? '#ccc' : 'inherit',
                opacity: trecut && !blocat && !inchis ? 0.4 : 1,
                fontWeight: selectat ? 'bold' : 'normal',
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