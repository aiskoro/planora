import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ServiciiList from '../components/ServiciiList'
import CalendarPicker from '../components/CalendarPicker'
import OrePicker from '../components/OrePicker'
import BookingForm from '../components/BookingForm'
import Confirmare from './Confirmare'
import { useTheme } from '../context/ThemeContext'

function Home() {
  const { T, isDark, toggleTheme } = useTheme()
  const [frizeri, setFrizeri] = useState([])
  const [frizerSelectat, setFrizerSelectat] = useState(null)
  const [serviciiSelectate, setServiciiSelectate] = useState([])
  const [dataSelectata, setDataSelectata] = useState(null)
  const [oraSelectata, setOraSelectata] = useState(null)
  const [confirmare, setConfirmare] = useState(null)
  const [hoverFrizeri, setHoverFrizeri] = useState(null)

  useEffect(() => {
    async function fetchFrizeri() {
      const { data } = await supabase
        .from('frizeri')
        .select('*')
        .eq('activ', true)
        .order('created_at', { ascending: true })
      setFrizeri(data || [])
    }
    fetchFrizeri()
  }, [])

  const durataTotala = serviciiSelectate.reduce((sum, s) => sum + s.durata, 0)

  function selecteazaFrizer(frizer) {
    setFrizerSelectat(frizer)
    setServiciiSelectate([])
    setDataSelectata(null)
    setOraSelectata(null)
  }

  function calculeazaOraStop(oraStart, durata) {
    const [h, m] = oraStart.split(':').map(Number)
    const total = h * 60 + m + durata
    const hStop = Math.floor(total / 60).toString().padStart(2, '0')
    const mStop = (total % 60).toString().padStart(2, '0')
    return `${hStop}:${mStop}`
  }

  function reseteaza() {
    setFrizerSelectat(null)
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

        {/* Logo + toggle */}
        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
          <img src="/logo.svg" alt="Timevia" style={{ height: '90px' }} />
          <button
            onClick={toggleTheme}
            title={isDark ? 'Mod luminos' : 'Mod întunecat'}
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              background: T.surface2, border: `0.5px solid ${T.border}`,
              borderRadius: '10px', padding: '8px 10px', cursor: 'pointer',
              fontSize: '16px', color: T.muted, transition: T.transition,
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Selectare frizer */}
        <div style={{
          background: T.surface, border: `0.5px solid ${T.border}`,
          borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: T.shadowCard,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase' }}>
              Frizer
            </span>
            {frizerSelectat && (
              <button onClick={() => selecteazaFrizer(null)} style={{ fontSize: '12px', color: T.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Schimba
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {frizeri.map(f => {
              const activ = frizerSelectat?.id === f.id
              const esteHover = hoverFrizeri === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => selecteazaFrizer(f)}
                  onMouseEnter={() => setHoverFrizeri(f.id)}
                  onMouseLeave={() => setHoverFrizeri(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 16px', borderRadius: '12px',
                    border: `0.5px solid ${activ ? T.accent : esteHover ? T.borderHover : T.border}`,
                    background: activ ? T.accentSoft : T.surface2,
                    cursor: 'pointer', transition: T.transition,
                    transform: esteHover && !activ ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: activ ? T.shadow : esteHover ? T.shadowCard : 'none',
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: activ ? T.accent : `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0,
                  }}>
                    {f.nume.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: activ ? '600' : '500', color: activ ? T.accent : T.text }}>
                    {f.nume}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {frizerSelectat && (
          <>
            <ServiciiList
              selectate={serviciiSelectate}
              onChange={(val) => { setServiciiSelectate(val); setOraSelectata(null) }}
              frizerId={frizerSelectat.id}
            />
            <CalendarPicker
              dataSelectata={dataSelectata}
              onChange={(val) => { setDataSelectata(val); setOraSelectata(null) }}
              frizerId={frizerSelectat.id}
            />
            <OrePicker
              data={dataSelectata}
              durata={durataTotala}
              oraSelectata={oraSelectata}
              onChange={setOraSelectata}
              frizerId={frizerSelectat.id}
            />
            {serviciiSelectate.length > 0 && dataSelectata && oraSelectata && (
              <BookingForm
                serviciiSelectate={serviciiSelectate}
                dataSelectata={dataSelectata}
                oraSelectata={oraSelectata}
                durataTotala={durataTotala}
                frizerId={frizerSelectat.id}
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
          </>
        )}

        <p style={{ textAlign: 'center', color: T.muted, fontSize: '12px', marginTop: '32px' }}>
          Powered by Timevia
        </p>
      </div>
    </div>
  )
}

export default Home