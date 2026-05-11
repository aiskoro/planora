import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function AdminPanel() {
  const [programari, setProgramari] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtruData, setFiltruData] = useState('')
  const [filtruNume, setFiltruNume] = useState('')
  const [filtruTelefon, setFiltruTelefon] = useState('')
  const [tab, setTab] = useState('active')

  const fetchProgramari = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('programari')
      .select(`
        *,
        programari_servicii (
          servicii ( nume )
        )
      `)
      .order('data_programare', { ascending: true })
      .order('ora_start', { ascending: true })
    setProgramari(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProgramari()
  }, [fetchProgramari])

  async function anuleazaProgramare(id) {
    if (!window.confirm('Sigur vrei să anulezi această programare?')) return
    const { error } = await supabase
      .from('programari')
      .update({ status: 'anulata' })
      .eq('id', id)
    if (error) {
      alert('Eroare: ' + error.message)
      return
    }
    setProgramari(prev => prev.map(p => p.id === id ? { ...p, status: 'anulata' } : p))
  }

  function reseteazaFiltre() {
    setFiltruData('')
    setFiltruNume('')
    setFiltruTelefon('')
  }

  const azi = new Date().toISOString().split('T')[0]

  const programariActive = programari.filter(p => p.data_programare >= azi && p.status !== 'anulata')
  const programariIstoric = programari.filter(p => p.data_programare < azi || p.status === 'anulata')

  const listaCurenta = tab === 'active' ? programariActive : programariIstoric

  const programariFiltrate = listaCurenta.filter(p => {
    const potrivireData = filtruData ? p.data_programare === filtruData : true
    const potrivireNume = filtruNume ? p.nume_client.toLowerCase().includes(filtruNume.toLowerCase()) : true
    const potrivireTelefon = filtruTelefon ? p.telefon === filtruTelefon : true
    return potrivireData && potrivireNume && potrivireTelefon
  })

  const areFiltre = filtruData || filtruNume || filtruTelefon

  const stilTab = (activ) => ({
    padding: '8px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activ ? 'bold' : 'normal',
    backgroundColor: activ ? '#4F46E5' : '#f3f4f6',
    color: activ ? '#fff' : '#555',
  })

  const stilInput = {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    width: '160px',
  }

  if (loading) return <p>Se încarcă...</p>

  return (
    <div style={{ marginTop: '24px' }}>

      {/* Tab-uri */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button style={stilTab(tab === 'active')} onClick={() => { setTab('active'); reseteazaFiltre() }}>
          Programări active ({programariActive.length})
        </button>
        <button style={stilTab(tab === 'istoric')} onClick={() => { setTab('istoric'); reseteazaFiltre() }}>
          Istoric ({programariIstoric.length})
        </button>
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={filtruData}
          onChange={e => setFiltruData(e.target.value)}
          style={stilInput}
        />
        <input
          type="text"
          placeholder="Caută după nume..."
          value={filtruNume}
          onChange={e => setFiltruNume(e.target.value)}
          style={stilInput}
        />
        <input
          type="tel"
          placeholder="Număr telefon"
          value={filtruTelefon}
          onChange={e => setFiltruTelefon(e.target.value)}
          style={stilInput}
        />
        {areFiltre && (
          <button
            onClick={reseteazaFiltre}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '14px' }}
          >
            Resetează
          </button>
        )}
        <span style={{ color: '#999', fontSize: '14px' }}>
          {programariFiltrate.length} programări
        </span>
      </div>

      {/* Lista */}
      {programariFiltrate.length === 0 ? (
        <p style={{ color: '#999' }}>Nu există programări.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {programariFiltrate.map(p => {
            const esteAnulata = p.status === 'anulata'
            const esteEfectuata = p.data_programare < azi && !esteAnulata

            return (
              <div
                key={p.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: `1px solid ${esteAnulata ? '#fecaca' : '#eee'}`,
                  backgroundColor: esteAnulata ? '#fff5f5' : tab === 'istoric' ? '#f9f9f9' : '#fafafa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: tab === 'istoric' ? 0.85 : 1,
                }}
              >
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: '16px' }}>
                    {p.nume_client}
                    {esteAnulata && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#ef4444', fontWeight: 'normal' }}>
                        ✕ Anulată
                      </span>
                    )}
                    {esteEfectuata && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#10b981', fontWeight: 'normal' }}>
                        ✓ Efectuată
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '0 0 4px', color: '#666', fontSize: '14px' }}>
                    📞 {p.telefon}
                  </p>
                  {p.email && (
                    <p style={{ margin: '0 0 4px', color: '#666', fontSize: '14px' }}>
                      ✉️ {p.email}
                    </p>
                  )}
                  <p style={{ margin: '0 0 4px', color: '#666', fontSize: '14px' }}>
                    📅 {p.data_programare} · ⏰ {p.ora_start.slice(0, 5)} — {p.ora_sfarsit.slice(0, 5)}
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
                    ✂️ {p.programari_servicii.map(ps => ps.servicii.nume).join(', ')} · {p.durata_totala} min
                  </p>
                </div>

                {!esteAnulata && !esteEfectuata && (
                  <button
                    onClick={() => anuleazaProgramare(p.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #ef4444',
                      backgroundColor: '#fff',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Anulează
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminPanel