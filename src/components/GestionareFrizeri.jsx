import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { T } from '../styles/theme'

function GestionareFrizeri() {
  const [frizeri, setFrizeri] = useState([])
  const [loading, setLoading] = useState(true)
  const [adaugaMode, setAdaugaMode] = useState(false)
  const [numeNou, setNumeNou] = useState('')
  const [emailNou, setEmailNou] = useState('')
  const [parolaNou, setParolaNou] = useState('')
  const [eroare, setEroare] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loadingAdauga, setLoadingAdauga] = useState(false)
  const [serviciiDeschis, setServiciiDeschis] = useState(null)
  const [toateServiciile, setToateServiciile] = useState([])
  const [serviciiAsignate, setServiciiAsignate] = useState({})

  const fetchFrizeri = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('frizeri')
      .select('*')
      .order('created_at', { ascending: true })
    setFrizeri(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchFrizeri()
    supabase.from('servicii').select('*').order('ordine').then(({ data }) => {
      setToateServiciile(data || [])
    })
  }, [fetchFrizeri])

  async function deschideServicii(frizerId) {
    if (serviciiDeschis === frizerId) {
      setServiciiDeschis(null)
      return
    }
    const { data } = await supabase
      .from('frizer_servicii')
      .select('serviciu_id')
      .eq('frizer_id', frizerId)
    const asignate = new Set((data || []).map(r => r.serviciu_id))
    setServiciiAsignate(prev => ({ ...prev, [frizerId]: asignate }))
    setServiciiDeschis(frizerId)
  }

  async function toggleServiciu(frizerId, serviciuId) {
    const asignate = serviciiAsignate[frizerId] || new Set()
    const areServiciu = asignate.has(serviciuId)

    if (areServiciu) {
      await supabase
        .from('frizer_servicii')
        .delete()
        .eq('frizer_id', frizerId)
        .eq('serviciu_id', serviciuId)
      const nou = new Set(asignate)
      nou.delete(serviciuId)
      setServiciiAsignate(prev => ({ ...prev, [frizerId]: nou }))
    } else {
      await supabase
        .from('frizer_servicii')
        .insert({ frizer_id: frizerId, serviciu_id: serviciuId })
      const nou = new Set(asignate)
      nou.add(serviciuId)
      setServiciiAsignate(prev => ({ ...prev, [frizerId]: nou }))
    }
  }

  async function adaugaFrizer() {
    if (!numeNou.trim()) return setEroare('Numele nu poate fi gol.')
    if (!emailNou.trim()) return setEroare('Email-ul nu poate fi gol.')
    if (!parolaNou.trim() || parolaNou.length < 6) return setEroare('Parola trebuie sa aiba minim 6 caractere.')
    setEroare(null)
    setLoadingAdauga(true)

    const { data, error } = await supabase.auth.admin.createUser({
      email: emailNou.trim(),
      password: parolaNou.trim(),
      email_confirm: true,
    })

    if (error) {
      setEroare('Eroare la crearea contului: ' + error.message)
      setLoadingAdauga(false)
      return
    }

    const { error: errFrizer } = await supabase
      .from('frizeri')
      .insert({
        user_id: data.user.id,
        nume: numeNou.trim(),
        email: emailNou.trim(),
        activ: true,
      })

    if (errFrizer) {
      setEroare('Eroare la salvarea frizer-ului: ' + errFrizer.message)
      setLoadingAdauga(false)
      return
    }

    setSuccess(`Frizerul ${numeNou.trim()} a fost adaugat cu succes!`)
    setNumeNou('')
    setEmailNou('')
    setParolaNou('')
    setAdaugaMode(false)
    setTimeout(() => setSuccess(null), 4000)
    fetchFrizeri()
    setLoadingAdauga(false)
  }

  async function toggleActiv(frizer) {
    await supabase
      .from('frizeri')
      .update({ activ: !frizer.activ })
      .eq('id', frizer.id)
    fetchFrizeri()
  }

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>
      Se incarca...
    </div>
  )

  return (
    <div>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Frizeri ({frizeri.length})
      </span>

      {success && (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '0.5px solid rgba(34,197,94,0.3)', color: T.success, fontSize: '13px', fontWeight: '500', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {frizeri.map(f => (
          <div key={f.id}>
            <div style={{
              padding: '16px 20px',
              borderRadius: serviciiDeschis === f.id ? '12px 12px 0 0' : '12px',
              border: `0.5px solid ${f.activ ? T.border : 'transparent'}`,
              background: f.activ ? T.surface2 : 'rgba(107,114,128,0.06)',
              display: 'flex', alignItems: 'center', gap: '14px',
              opacity: f.activ ? 1 : 0.6, transition: T.transition,
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                {f.nume.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '15px', color: T.text }}>{f.nume}</span>
                  {!f.activ && (
                    <span style={{ fontSize: '11px', color: T.muted, background: T.surface, padding: '2px 8px', borderRadius: '20px', border: `0.5px solid ${T.border}` }}>Inactiv</span>
                  )}
                </div>
                <span style={{ fontSize: '13px', color: T.muted }}>{f.email}</span>
              </div>

              <button
                onClick={() => deschideServicii(f.id)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${serviciiDeschis === f.id ? T.accent : T.border}`, background: serviciiDeschis === f.id ? T.accentSoft : T.surface, color: serviciiDeschis === f.id ? T.accent : T.muted, cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: T.transition, whiteSpace: 'nowrap' }}
              >
                {serviciiDeschis === f.id ? 'Ascunde' : 'Servicii'}
              </button>

              <button
                onClick={() => toggleActiv(f)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${f.activ ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, background: f.activ ? T.dangerSoft : 'rgba(34,197,94,0.08)', color: f.activ ? T.danger : T.success, cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: T.transition, whiteSpace: 'nowrap' }}
              >
                {f.activ ? 'Dezactiveaza' : 'Activeaza'}
              </button>
            </div>

            {serviciiDeschis === f.id && (
              <div style={{ padding: '16px 20px', borderRadius: '0 0 12px 12px', border: `0.5px solid ${T.border}`, borderTop: 'none', background: T.surface }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                  Servicii disponibile
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {toateServiciile.map(s => {
                    const bifat = (serviciiAsignate[f.id] || new Set()).has(s.id)
                    return (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', border: `0.5px solid ${bifat ? T.accent : T.border}`, background: bifat ? T.accentSoft : T.surface2, cursor: 'pointer', transition: T.transition }}>
                        <input
                          type="checkbox"
                          checked={bifat}
                          onChange={() => toggleServiciu(f.id, s.id)}
                          style={{ width: '16px', height: '16px', accentColor: T.accent, cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: bifat ? '600' : '400', color: bifat ? T.accent : T.text }}>
                          {s.nume}
                        </span>
                        <span style={{ fontSize: '13px', color: T.muted }}>{s.durata} min</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {adaugaMode ? (
        <div style={{ padding: '20px', borderRadius: '12px', border: `0.5px solid ${T.border}`, background: T.surface2 }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>Frizer nou</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nume frizer" value={numeNou} onChange={e => { setNumeNou(e.target.value); setEroare(null) }} style={{ padding: '10px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition }} />
            <input type="email" placeholder="Email" value={emailNou} onChange={e => { setEmailNou(e.target.value); setEroare(null) }} style={{ padding: '10px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition }} />
            <input type="password" placeholder="Parola (minim 6 caractere)" value={parolaNou} onChange={e => { setParolaNou(e.target.value); setEroare(null) }} style={{ padding: '10px 14px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition }} />
            {eroare && <p style={{ margin: 0, fontSize: '13px', color: T.danger, background: T.dangerSoft, padding: '10px 14px', borderRadius: '10px' }}>{eroare}</p>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button onClick={adaugaFrizer} disabled={loadingAdauga} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: loadingAdauga ? 'wait' : 'pointer', transition: T.transition, boxShadow: T.shadow }}>
                {loadingAdauga ? 'Se creeaza...' : 'Adauga frizer'}
              </button>
              <button onClick={() => { setAdaugaMode(false); setEroare(null) }} style={{ padding: '10px 16px', borderRadius: '10px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, fontSize: '14px', cursor: 'pointer', transition: T.transition }}>
                Anuleaza
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdaugaMode(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: `0.5px dashed ${T.accent}`, background: T.accentSoft, color: T.accent, cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: T.transition }}>
          + Adauga frizer nou
        </button>
      )}
    </div>
  )
}

export default GestionareFrizeri