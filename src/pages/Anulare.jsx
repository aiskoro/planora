import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { Helmet } from 'react-helmet-async'


function Anulare() {
  const { T } = useTheme()
  const { token } = useParams()
  const [programare, setProgramare] = useState(null)
  const [stare, setStare] = useState('incarcare')
  const [loading, setLoading] = useState(false)
  const [hoverAnuleaza, setHoverAnuleaza] = useState(false)
  const [hoverPastreaza, setHoverPastreaza] = useState(false)

  useEffect(() => {
    async function incarcaProgramare() {
      const { data, error } = await supabase.from('programari').select('*').eq('cancel_token', token).single()
      if (error || !data) { setStare('inexistenta'); return }
      if (data.status === 'anulata') { setProgramare(data); setStare('anulata'); return }
      const acum = new Date()
      const dataProgramare = new Date(data.data_programare + 'T' + data.ora_start)
      const diferentaMinute = (dataProgramare - acum) / 1000 / 60
      if (diferentaMinute < 120) { setProgramare(data); setStare('expirata'); return }
      setProgramare(data); setStare('confirmare')
    }
    incarcaProgramare()
  }, [token])

  async function handleAnulare() {
    setLoading(true)
    const { error } = await supabase.from('programari').update({ status: 'anulata' }).eq('cancel_token', token)
    if (error) { setStare('eroare'); setLoading(false); return }
    await supabase.from('audit_logs').insert({ programare_id: programare.id, tip: 'anulare_client', anulat_de: 'client', nume_client: programare.nume_client, data_programare: programare.data_programare, ora_start: programare.ora_start })
    setStare('anulata'); setLoading(false)
  }

  const wrapper = { minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }
  const card = { maxWidth: '460px', margin: '0 auto', padding: '40px 32px', background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '20px', boxShadow: T.shadowCard, textAlign: 'center' }
  const iconCircle = (bg) => ({ width: '64px', height: '64px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' })

  if (stare === 'incarcare') return <div style={wrapper}><div style={card}><div style={iconCircle(T.accentSoft)}>⏳</div><p style={{ color: T.muted, margin: 0 }}>Se incarca...</p></div></div>

  if (stare === 'inexistenta') return (
    <div style={wrapper}><div style={card}>
      <div style={iconCircle(T.dangerSoft)}>❌</div>
      <h2 style={{ color: T.text, margin: '0 0 8px', fontSize: '20px', fontWeight: '700' }}>Link invalid</h2>
      <p style={{ color: T.muted, margin: 0, fontSize: '15px' }}>Acest link nu este valid sau a expirat.</p>
    </div></div>
  )

  if (stare === 'expirata') return (
    <div style={wrapper}><div style={card}>
      <div style={iconCircle('rgba(245,158,11,0.1)')}>⚠️</div>
      <h2 style={{ color: T.text, margin: '0 0 12px', fontSize: '20px', fontWeight: '700' }}>Termen depasit</h2>
      <p style={{ color: T.muted, margin: '0 0 8px', fontSize: '15px' }}>Programarea din <strong style={{ color: T.text }}>{programare.data_programare}</strong> la ora <strong style={{ color: T.text }}>{programare.ora_start.slice(0, 5)}</strong> nu mai poate fi anulata online.</p>
      <p style={{ color: T.muted, margin: 0, fontSize: '14px' }}>Anularea este posibila doar cu cel putin 2 ore inainte. Te rugam sa ne contactezi direct.</p>
    </div></div>
  )

  if (stare === 'anulata') return (
    <div style={wrapper}>
      <style>{`@keyframes scaleIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }`}</style>
      <div style={card}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polyline points="5,14 11,20 23,8" stroke={T.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ color: T.text, margin: '0 0 12px', fontSize: '20px', fontWeight: '700' }}>Programare anulata</h2>
        <p style={{ color: T.muted, margin: '0 0 24px', fontSize: '15px' }}>Programarea din <strong style={{ color: T.text }}>{programare.data_programare}</strong> la ora <strong style={{ color: T.text }}>{programare.ora_start.slice(0, 5)}</strong> a fost anulata cu succes.</p>
        <button onClick={() => window.location.href = '/'} style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: T.transition }}>Fa o programare noua</button>
      </div>
    </div>
  )

  if (stare === 'eroare') return (
    <div style={wrapper}><div style={card}>
      <div style={iconCircle(T.dangerSoft)}>❌</div>
      <h2 style={{ color: T.text, margin: '0 0 8px', fontSize: '20px', fontWeight: '700' }}>Eroare</h2>
      <p style={{ color: T.muted, margin: 0, fontSize: '15px' }}>A aparut o eroare. Te rugam sa incerci din nou.</p>
    </div></div>
  )

  return (
    
    <div style={wrapper}>
      <Helmet>
  <title>Anulare programare — Timevia</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ ...card, animation: 'fadeUp 0.3s ease' }}>
        <div style={iconCircle(T.dangerSoft)}>🗓️</div>
        <h2 style={{ color: T.text, margin: '0 0 8px', fontSize: '20px', fontWeight: '700' }}>Anulare programare</h2>
        <p style={{ color: T.muted, margin: '0 0 8px', fontSize: '15px' }}>Esti sigur ca vrei sa anulezi programarea din</p>
        <div style={{ background: T.surface2, border: `0.5px solid ${T.border}`, borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Data</p>
            <p style={{ margin: 0, fontWeight: '600', color: T.text }}>{programare.data_programare}</p>
          </div>
          <div style={{ width: '1px', background: T.border }} />
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ora</p>
            <p style={{ margin: 0, fontWeight: '600', color: T.text }}>{programare.ora_start.slice(0, 5)}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={handleAnulare} disabled={loading} onMouseEnter={() => setHoverAnuleaza(true)} onMouseLeave={() => setHoverAnuleaza(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: hoverAnuleaza ? '#dc2626' : T.danger, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: loading ? 'wait' : 'pointer', transition: T.transition, transform: hoverAnuleaza ? 'scale(1.03)' : 'scale(1)', boxShadow: hoverAnuleaza ? '0 4px 16px rgba(239,68,68,0.3)' : 'none' }}>
            {loading ? 'Se proceseaza...' : 'Da, anuleaza'}
          </button>
          <button onClick={() => window.location.href = '/'} onMouseEnter={() => setHoverPastreaza(true)} onMouseLeave={() => setHoverPastreaza(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: `0.5px solid ${hoverPastreaza ? T.accent : T.border}`, background: hoverPastreaza ? T.accentSoft : T.surface, color: hoverPastreaza ? T.accent : T.muted, fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: T.transition }}>
            Nu, pastreaza
          </button>
        </div>
      </div>
    </div>
  )
}

export default Anulare