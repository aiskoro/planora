import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

function GestionareServicii({ isMaster, tenantId }) {
  const { T } = useTheme()
  const [servicii, setServicii] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [numeNou, setNumeNou] = useState('')
  const [durataNou, setDurataNou] = useState('')
  const [eroare, setEroare] = useState(null)
  const [adaugaMode, setAdaugaMode] = useState(false)
  const [numeAdauga, setNumeAdauga] = useState('')
  const [durataAdauga, setDurataAdauga] = useState('')
  const [confirmSterge, setConfirmSterge] = useState(null)

  const fetchServicii = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    const { data } = await supabase
      .from('servicii')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('ordine')
    setServicii(data || [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { fetchServicii() }, [fetchServicii])

  function incepeEdit(serviciu) {
    setEditId(serviciu.id)
    setNumeNou(serviciu.nume)
    setDurataNou(serviciu.durata)
    setEroare(null)
  }

  function anuleazaEdit() {
    setEditId(null)
    setNumeNou('')
    setDurataNou('')
    setEroare(null)
  }

  async function salveazaEdit(id) {
    if (!numeNou.trim()) return setEroare('Numele nu poate fi gol.')
    if (!durataNou || durataNou <= 0) return setEroare('Durata trebuie sa fie mai mare ca 0.')
    const { error } = await supabase
      .from('servicii')
      .update({ nume: numeNou.trim(), durata: parseInt(durataNou) })
      .eq('id', id)
    if (error) return setEroare('A aparut o eroare.')
    setEditId(null)
    fetchServicii()
  }

  async function toggleActiv(serviciu) {
    await supabase.from('servicii').update({ activ: !serviciu.activ }).eq('id', serviciu.id)
    fetchServicii()
  }

  async function stergeServiciu(id) {
    await supabase.from('frizer_servicii').delete().eq('serviciu_id', id)
    await supabase.from('servicii').delete().eq('id', id)
    setConfirmSterge(null)
    fetchServicii()
  }

  async function adaugaServiciu() {
    if (!numeAdauga.trim()) return setEroare('Numele nu poate fi gol.')
    if (!durataAdauga || durataAdauga <= 0) return setEroare('Durata trebuie sa fie mai mare ca 0.')
    const ordineMax = servicii.length > 0 ? Math.max(...servicii.map(s => s.ordine)) + 1 : 1
    const { error } = await supabase.from('servicii').insert({
      nume: numeAdauga.trim(),
      durata: parseInt(durataAdauga),
      ordine: ordineMax,
      tenant_id: tenantId,
    })
    if (error) return setEroare('A aparut o eroare.')
    setNumeAdauga('')
    setDurataAdauga('')
    setAdaugaMode(false)
    setEroare(null)
    fetchServicii()
  }

  const stilInput = {
    padding: '7px 10px', borderRadius: '8px', border: `0.5px solid ${T.border}`,
    background: T.surface, color: T.text, fontSize: '14px', outline: 'none', transition: T.transition,
  }

  if (loading) return <div style={{ padding: '40px 0', textAlign: 'center', color: T.muted }}>Se incarca...</div>

  return (
    <div>
      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Servicii ({servicii.length})
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {servicii.map(s => (
          <div key={s.id} style={{ padding: '14px 16px', borderRadius: '12px', border: `0.5px solid ${s.activ ? T.border : 'transparent'}`, background: s.activ ? T.surface2 : 'rgba(107,114,128,0.06)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', opacity: s.activ ? 1 : 0.6, transition: T.transition }}>
            {editId === s.id ? (
              <>
                <input type="text" value={numeNou} onChange={e => setNumeNou(e.target.value)} style={{ ...stilInput, flex: 1, minWidth: '120px' }} />
                <input type="number" value={durataNou} onChange={e => setDurataNou(e.target.value)} style={{ ...stilInput, width: '70px' }} />
                <span style={{ fontSize: '13px', color: T.muted }}>min</span>
                <button onClick={() => salveazaEdit(s.id)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Salveaza</button>
                <button onClick={anuleazaEdit} style={{ padding: '6px 14px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px' }}>Anuleaza</button>
              </>
            ) : confirmSterge === s.id ? (
              <>
                <span style={{ flex: 1, fontSize: '14px', color: T.danger, fontWeight: '500' }}>Stergi „{s.nume}"? Actiunea e ireversibila.</span>
                <button onClick={() => stergeServiciu(s.id)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: T.danger, color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Da, sterge</button>
                <button onClick={() => setConfirmSterge(null)} style={{ padding: '6px 14px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px' }}>Anuleaza</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontWeight: '600', fontSize: '14px', color: T.text }}>
                  {s.nume}
                  {!s.activ && <span style={{ marginLeft: '8px', fontSize: '11px', color: T.muted, fontWeight: '400', background: T.surface2, padding: '2px 8px', borderRadius: '20px' }}>Inactiv</span>}
                </span>
                <span style={{ color: T.muted, fontSize: '13px' }}>{s.durata} min</span>
                {isMaster && (
                  <>
                    <button onClick={() => incepeEdit(s)} style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '13px' }}>Editeaza</button>
                    <button onClick={() => toggleActiv(s)} style={{ padding: '6px 12px', borderRadius: '8px', border: `0.5px solid ${s.activ ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, background: s.activ ? T.dangerSoft : 'rgba(34,197,94,0.08)', color: s.activ ? T.danger : T.success, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                      {s.activ ? 'Dezactiveaza' : 'Activeaza'}
                    </button>
                    <button onClick={() => setConfirmSterge(s.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: '0.5px solid rgba(239,68,68,0.3)', background: T.dangerSoft, color: T.danger, cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Sterge</button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {eroare && <p style={{ color: T.danger, background: T.dangerSoft, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>{eroare}</p>}

      {isMaster && (
        adaugaMode ? (
          <div style={{ padding: '16px', borderRadius: '12px', border: `0.5px solid ${T.border}`, background: T.surface2 }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Serviciu nou</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" placeholder="Nume serviciu" value={numeAdauga} onChange={e => { setNumeAdauga(e.target.value); setEroare(null) }} style={{ ...stilInput, flex: 1, minWidth: '150px' }} />
              <input type="number" placeholder="Durata" value={durataAdauga} onChange={e => { setDurataAdauga(e.target.value); setEroare(null) }} style={{ ...stilInput, width: '80px' }} />
              <span style={{ fontSize: '13px', color: T.muted }}>min</span>
              <button onClick={adaugaServiciu} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`, color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: T.shadow }}>Adauga</button>
              <button onClick={() => { setAdaugaMode(false); setEroare(null) }} style={{ padding: '8px 14px', borderRadius: '8px', border: `0.5px solid ${T.border}`, background: T.surface, color: T.muted, cursor: 'pointer', fontSize: '14px' }}>Anuleaza</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdaugaMode(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: `0.5px dashed ${T.accent}`, background: T.accentSoft, color: T.accent, cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            + Adauga serviciu nou
          </button>
        )
      )}
    </div>
  )
}

export default GestionareServicii