import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

function Statistici({ tenantId }) {
  const { T } = useTheme()
  const [loading, setLoading] = useState(true)
  const [programari, setProgramari] = useState([])
  const [serviciiCount, setServiciiCount] = useState([])

  useEffect(() => {
    if (!tenantId) return
    fetchDate()
  }, [tenantId])

  async function fetchDate() {
    setLoading(true)

    // Luăm ID-urile angajaților din tenant
    const { data: frizeri } = await supabase
      .from('frizeri')
      .select('id')
      .eq('tenant_id', tenantId)

    const ids = (frizeri || []).map(f => f.id)
    if (ids.length === 0) { setLoading(false); return }

    // Luăm toate programările tenantului
    const { data: prog } = await supabase
      .from('programari')
      .select('id, data_programare, status, programari_servicii(servicii(nume))')
      .in('frizer_id', ids)

    setProgramari(prog || [])

    // Numărăm serviciile
    const contor = {}
    for (const p of prog || []) {
      for (const ps of p.programari_servicii || []) {
        const nume = ps.servicii?.nume
        if (nume) contor[nume] = (contor[nume] || 0) + 1
      }
    }
    const sortat = Object.entries(contor)
      .map(([nume, count]) => ({ nume, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    setServiciiCount(sortat)
    setLoading(false)
  }

  // --- Calcule ---
  const azi = new Date()
  const startSaptamana = new Date(azi)
  startSaptamana.setDate(azi.getDate() - azi.getDay() + 1) // Luni
  startSaptamana.setHours(0, 0, 0, 0)

  const programariSaptamana = programari.filter(p => {
    const d = new Date(p.data_programare)
    return d >= startSaptamana && p.status !== 'anulata'
  })

  const totalActive = programari.filter(p =>
    p.data_programare >= azi.toISOString().split('T')[0] && p.status !== 'anulata'
  )

  const anulate = programari.filter(p => p.status === 'anulata')
  const rataAnulari = programari.length > 0
    ? Math.round((anulate.length / programari.length) * 100)
    : 0

  const celMaiSolicitat = serviciiCount[0]?.nume || '—'

  // --- Grafic pe zile (ultimele 7 zile) ---
  const ultimele7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dataStr = d.toISOString().split('T')[0]
    const ziua = d.toLocaleDateString('ro-RO', { weekday: 'short' })
    const count = programari.filter(p => p.data_programare === dataStr && p.status !== 'anulata').length
    ultimele7.push({ zi: ziua, programari: count })
  }

  const cardStyle = {
    background: T.surface2,
    border: `0.5px solid ${T.border}`,
    borderRadius: '14px',
    padding: '20px 24px',
    flex: 1,
    minWidth: '140px',
  }

  const labelStyle = {
    fontSize: '12px',
    color: T.muted,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const valueStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: T.text,
    lineHeight: 1,
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>
      Se incarca statisticile...
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Carduri */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={labelStyle}>Săptămâna aceasta</div>
          <div style={valueStyle}>{programariSaptamana.length}</div>
          <div style={{ fontSize: '12px', color: T.muted, marginTop: '6px' }}>programări active</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total active</div>
          <div style={valueStyle}>{totalActive.length}</div>
          <div style={{ fontSize: '12px', color: T.muted, marginTop: '6px' }}>programări viitoare</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Rata anulări</div>
          <div style={{ ...valueStyle, color: rataAnulari > 20 ? T.danger : T.success }}>
            {rataAnulari}%
          </div>
          <div style={{ fontSize: '12px', color: T.muted, marginTop: '6px' }}>{anulate.length} din {programari.length} total</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Cel mai solicitat</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: T.accent, lineHeight: 1.2, marginTop: '4px' }}>
            {celMaiSolicitat}
          </div>
          <div style={{ fontSize: '12px', color: T.muted, marginTop: '6px' }}>
            {serviciiCount[0]?.count ? `${serviciiCount[0].count} rezervări` : '—'}
          </div>
        </div>
      </div>

      {/* Grafic programări ultimele 7 zile */}
      <div style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '14px', padding: '20px 24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: T.text, marginBottom: '16px' }}>
          Programări — ultimele 7 zile
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ultimele7} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="zi" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '10px', color: T.text, fontSize: '13px' }}
              cursor={{ fill: T.accentSoft }}
              formatter={(val) => [val, 'Programări']}
            />
            <Bar dataKey="programari" fill={T.accent} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafic servicii populare */}
      {serviciiCount.length > 0 && (
        <div style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '14px', padding: '20px 24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: T.text, marginBottom: '16px' }}>
            Servicii populare
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={serviciiCount} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nume" tick={{ fill: T.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '10px', color: T.text, fontSize: '13px' }}
                cursor={{ fill: T.accentSoft }}
                formatter={(val) => [val, 'Rezervări']}
              />
              <Bar dataKey="count" fill={T.accent} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}

export default Statistici