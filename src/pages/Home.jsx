import { useState } from 'react'
import ServiciiList from '../components/ServiciiList'
import CalendarPicker from '../components/CalendarPicker'
import OrePicker from '../components/OrePicker'
import BookingForm from '../components/BookingForm'
import Confirmare from './Confirmare'

function Home() {
  const [serviciiSelectate, setServiciiSelectate] = useState([])
  const [dataSelectata, setDataSelectata] = useState(null)
  const [oraSelectata, setOraSelectata] = useState(null)
  const [confirmare, setConfirmare] = useState(null)

  const durataTotala = serviciiSelectate.reduce((sum, s) => sum + s.durata, 0)

  function calculeazaOraStop(oraStart, durata) {
    const [h, m] = oraStart.split(':').map(Number)
    const total = h * 60 + m + durata
    const hStop = Math.floor(total / 60).toString().padStart(2, '0')
    const mStop = (total % 60).toString().padStart(2, '0')
    return `${hStop}:${mStop}`
  }

  function resetează() {
    setServiciiSelectate([])
    setDataSelectata(null)
    setOraSelectata(null)
    setConfirmare(null)
  }

  if (confirmare) {
    return (
      <Confirmare
        nume={confirmare.nume}
        data={confirmare.data}
        ora={confirmare.ora}
        oraStop={confirmare.oraStop}
        servicii={confirmare.servicii}
        durata={confirmare.durata}
        onNouaProgramare={resetează}
      />
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center' }}>Planora — Programări</h1>

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

      {serviciiSelectate.length > 0 && dataSelectata && oraSelectata && (
        <BookingForm
          serviciiSelectate={serviciiSelectate}
          dataSelectata={dataSelectata}
          oraSelectata={oraSelectata}
          durataTotala={durataTotala}
          onSuccess={(numeClient) => {
            setConfirmare({
              nume: numeClient,
              data: dataSelectata,
              ora: oraSelectata,
              oraStop: calculeazaOraStop(oraSelectata, durataTotala),
              servicii: serviciiSelectate.map(s => s.nume),
              durata: durataTotala,
            })
          }}
        />
      )}
    </div>
  )
}

export default Home