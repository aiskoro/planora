import { useState } from 'react'
import ServiciiList from '../components/ServiciiList'
import CalendarPicker from '../components/CalendarPicker'
import OrePicker from '../components/OrePicker'

function Home() {
  const [serviciiSelectate, setServiciiSelectate] = useState([])
  const [dataSelectata, setDataSelectata] = useState(null)
  const [oraSelectata, setOraSelectata] = useState(null)

  const durataTotala = serviciiSelectate.reduce((sum, s) => sum + s.durata, 0)

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Planora — Programări</h1>

      <ServiciiList
        selectate={serviciiSelectate}
        onChange={(val) => { setServiciiSelectate(val); setOraSelectata(null) }}
      />

      <CalendarPicker
        dataSelectata={dataSelectata}
        onChange={(val) => { setDataSelectata(val); setOraSelectata(null) }}
      />

      <OrePicker
        data={dataSelectata}
        durata={durataTotala}
        oraSelectata={oraSelectata}
        onChange={setOraSelectata}
      />

      {oraSelectata && (
        <p style={{ marginTop: '16px' }}>
          Programare: <strong>{dataSelectata}</strong> la <strong>{oraSelectata}</strong> — <strong>{durataTotala} min</strong>
        </p>
      )}
    </div>
  )
}

export default Home