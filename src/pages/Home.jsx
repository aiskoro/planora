import { useState } from 'react'
import ServiciiList from '../components/ServiciiList'
import CalendarPicker from '../components/CalendarPicker'
import OrePicker from '../components/OrePicker'
import BookingForm from '../components/BookingForm'
import Confirmare from './Confirmare'
import { T } from '../styles/theme'

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

  function reseteaza() {
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
        onNouaProgramare={reseteaza}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, padding: '32px 20px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <img
  src="/logo.svg"
  alt="Timevia"
  style={{ height: '90px' }}
/>
        </div>

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

        <p style={{ textAlign: 'center', color: T.muted, fontSize: '12px', marginTop: '32px' }}>
          Powered by Timevia
        </p>

      </div>
    </div>
  )
}

export default Home