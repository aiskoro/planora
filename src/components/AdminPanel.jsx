import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function AdminPanel({ isMaster, frizerId, frizer }) {
  const [programari, setProgramari] = useState([])
  const [auditLogs, setAuditLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtruData, setFiltruData] = useState('')
  const [filtruNume, setFiltruNume] = useState('')
  const [filtruTelefon, setFiltruTelefon] = useState('')
  const [tab, setTab] = useState('active')

  const fetchProgramari = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('programari')
      .select(`*, frizeri(nume), programari_servicii(servicii(nume))`)
      .order('data_programare', { ascending: true })
      .order('ora_start', { ascending: true })

    if (!isMaster && frizerId) {
      query = query.eq('frizer_id', frizerId)
    }

    const { data } = await query
    setProgramari(data || [])

    // Fetch audit logs pentru programarile anulate
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('programare_id, anulat_de, tip')

    const logsMap = {}
    for (const log of logs || []) {
      logsMap[log.programare_id] = log
    }
    setAuditLogs(logsMap)

    setLoading(false)
  }, [isMaster, frizerId])

  useEffect(() => {
    fetchProgramari()
  }, [fetchProgramari])

  async function anuleazaProgramare(id) {
    if (!window.confirm('Sigur vrei sa anulezi aceasta programare?')) return

    const { error } = await supabase
      .from('programari')
      .update({ status: 'anulata' })
      .eq('id', id)

    if (error) { alert('Eroare: ' + error.message); return }

    // Audit log
    const programare = programari.find(p => p.id === id)
    const numeAnulator = isMaster ? 'admin' : (frizer?.nume || 'frizer')
    await supabase.from('audit_logs').insert({
      programare_id: id,
      tip: 'anulare_admin',
      anulat_de: numeAnulator,
      nume_client: programare?.nume_client || '',
      data_programare: programare?.data_programare || null,
      ora_start: programare?.ora_start || null,
    })

    setProgramari(prev => prev.map(p => p.id === id ? { ...p, status: 'anulata' } : p))
  }

  function reseteazaFiltre() {
    setFiltruData('')
    setFiltruNume('')
    setFiltruTelefon('')
  }

  const azi = new Date().toISOString().split('T')[0]
  const programariActive = programari.filter(p => p.data_programare >= azi && p.status !== 'anulata')
  const programariIstoricRaw = programari.filter(p => p.data_programare < azi || p.status === 'anulata')
  const programariIstoric = [...programariIstoricRaw].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at)
    const dateB = new Date(b.updated_at || b.created_at)
    return dateB - dateA
  })
  const listaCurenta = tab === 'active' ? programariActive : programariIstoric

  const programariFiltrate = listaCurenta.filter(p => {
    const potrivireData = filtruData ? p.data_programare === filtruData : true
    const potrivireNume = filtruNume ? p.nume_client.toLowerCase().includes(filtruNume.toLowerCase()) : true
    const potrivireTelefon = filtruTelefon ? p.telefon === filtruTelefon : true
    return potrivireData && potrivireNume && potrivireTelefon
  })

  const areFiltre = filtruData || filtruNume || filtruTelefon

  const stilInput = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `0.5px solid ${T.border}`,
    background: T.surface2,
    color: T.text,
    fontSize: '14px',
    outline: 'none',
    transition: T.transition,
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>
      Se incarca...
    </div>
  )

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '20px',
        background: T.surface2,
        borderRadius: '10px',
        padding: '4px',
        width: 'fit-content',
      }}>
        {[
          { key: 'active', label: `Active (${programariActive.length})` },
          { key: 'istoric', label: `Istoric (${programariIstoric.length})` },
        ].map(t => {
          const activ = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); reseteazaFiltre() }}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activ ? '600' : '400',
                background: activ ? T.surface : 'transparent',
                color: activ ? T.accent : T.muted,
                transition: T.transition,
                boxShadow: activ ? T.shadowCard : 'none',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        padding: '14px 16px',
        background: T.surface2,
        borderRadius: '12px',
        border: `0.5px solid ${T.border}`,
      }}>
        <input type="date" value={filtruData} onChange={e => setFiltruData(e.target.value)} style={{ ...stilInput, width: '150px' }} />
        <input type="text" placeholder="Cauta dupa nume..." value={filtruNume} onChange={e => setFiltruNume(e.target.value)} style={{ ...stilInput, width: '160px' }} />
        <input type="tel" placeholder="Numar telefon" value={filtruTelefon} onChange={e => setFiltruTelefon(e.target.value)} style={{ ...stilInput, width: '150px' }} />
        {areFiltre && (
          <button onClick={reseteazaFiltre} style={{ padding: '8px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', transition: T.transition }}>
            Reseteaza
          </button>
        )}
        <span style={{ color: T.muted, fontSize: '13px', marginLeft: 'auto' }}>
          {programariFiltrate.length} programari
        </span>
      </div>

      {programariFiltrate.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: '15px' }}>
          Nu exista programari.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {programariFiltrate.map(p => {
            const esteAnulata = p.status === 'anulata'
            const esteEfectuata = p.data_programare < azi && !esteAnulata
            return (
              <div
                key={p.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: `0.5px solid ${esteAnulata ? 'rgba(239,68,68,0.2)' : T.border}`,
                  background: esteAnulata ? T.dangerSoft : T.surface2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: tab === 'istoric' ? 0.85 : 1,
                  transition: T.transition,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: T.text }}>
                      {p.nume_client}
                    </span>
                    {isMaster && p.frizeri && (
                      <span style={{
                        fontSize: '11px',
                        color: T.accent,
                        background: T.accentSoft,
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        border: `0.5px solid ${T.border}`,
                      }}>
                        {p.frizeri.nume}
                      </span>
                    )}
                    {esteAnulata && (
                      <span style={{ fontSize: '11px', color: T.danger, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>
                        Anulata {auditLogs[p.id] ? `· de ${auditLogs[p.id].anulat_de}` : ''}
                      </span>
                    )}
                    {esteEfectuata && (
                      <span style={{ fontSize: '11px', color: T.success, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>
                        Efectuata
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: T.muted }}>📞 {p.telefon}</span>
                    {p.email && <span style={{ fontSize: '13px', color: T.muted }}>✉️ {p.email}</span>}
                    <span style={{ fontSize: '13px', color: T.muted }}>📅 {p.data_programare} · {p.ora_start.slice(0, 5)} — {p.ora_sfarsit.slice(0, 5)}</span>
                    <span style={{ fontSize: '13px', color: T.muted }}>✂️ {p.programari_servicii.map(ps => ps.servicii.nume).join(', ')} · {p.durata_totala} min</span>
                  </div>
                </div>
                {!esteAnulata && !esteEfectuata && (
                  <button
                    onClick={() => anuleazaProgramare(p.id)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: `0.5px solid ${T.danger}`, background: T.dangerSoft, color: T.danger, cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', transition: T.transition, flexShrink: 0 }}
                  >
                    Anuleaza
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