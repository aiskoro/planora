import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import SelectOra from './SelectOra'

const LUNI_RO = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie']
const ZILE_RO = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum']

const PALETA_CULORI = [
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#D1FAE5', text: '#047857' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#E9D5FF', text: '#7E22CE' },
  { bg: '#FFE4E6', text: '#BE123C' },
  { bg: '#CCFBF1', text: '#0F766E' },
  { bg: '#FFEDD5', text: '#C2410C' },
]

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMonthMatrix(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - firstWeekday)
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    days.push(d)
  }
  return days
}

function getWeekDays(date) {
  const dayIdx = (date.getDay() + 6) % 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - dayIdx)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d)
  }
  return days
}

function calculeazaOraSfarsit(oraStart, durataMinute) {
  const [h, m] = oraStart.split(':').map(Number)
  const start = new Date(2000, 0, 1, h, m)
  const sfarsit = new Date(start.getTime() + durataMinute * 60000)
  const hh = String(sfarsit.getHours()).padStart(2, '0')
  const mm = String(sfarsit.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

async function verificaSuprapunere(frizerId, dataProgramare, oraStart, oraSfarsit) {
  const { data, error } = await supabase
    .from('programari')
    .select('id, nume_client, ora_start, ora_sfarsit')
    .eq('frizer_id', frizerId)
    .eq('data_programare', dataProgramare)
    .neq('status', 'anulata')

  if (error || !data) return null

  for (const p of data) {
    const startExistent = p.ora_start.slice(0, 5)
    const sfarsitExistent = p.ora_sfarsit.slice(0, 5)
    if (oraStart < sfarsitExistent && oraSfarsit > startExistent) return p
  }
  return null
}

const PX_PER_MINUT = 2
const TIME_COL_WIDTH = 44
const DEFAULT_START = 7
const DEFAULT_END = 22
const WEEK_MIN_WIDTH = TIME_COL_WIDTH + 7 * 82

function parseHM(t) {
  const [h, m] = t.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function minuteDelaStart(ora, gridStartH) {
  const [h, m] = ora.slice(0, 5).split(':').map(Number)
  return (h - gridStartH) * 60 + m
}

// Calculeaza plaja orara (ore intregi) dintr-un envelope {startMin, endMin} sau fallback default
function gridDinEnvelope(env) {
  if (!env) return { start: DEFAULT_START, end: DEFAULT_END }
  const start = Math.min(DEFAULT_START, Math.floor(env.startMin / 60))
  const end = Math.max(DEFAULT_END, Math.ceil(env.endMin / 60))
  return { start, end }
}

function oreGridDin(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function AdminPanel({ isMaster, frizerId, frizer, tenantId }) {
  const { T } = useTheme()
  const [programari, setProgramari] = useState([])
  const [auditLogs, setAuditLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtruData, setFiltruData] = useState('')
  const [filtruNume, setFiltruNume] = useState('')
  const [filtruTelefon, setFiltruTelefon] = useState('')
  const [tab, setTab] = useState('active')
  const [hoverExport, setHoverExport] = useState(false)

  const [viewMode, setViewMode] = useState('calendar')
  const [calendarMode, setCalendarMode] = useState('luna')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProgramare, setSelectedProgramare] = useState(null)

  const [orarEnvelope, setOrarEnvelope] = useState({}) // { [zi_saptamana 0-6]: {startMin, endMin} }
  const [servicii, setServicii] = useState([])
  const [modalNouaData, setModalNouaData] = useState(null)
  const [numeNoua, setNumeNoua] = useState('')
  const [telefonNoua, setTelefonNoua] = useState('')
  const [emailNoua, setEmailNoua] = useState('')
  const [oraNoua, setOraNoua] = useState('')
  const [durataNoua, setDurataNoua] = useState('')
  const [selectateNoua, setSelectateNoua] = useState([])
  const [savingNoua, setSavingNoua] = useState(false)
  const [mesajNoua, setMesajNoua] = useState(null)

  const fetchProgramari = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('programari')
      .select(`*, frizeri(nume, tenant_id), programari_servicii(servicii(nume))`)
      .order('data_programare', { ascending: true })
      .order('ora_start', { ascending: true })

    if (!isMaster && frizerId) {
      query = query.eq('frizer_id', frizerId)
    } else if (isMaster && tenantId) {
      const { data: frizeriTenant } = await supabase
        .from('frizeri').select('id').eq('tenant_id', tenantId)
      const ids = (frizeriTenant || []).map(f => f.id)
      if (ids.length === 0) { setProgramari([]); setLoading(false); return }
      query = query.in('frizer_id', ids)
    }

    const { data } = await query
    setProgramari(data || [])

    const { data: logs } = await supabase.from('audit_logs').select('programare_id, anulat_de, tip')
    const logsMap = {}
    for (const log of logs || []) logsMap[log.programare_id] = log
    setAuditLogs(logsMap)
    setLoading(false)
  }, [isMaster, frizerId, tenantId])

  useEffect(() => { fetchProgramari() }, [fetchProgramari])

  useEffect(() => {
    if (!tenantId) return
    supabase
      .from('servicii').select('id, nume').eq('tenant_id', tenantId).eq('activ', true)
      .order('ordine', { ascending: true })
      .then(({ data, error }) => { if (!error) setServicii(data || []) })
  }, [tenantId])

  // Fetch orar (program de lucru) pentru grila dinamica din calendar
  useEffect(() => {
    async function fetchOrar() {
      let ids = []
      if (!isMaster && frizerId) {
        ids = [frizerId]
      } else if (isMaster && tenantId) {
        const { data: frizeriTenant } = await supabase.from('frizeri').select('id').eq('tenant_id', tenantId)
        ids = (frizeriTenant || []).map(f => f.id)
      }
      if (ids.length === 0) { setOrarEnvelope({}); return }

      const { data, error } = await supabase
        .from('orar')
        .select('frizer_id, zi_saptamana, deschis, ora_start, ora_sfarsit')
        .in('frizer_id', ids)
        .eq('deschis', true)

      if (error || !data) { setOrarEnvelope({}); return }

      const env = {}
      for (const r of data) {
        const startMin = parseHM(r.ora_start)
        const endMin = parseHM(r.ora_sfarsit)
        if (!env[r.zi_saptamana]) env[r.zi_saptamana] = { startMin, endMin }
        else {
          env[r.zi_saptamana].startMin = Math.min(env[r.zi_saptamana].startMin, startMin)
          env[r.zi_saptamana].endMin = Math.max(env[r.zi_saptamana].endMin, endMin)
        }
      }
      setOrarEnvelope(env)
    }
    fetchOrar()
  }, [isMaster, frizerId, tenantId])

  async function anuleazaProgramare(id) {
    if (!window.confirm('Sigur vrei sa anulezi aceasta programare?')) return
    const { error } = await supabase.from('programari').update({ status: 'anulata' }).eq('id', id)
    if (error) { alert('Eroare: ' + error.message); return }
    const programare = programari.find(p => p.id === id)
    const numeAnulator = isMaster ? 'admin' : (frizer?.nume || 'frizer')
    await supabase.from('audit_logs').insert({
      programare_id: id, tip: 'anulare_admin', anulat_de: numeAnulator,
      nume_client: programare?.nume_client || '',
      data_programare: programare?.data_programare || null,
      ora_start: programare?.ora_start || null
    })
    setProgramari(prev => prev.map(p => p.id === id ? { ...p, status: 'anulata' } : p))
    setSelectedProgramare(prev => prev && prev.id === id ? { ...prev, status: 'anulata' } : prev)
  }

  function reseteazaFiltre() { setFiltruData(''); setFiltruNume(''); setFiltruTelefon('') }

  function exportCSV() {
    const header = ['Nume client', 'Telefon', 'Email', 'Data', 'Ora start', 'Ora sfarsit', 'Angajat', 'Servicii', 'Durata (min)', 'Status', 'Comentarii']
    const randuri = programari.map(p => {
      const azi = new Date().toISOString().split('T')[0]
      const esteAnulata = p.status === 'anulata'
      const esteEfectuata = p.data_programare < azi && !esteAnulata
      const status = esteAnulata
        ? `Anulata${auditLogs[p.id] ? ` de ${auditLogs[p.id].anulat_de}` : ''}`
        : esteEfectuata ? 'Efectuata' : 'Confirmata'
      return [
        p.nume_client || '', p.telefon || '', p.email || '', p.data_programare || '',
        p.ora_start ? p.ora_start.slice(0, 5) : '', p.ora_sfarsit ? p.ora_sfarsit.slice(0, 5) : '',
        p.frizeri?.nume || '', p.programari_servicii.map(ps => ps.servicii.nume).join(' | '),
        p.durata_totala || '', status, p.comentarii || '',
      ]
    })
    const scapa = val => {
      const str = String(val)
      return (str.includes(',') || str.includes('"') || str.includes('\n'))
        ? `"${str.replace(/"/g, '""')}"` : str
    }
    const csv = [header, ...randuri].map(rand => rand.map(scapa).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `programari_timevia_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const azi = new Date().toISOString().split('T')[0]
  const programariActive = programari.filter(p => p.data_programare >= azi && p.status !== 'anulata')
  const programariIstoricRaw = programari.filter(p => p.data_programare < azi || p.status === 'anulata')
  const programariIstoric = [...programariIstoricRaw].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
  const listaCurenta = tab === 'active' ? programariActive : programariIstoric
  const programariFiltrate = listaCurenta.filter(p => {
    const potrivireData = filtruData ? p.data_programare === filtruData : true
    const potrivireNume = filtruNume ? p.nume_client.toLowerCase().includes(filtruNume.toLowerCase()) : true
    const potrivireTelefon = filtruTelefon ? p.telefon === filtruTelefon : true
    return potrivireData && potrivireNume && potrivireTelefon
  })
  const areFiltre = filtruData || filtruNume || filtruTelefon

  const serviciuColorMap = useMemo(() => {
    const nume = new Set()
    programari.forEach(p => {
      const prim = p.programari_servicii?.[0]?.servicii?.nume
      if (prim) nume.add(prim)
    })
    const sortate = [...nume].sort()
    const map = {}
    sortate.forEach((n, i) => { map[n] = PALETA_CULORI[i % PALETA_CULORI.length] })
    return map
  }, [programari])

  function culoareProgramare(p) {
    const prim = p.programari_servicii?.[0]?.servicii?.nume
    return serviciuColorMap[prim] || PALETA_CULORI[0]
  }

  const programariPeZi = useMemo(() => {
    const map = {}
    for (const p of programari) {
      if (!map[p.data_programare]) map[p.data_programare] = []
      map[p.data_programare].push(p)
    }
    for (const zi in map) map[zi].sort((a, b) => a.ora_start.localeCompare(b.ora_start))
    return map
  }, [programari])

  const zileAfisate = getMonthMatrix(currentDate)
  const aziStr = toDateStr(new Date())

  function navigheaza(directie) {
    const nou = new Date(currentDate)
    if (calendarMode === 'luna') nou.setMonth(nou.getMonth() + directie)
    else if (calendarMode === 'saptamana') nou.setDate(nou.getDate() + directie * 7)
    else nou.setDate(nou.getDate() + directie)
    setCurrentDate(nou)
  }

  function mergiLaAzi() { setCurrentDate(new Date()) }

  function deschideModalNoua(dStr) {
    setNumeNoua(''); setTelefonNoua(''); setEmailNoua('')
    setOraNoua(''); setDurataNoua(''); setSelectateNoua([]); setMesajNoua(null)
    setModalNouaData(dStr)
  }

  function inchideModalNoua() { setModalNouaData(null) }

  function toggleServiciuNoua(id) {
    setSelectateNoua(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function salveazaProgramareNoua(e) {
    e.preventDefault()
    setMesajNoua(null)
    if (!numeNoua || !oraNoua || !durataNoua) {
      setMesajNoua({ tip: 'eroare', text: 'Completeaza toate campurile obligatorii.' }); return
    }
    if (selectateNoua.length === 0) {
      setMesajNoua({ tip: 'eroare', text: 'Selecteaza cel putin un serviciu.' }); return
    }
    if (!frizerId) {
      setMesajNoua({ tip: 'eroare', text: 'Nu s-a putut identifica angajatul logat.' }); return
    }
    const acumNoua = new Date()
    const dataProgramareNoua = new Date(`${modalNouaData}T${oraNoua}:00`)
    if (dataProgramareNoua < acumNoua) {
      setMesajNoua({ tip: 'eroare', text: '⚠️ Nu poți programa în trecut. Alege o oră viitoare.' }); return
    }
    setSavingNoua(true)
    try {
      const durataNum = parseInt(durataNoua, 10)
      const oraSfarsit = calculeazaOraSfarsit(oraNoua, durataNum)
      const conflict = await verificaSuprapunere(frizerId, modalNouaData, oraNoua, oraSfarsit)
      if (conflict) {
        setMesajNoua({ tip: 'eroare', text: `⚠️ Suprapunere cu ${conflict.nume_client} (${conflict.ora_start.slice(0, 5)}–${conflict.ora_sfarsit.slice(0, 5)}). Alege altă oră.` })
        setSavingNoua(false); return
      }
      const cancelToken = crypto.randomUUID()
      const { data: programare, error: errProgramare } = await supabase
        .from('programari')
        .insert({ frizer_id: frizerId, nume_client: numeNoua, telefon: telefonNoua || null, email: emailNoua || null, data_programare: modalNouaData, ora_start: oraNoua, ora_sfarsit: oraSfarsit, durata_totala: durataNum, status: 'confirmata', cancel_token: cancelToken })
        .select().single()
      if (errProgramare) throw errProgramare
      const { error: errServicii } = await supabase.from('programari_servicii')
        .insert(selectateNoua.map(serviciuId => ({ programare_id: programare.id, serviciu_id: serviciuId })))
      if (errServicii) throw errServicii
      await fetchProgramari()
      setMesajNoua({ tip: 'succes', text: 'Programare adaugata cu succes!' })
      setTimeout(() => { setModalNouaData(null) }, 900)
    } catch (err) {
      console.error(err)
      setMesajNoua({ tip: 'eroare', text: 'A aparut o eroare la salvare. Incearca din nou.' })
    } finally {
      setSavingNoua(false)
    }
  }

  // Stiluri reutilizabile
  const stilInput = {
    padding: '8px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`,
    background: T.surface2, color: T.text, fontSize: '14px', outline: 'none',
    transition: T.transition, boxSizing: 'border-box',
  }
  const inputStyleModal = {
    width: '100%', padding: '12px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`,
    background: T.surface2, color: T.text, fontSize: '15px', outline: 'none',
    transition: T.transition, boxSizing: 'border-box',
  }
  const labelStyleModal = {
    display: 'block', fontSize: '13px', fontWeight: '500',
    marginBottom: '6px', marginTop: '14px', color: T.muted,
  }
  const btnToggle = (activ) => ({
    padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: activ ? '600' : '400',
    background: activ ? T.surface : 'transparent',
    color: activ ? T.accent : T.muted,
    transition: T.transition, boxShadow: activ ? T.shadowCard : 'none',
    whiteSpace: 'nowrap',
  })

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Se incarca...</div>

  return (
    <div>
      {/* ---- Toggle Lista / Calendar ---- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', background: T.surface2, borderRadius: '10px', padding: '4px' }}>
          {[{ key: 'calendar', label: '📅 Calendar' }, { key: 'lista', label: '📋 Listă' }].map(v => (
            <button key={v.key} onClick={() => setViewMode(v.key)} style={btnToggle(viewMode === v.key)}>{v.label}</button>
          ))}
        </div>
        {isMaster && viewMode === 'lista' && (
          <button
            onClick={exportCSV}
            onMouseEnter={() => setHoverExport(true)}
            onMouseLeave={() => setHoverExport(false)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: hoverExport ? T.surface2 : T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: T.transition, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            ⬇️ Export CSV
          </button>
        )}
      </div>

      {viewMode === 'calendar' ? (
        <div>
          {/* ---- Bara control calendar ---- */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            {/* Selectori mod */}
            <div style={{ display: 'flex', gap: '6px', background: T.surface2, borderRadius: '10px', padding: '4px' }}>
              {[{ key: 'zi', label: 'Zi' }, { key: 'saptamana', label: 'Săpt.' }, { key: 'luna', label: 'Lună' }].map(v => (
                <button key={v.key} onClick={() => setCalendarMode(v.key)}
                  style={{ ...btnToggle(calendarMode === v.key), padding: '6px 12px', fontSize: '13px' }}>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Navigare */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={mergiLaAzi} style={{ padding: '7px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>Astăzi</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => navigheaza(-1)} style={{ padding: '7px 10px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px' }}>‹</button>
                <span style={{ fontSize: '14px', fontWeight: '700', color: T.text, minWidth: '130px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {calendarMode === 'luna'
                    ? `${LUNI_RO[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    : calendarMode === 'saptamana'
                    ? (() => { const w = getWeekDays(currentDate); return `${w[0].getDate()} ${LUNI_RO[w[0].getMonth()].slice(0,3)} — ${w[6].getDate()} ${LUNI_RO[w[6].getMonth()].slice(0,3)}` })()
                    : `${currentDate.getDate()} ${LUNI_RO[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </span>
                <button onClick={() => navigheaza(1)} style={{ padding: '7px 10px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px' }}>›</button>
              </div>
            </div>
          </div>

          {/* ---- VIEW ZI ---- */}
          {calendarMode === 'zi' && (() => {
            const dStr = toDateStr(currentDate)
            const programariZi = (programariPeZi[dStr] || []).filter(p => p.status !== 'anulata')
            const esteAziVizualizata = dStr === aziStr

            const ziSaptamanaJS = currentDate.getDay() // 0=Dum...6=Sam, match coloana orar
            const { start: ORA_START_GRID, end: ORA_END_GRID } = gridDinEnvelope(orarEnvelope[ziSaptamanaJS])
            const TOTAL_MINUTE = (ORA_END_GRID - ORA_START_GRID) * 60
            const ORE_GRID = oreGridDin(ORA_START_GRID, ORA_END_GRID)

            const acum = new Date()
            const acumMinute = (acum.getHours() - ORA_START_GRID) * 60 + acum.getMinutes()

            let programareCurenta = null
            let programareUrmatoare = null
            if (esteAziVizualizata) {
              for (const p of programariZi) {
                const start = minuteDelaStart(p.ora_start, ORA_START_GRID)
                const end = minuteDelaStart(p.ora_sfarsit, ORA_START_GRID)
                if (acumMinute >= start && acumMinute < end) programareCurenta = p
                else if (acumMinute < start && !programareUrmatoare) programareUrmatoare = p
              }
            }

            const intervaleLibere = []
            for (let i = 0; i < programariZi.length - 1; i++) {
              const sfarsitCurent = minuteDelaStart(programariZi[i].ora_sfarsit, ORA_START_GRID)
              const startUrmator = minuteDelaStart(programariZi[i + 1].ora_start, ORA_START_GRID)
              const gap = startUrmator - sfarsitCurent
              if (gap >= 15) intervaleLibere.push({ top: sfarsitCurent * PX_PER_MINUT, height: gap * PX_PER_MINUT, minute: gap })
            }

            return (
              <div onClick={() => deschideModalNoua(dStr)} title="Click pe zona libera pentru programare noua" style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: `${TOTAL_MINUTE * PX_PER_MINUT}px`, borderRadius: '12px', border: `0.5px solid ${T.border}`, background: T.surface2, overflow: 'hidden' }}>
                  {/* Linii orare */}
                  {ORE_GRID.map(h => (
                    <div key={h} style={{ position: 'absolute', top: (h - ORA_START_GRID) * 60 * PX_PER_MINUT, left: 0, right: 0, borderTop: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', color: T.muted, padding: '2px 8px', background: T.surface2, lineHeight: 1, userSelect: 'none' }}>{String(h).padStart(2, '0')}:00</span>
                    </div>
                  ))}

                  {/* Intervale libere */}
                  {intervaleLibere.map((interval, i) => (
                    <div key={i} style={{ position: 'absolute', top: interval.top, left: '52px', right: '8px', height: interval.height, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ fontSize: '11px', color: T.muted, background: T.surface, padding: '2px 10px', borderRadius: '20px', border: `0.5px dashed ${T.border}`, opacity: 0.8, userSelect: 'none' }}>
                        liber {interval.minute} min
                      </span>
                    </div>
                  ))}

                  {/* Linie ora curenta */}
                  {esteAziVizualizata && acumMinute >= 0 && acumMinute <= TOTAL_MINUTE && (
                    <div style={{ position: 'absolute', top: acumMinute * PX_PER_MINUT, left: '52px', right: 0, height: '2px', background: T.accent, zIndex: 3, pointerEvents: 'none' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: T.accent }} />
                    </div>
                  )}

                  {/* Blocuri programari */}
                  {programariZi.map(p => {
                    const isCurenta = programareCurenta?.id === p.id
                    const isUrmatoarea = programareUrmatoare?.id === p.id
                    const minutStart = minuteDelaStart(p.ora_start, ORA_START_GRID)
                    const minutEnd = minuteDelaStart(p.ora_sfarsit, ORA_START_GRID)
                    const top = Math.max(0, minutStart * PX_PER_MINUT)
                    const height = Math.max(20, (minutEnd - minutStart) * PX_PER_MINUT)
                    const culoare = culoareProgramare(p)
                    return (
                      <div
                        key={p.id}
                        onClick={e => { e.stopPropagation(); setSelectedProgramare(p) }}
                        style={{ position: 'absolute', top, left: '52px', right: '8px', height, borderRadius: '8px', background: culoare.bg, borderLeft: `3px solid ${culoare.text}`, padding: '4px 8px', cursor: 'pointer', overflow: 'hidden', boxSizing: 'border-box', zIndex: isCurenta ? 2 : 1, boxShadow: isCurenta ? `0 0 0 2px ${culoare.text}, 0 2px 10px rgba(0,0,0,0.15)` : isUrmatoarea ? `0 0 0 1.5px ${culoare.text}80` : 'none' }}
                      >
                        {(isCurenta || isUrmatoarea) && (
                          <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '9px', fontWeight: '700', color: culoare.text, background: culoare.bg, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${culoare.text}`, opacity: 0.95, userSelect: 'none' }}>
                            {isCurenta ? '● ACUM' : '▷ URMĂTOR'}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', fontWeight: '700', color: culoare.text, lineHeight: 1.3 }}>{p.ora_start.slice(0, 5)}–{p.ora_sfarsit.slice(0, 5)}</div>
                        {height > 30 && <div style={{ fontSize: '12px', color: culoare.text, opacity: 0.85, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nume_client}</div>}
                        {height > 48 && <div style={{ fontSize: '11px', color: culoare.text, opacity: 0.7, lineHeight: 1.3 }}>{p.programari_servicii.map(ps => ps.servicii.nume).join(', ')}</div>}
                      </div>
                    )
                  })}
                </div>
                {programariZi.length === 0 && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: T.muted, fontSize: '14px', pointerEvents: 'none', textAlign: 'center' }}>
                    Nicio programare.<br /><span style={{ fontSize: '12px' }}>Click oriunde pentru a adăuga una.</span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ---- VIEW SAPTAMANA — scroll orizontal pe mobile ---- */}
          {calendarMode === 'saptamana' && (() => {
            const weekDays = getWeekDays(currentDate)

            // Envelope global pe toata saptamana afisata (min start / max end din zilele cu orar)
            let envStart = null, envEnd = null
            for (const d of weekDays) {
              const e = orarEnvelope[d.getDay()]
              if (e) {
                envStart = envStart === null ? e.startMin : Math.min(envStart, e.startMin)
                envEnd = envEnd === null ? e.endMin : Math.max(envEnd, e.endMin)
              }
            }
            const { start: ORA_START_GRID, end: ORA_END_GRID } = gridDinEnvelope(
              envStart !== null ? { startMin: envStart, endMin: envEnd } : null
            )
            const TOTAL_MINUTE = (ORA_END_GRID - ORA_START_GRID) * 60
            const ORE_GRID = oreGridDin(ORA_START_GRID, ORA_END_GRID)

            return (
              // Wrapper cu overflow orizontal — pe mobile se scrolleaza, pe desktop nu e necesar
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: `0.5px solid ${T.border}` }}>
                <div style={{ minWidth: `${WEEK_MIN_WIDTH}px` }}>
                  {/* Header */}
                  <div style={{ display: 'flex', borderBottom: `0.5px solid ${T.border}`, background: T.surface2 }}>
                    <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
                    {weekDays.map((d, i) => {
                      const dStr = toDateStr(d)
                      const esteAzi = dStr === aziStr
                      return (
                        <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderLeft: `0.5px solid ${T.border}`, background: esteAzi ? T.accentSoft : 'transparent' }}>
                          <div style={{ fontSize: '11px', color: T.muted, fontWeight: '500' }}>{ZILE_RO[i]}</div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: esteAzi ? T.accent : T.text, lineHeight: 1.3 }}>{d.getDate()}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Corp */}
                  <div style={{ display: 'flex', maxHeight: '620px', overflowY: 'auto' }}>
                    {/* Coloana ore */}
                    <div style={{ width: TIME_COL_WIDTH, flexShrink: 0, position: 'relative', height: `${TOTAL_MINUTE * PX_PER_MINUT}px`, background: T.surface2, borderRight: `0.5px solid ${T.border}` }}>
                      {ORE_GRID.map(h => (
                        <div key={h} style={{ position: 'absolute', top: (h - ORA_START_GRID) * 60 * PX_PER_MINUT, left: 0, right: 0 }}>
                          <span style={{ fontSize: '10px', color: T.muted, padding: '1px 4px', display: 'block', textAlign: 'right', lineHeight: 1, userSelect: 'none' }}>{String(h).padStart(2, '0')}:00</span>
                        </div>
                      ))}
                    </div>

                    {/* Coloane zile */}
                    {weekDays.map((d, i) => {
                      const dStr = toDateStr(d)
                      const programariZi = (programariPeZi[dStr] || []).filter(p => p.status !== 'anulata')
                      const esteAzi = dStr === aziStr
                      return (
                        <div key={i} onClick={() => deschideModalNoua(dStr)} title="Click pentru programare nouă" style={{ flex: 1, position: 'relative', height: `${TOTAL_MINUTE * PX_PER_MINUT}px`, borderLeft: `0.5px solid ${T.border}`, background: esteAzi ? T.accentSoft : T.surface2, cursor: 'pointer', minWidth: 0 }}>
                          {ORE_GRID.map(h => (
                            <div key={h} style={{ position: 'absolute', top: (h - ORA_START_GRID) * 60 * PX_PER_MINUT, left: 0, right: 0, borderTop: `0.5px solid ${T.border}`, pointerEvents: 'none' }} />
                          ))}
                          {programariZi.map(p => {
                            const minutStart = minuteDelaStart(p.ora_start, ORA_START_GRID)
                            const minutEnd = minuteDelaStart(p.ora_sfarsit, ORA_START_GRID)
                            const top = Math.max(0, minutStart * PX_PER_MINUT)
                            const height = Math.max(16, (minutEnd - minutStart) * PX_PER_MINUT)
                            const culoare = culoareProgramare(p)
                            return (
                              <div key={p.id} onClick={e => { e.stopPropagation(); setSelectedProgramare(p) }}
                                style={{ position: 'absolute', top, left: '2px', right: '2px', height, borderRadius: '6px', background: culoare.bg, borderLeft: `3px solid ${culoare.text}`, padding: '2px 4px', cursor: 'pointer', overflow: 'hidden', boxSizing: 'border-box', zIndex: 1 }}>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: culoare.text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.ora_start.slice(0, 5)}</div>
                                {height > 28 && <div style={{ fontSize: '10px', color: culoare.text, opacity: 0.85, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nume_client}</div>}
                                {height > 48 && <div style={{ fontSize: '10px', color: culoare.text, opacity: 0.7, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.programari_servicii.map(ps => ps.servicii.nume).join(', ')}</div>}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ---- VIEW LUNA ---- */}
          {calendarMode === 'luna' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                {ZILE_RO.map(zi => (
                  <div key={zi} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: T.muted, padding: '4px 0' }}>{zi}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {zileAfisate.map((d, idx) => {
                  const dStr = toDateStr(d)
                  const esteLunaCurenta = d.getMonth() === currentDate.getMonth()
                  const esteAzi = dStr === aziStr
                  const eventeZi = (programariPeZi[dStr] || [])
                  const eventeAfisate = eventeZi.slice(0, 3)
                  const eventeInPlus = eventeZi.length - eventeAfisate.length
                  return (
                    <div key={idx} onClick={() => deschideModalNoua(dStr)} title="Click pentru o programare noua"
                      style={{ minHeight: '80px', borderRadius: '8px', border: `0.5px solid ${esteAzi ? T.accent : T.border}`, background: esteLunaCurenta ? T.surface2 : T.surface, padding: '6px', opacity: esteLunaCurenta ? 1 : 0.4, display: 'flex', flexDirection: 'column', gap: '3px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px', fontWeight: esteAzi ? '700' : '500', color: esteAzi ? T.accent : T.muted }}>{d.getDate()}</span>
                      {eventeAfisate.map(p => {
                        const culoare = culoareProgramare(p)
                        const esteAnulata = p.status === 'anulata'
                        return (
                          <div key={p.id} onClick={e => { e.stopPropagation(); setSelectedProgramare(p) }}
                            style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '5px', cursor: 'pointer', background: esteAnulata ? T.dangerSoft : culoare.bg, color: esteAnulata ? T.danger : culoare.text, textDecoration: esteAnulata ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={`${p.ora_start.slice(0, 5)} — ${p.nume_client}`}>
                            {p.ora_start.slice(0, 5)} {p.nume_client}
                          </div>
                        )
                      })}
                      {eventeInPlus > 0 && <span style={{ fontSize: '10px', color: T.muted }}>+{eventeInPlus}</span>}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ---- VIEW LISTA ---- */
        <div>
          {/* Tabs Active / Istoric */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', background: T.surface2, borderRadius: '10px', padding: '4px' }}>
              {[{ key: 'active', label: `Active (${programariActive.length})` }, { key: 'istoric', label: `Istoric (${programariIstoric.length})` }].map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); reseteazaFiltre() }} style={btnToggle(tab === t.key)}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Filtre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '12px 14px', background: T.surface2, borderRadius: '12px', border: `0.5px solid ${T.border}` }}>
            <input type="date" value={filtruData} onChange={e => setFiltruData(e.target.value)}
              style={{ ...stilInput, flex: '1 1 130px', minWidth: '130px' }} />
            <input type="text" placeholder="Caută după nume..." value={filtruNume} onChange={e => setFiltruNume(e.target.value)}
              style={{ ...stilInput, flex: '2 1 160px', minWidth: '140px' }} />
            <input type="tel" placeholder="Telefon" value={filtruTelefon} onChange={e => setFiltruTelefon(e.target.value)}
              style={{ ...stilInput, flex: '1 1 130px', minWidth: '130px' }} />
            {areFiltre && (
              <button onClick={reseteazaFiltre} style={{ padding: '8px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px', transition: T.transition, whiteSpace: 'nowrap' }}>Resetează</button>
            )}
            <span style={{ color: T.muted, fontSize: '12px', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{programariFiltrate.length} programări</span>
          </div>

          {/* Lista programari */}
          {programariFiltrate.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: '15px' }}>Nu există programări.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {programariFiltrate.map(p => {
                const esteAnulata = p.status === 'anulata'
                const esteEfectuata = p.data_programare < azi && !esteAnulata
                return (
                  <div key={p.id} style={{ padding: '14px 16px', borderRadius: '12px', border: `0.5px solid ${esteAnulata ? 'rgba(239,68,68,0.2)' : T.border}`, background: esteAnulata ? T.dangerSoft : T.surface2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', opacity: tab === 'istoric' ? 0.85 : 1, transition: T.transition }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Linia 1: nume + badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '600', fontSize: '15px', color: T.text }}>{p.nume_client}</span>
                        {isMaster && p.frizeri && (
                          <span style={{ fontSize: '11px', color: T.accent, background: T.accentSoft, padding: '2px 8px', borderRadius: '20px', fontWeight: '500', border: `0.5px solid ${T.border}`, whiteSpace: 'nowrap' }}>{p.frizeri.nume}</span>
                        )}
                        {esteAnulata && (
                          <span style={{ fontSize: '11px', color: T.danger, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                            Anulată {auditLogs[p.id] ? `· de ${auditLogs[p.id].anulat_de}` : ''}
                          </span>
                        )}
                        {esteEfectuata && (
                          <span style={{ fontSize: '11px', color: T.success, background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>Efectuată</span>
                        )}
                      </div>
                      {/* Linia 2: detalii */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
                        {p.telefon && <span style={{ fontSize: '13px', color: T.muted }}>📞 {p.telefon}</span>}
                        {p.email && <span style={{ fontSize: '13px', color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis' }}>✉️ {p.email}</span>}
                        <span style={{ fontSize: '13px', color: T.muted, whiteSpace: 'nowrap' }}>📅 {p.data_programare} · {p.ora_start.slice(0, 5)}–{p.ora_sfarsit.slice(0, 5)}</span>
                        <span style={{ fontSize: '13px', color: T.muted }}>✂️ {p.programari_servicii.map(ps => ps.servicii.nume).join(', ')} · {p.durata_totala} min</span>
                      </div>
                      {p.comentarii && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', background: T.surface, border: `0.5px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ fontSize: '13px' }}>💬</span>
                          <span style={{ fontSize: '13px', color: T.muted, fontStyle: 'italic', lineHeight: '1.5' }}>{p.comentarii}</span>
                        </div>
                      )}
                    </div>
                    {!esteAnulata && !esteEfectuata && (
                      <button onClick={() => anuleazaProgramare(p.id)} style={{ padding: '7px 12px', borderRadius: '8px', border: `0.5px solid ${T.danger}`, background: T.dangerSoft, color: T.danger, cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', transition: T.transition, flexShrink: 0 }}>Anulează</button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ---- Popup detalii programare ---- */}
      {selectedProgramare && (
        <div onClick={() => setSelectedProgramare(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: T.shadowCard, border: `0.5px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '17px', fontWeight: '700', color: T.text }}>{selectedProgramare.nume_client}</span>
              <button onClick={() => setSelectedProgramare(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: '18px', padding: 0 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {isMaster && selectedProgramare.frizeri && <span style={{ fontSize: '13px', color: T.muted }}>👤 {selectedProgramare.frizeri.nume}</span>}
              {selectedProgramare.telefon && <span style={{ fontSize: '13px', color: T.muted }}>📞 {selectedProgramare.telefon}</span>}
              {selectedProgramare.email && <span style={{ fontSize: '13px', color: T.muted }}>✉️ {selectedProgramare.email}</span>}
              <span style={{ fontSize: '13px', color: T.muted }}>📅 {selectedProgramare.data_programare} · {selectedProgramare.ora_start.slice(0, 5)}–{selectedProgramare.ora_sfarsit.slice(0, 5)}</span>
              <span style={{ fontSize: '13px', color: T.muted }}>✂️ {selectedProgramare.programari_servicii.map(ps => ps.servicii.nume).join(', ')} · {selectedProgramare.durata_totala} min</span>
              {selectedProgramare.status === 'anulata' && (
                <span style={{ fontSize: '12px', color: T.danger, background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: '500', width: 'fit-content' }}>
                  Anulată {auditLogs[selectedProgramare.id] ? `· de ${auditLogs[selectedProgramare.id].anulat_de}` : ''}
                </span>
              )}
              {selectedProgramare.comentarii && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: T.surface2, border: `0.5px solid ${T.border}` }}>
                  <span style={{ fontSize: '13px', color: T.muted, fontStyle: 'italic' }}>💬 {selectedProgramare.comentarii}</span>
                </div>
              )}
            </div>
            {selectedProgramare.status !== 'anulata' && selectedProgramare.data_programare >= azi && (
              <button onClick={() => anuleazaProgramare(selectedProgramare.id)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `0.5px solid ${T.danger}`, background: T.dangerSoft, color: T.danger, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                Anulează programarea
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- Popup "Programare noua" ---- */}
      {modalNouaData && (
        <div onClick={inchideModalNoua} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '0' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: '24px 20px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: T.shadowCard, border: `0.5px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '17px', fontWeight: '700', color: T.text }}>Programare nouă</span>
              <button onClick={inchideModalNoua} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: '18px', padding: 0 }}>✕</button>
            </div>
            <span style={{ fontSize: '13px', color: T.muted }}>📅 {modalNouaData}</span>

            <form onSubmit={salveazaProgramareNoua}>
              <label style={labelStyleModal}>Nume client *</label>
              <input style={inputStyleModal} value={numeNoua} onChange={e => setNumeNoua(e.target.value)} placeholder="Ex: Maria Popescu" />

              <label style={labelStyleModal}>Telefon (opțional)</label>
              <input style={inputStyleModal} value={telefonNoua} onChange={e => setTelefonNoua(e.target.value)} placeholder="07xx xxx xxx" />

              <label style={labelStyleModal}>Email (opțional)</label>
              <input style={inputStyleModal} type="email" value={emailNoua} onChange={e => setEmailNoua(e.target.value)} placeholder="client@email.com" />

              <label style={labelStyleModal}>Ora start *</label>
              <SelectOra style={inputStyleModal} value={oraNoua} onChange={val => setOraNoua(val)} />

              <label style={labelStyleModal}>Durata (minute) *</label>
              <input style={inputStyleModal} type="number" min="1" value={durataNoua} onChange={e => setDurataNoua(e.target.value)} placeholder="Ex: 45" />

              <label style={labelStyleModal}>Servicii *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', padding: '14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface2 }}>
                {servicii.length === 0 && <span style={{ fontSize: '13px', color: T.muted }}>Nu există servicii configurate.</span>}
                {servicii.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: T.text, cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={selectateNoua.includes(s.id)} onChange={() => toggleServiciuNoua(s.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    {s.nume}
                  </label>
                ))}
              </div>

              <button type="submit" disabled={savingNoua} style={{ marginTop: '20px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '15px', fontWeight: '600', cursor: savingNoua ? 'wait' : 'pointer', boxShadow: T.shadow, transition: T.transition }}>
                {savingNoua ? 'Se salvează...' : 'Salvează programarea'}
              </button>

              {mesajNoua && (
                <p style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', background: mesajNoua.tip === 'succes' ? T.accentSoft : T.dangerSoft, color: mesajNoua.tip === 'succes' ? T.accent : T.danger }}>
                  {mesajNoua.text}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel