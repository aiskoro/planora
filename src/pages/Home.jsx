import { useState } from 'react'
import ServiciiList from '../components/ServiciiList'
import CalendarPicker from '../components/CalendarPicker'
import OrePicker from '../components/OrePicker'
import BookingForm from '../components/BookingForm'

function Home() {
  const [serviciiSelectate, setServiciiSelectate] = useState([])
  const [dataSelectata, setDataSelectata] = useState(null)
  const [oraSelectata, setOraSelectata] = useState(null)
  const [confirmat, setConfirmat] = useState(false)

  const durataTotala = serviciiSelectate.reduce((sum, s) => sum + s.durata, 0)

  if (confirmat) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1>✅ Programare confirmată!</h1>
        <p>Te așteptăm pe <strong>{dataSelectata}</strong> la ora <strong>{oraSelectata}</strong>.</p>
        <button
          onClick={() => {
            setServiciiSelectate([])
            setDataSelectata(null)
            setOraSelectata(null)
            setConfirmat(false)
          }}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4F46E5',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Fă o nouă programare
        </button>
      </div>
    )
  }

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

      {serviciiSelectate.length > 0 && dataSelectata && oraSelectata && (
        <BookingForm
          serviciiSelectate={serviciiSelectate}
          dataSelectata={dataSelectata}
          oraSelectata={oraSelectata}
          durataTotala={durataTotala}
          onSuccess={() => setConfirmat(true)}
        />
      )}
    </div>
  )
}

export default Home