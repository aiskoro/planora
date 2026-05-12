import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function GestionareServicii() {
  const [servicii, setServicii] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [numeNou, setNumeNou] = useState('')
  const [durataNou, setDurataNou] = useState('')
  const [eroare, setEroare] = useState(null)
  const [adaugaMode, setAdaugaMode] = useState(false)
  const [numeAdauga, setNumeAdauga] = useState('')
  const [durataAdauga, setDurataAdauga] = useState('')

  const fetchServicii = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('servicii')
      .select('*')
      .order('ordine')
    setServicii(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchServicii()
  }, [fetchServicii])

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
    if (!durataNou || durataNou <= 0) return setEroare('Durata trebuie să fie mai mare ca 0.')

    const { error } = await supabase
      .from('servicii')
      .update({ nume: numeNou.trim(), durata: parseInt(durataNou) })
      .eq('id', id)

    if (error) return setEroare('A apărut o eroare.')

    setEditId(null)
    fetchServicii()
  }

  async function toggleActiv(serviciu) {
    await supabase
      .from('servicii')
      .update({ activ: !serviciu.activ })
      .eq('id', serviciu.id)
    fetchServicii()
  }

  async function adaugaServiciu() {
    if (!numeAdauga.trim()) return setEroare('Numele nu poate fi gol.')
    if (!durataAdauga || durataAdauga <= 0) return setEroare('Durata trebuie să fie mai mare ca 0.')

    const ordineMax = servicii.length > 0 ? Math.max(...servicii.map(s => s.ordine)) + 1 : 1

    const { error } = await supabase
      .from('servicii')
      .insert({ nume: numeAdauga.trim(), durata: parseInt(durataAdauga), ordine: ordineMax })

    if (error) return setEroare('A apărut o eroare.')

    setNumeAdauga('')
    setDurataAdauga('')
    setAdaugaMode(false)
    setEroare(null)
    fetchServicii()
  }

  const stilInput = {
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
  }

  if (loading) return <p>Se încarcă...</p>

  return (
    <div style={{ marginTop: '24px' }}>

      {/* Lista servicii */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {servicii.map(s => (
          <div
            key={s.id}
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #eee',
              backgroundColor: s.activ ? '#fafafa' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              opacity: s.activ ? 1 : 0.6,
            }}
          >
            {editId === s.id ? (
              <>
                <input
                  type="text"
                  value={numeNou}
                  onChange={e => setNumeNou(e.target.value)}
                  style={{ ...stilInput, flex: 1, minWidth: '120px' }}
                />
                <input
                  type="number"
                  value={durataNou}
                  onChange={e => setDurataNou(e.target.value)}
                  style={{ ...stilInput, width: '80px' }}
                />
                <span style={{ fontSize: '13px', color: '#999' }}>min</span>
                <button
                  onClick={() => salveazaEdit(s.id)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Salvează
                </button>
                <button
                  onClick={anuleazaEdit}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Anulează
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontWeight: 'bold', fontSize: '15px' }}>
                  {s.nume}
                  {!s.activ && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#999', fontWeight: 'normal' }}>Inactiv</span>}
                </span>
                <span style={{ color: '#666', fontSize: '14px' }}>{s.durata} min</span>
                <button
                  onClick={() => incepeEdit(s)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}
                >
                  Editează
                </button>
                <button
                  onClick={() => toggleActiv(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${s.activ ? '#ef4444' : '#10b981'}`,
                    backgroundColor: '#fff',
                    color: s.activ ? '#ef4444' : '#10b981',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {s.activ ? 'Dezactivează' : 'Activează'}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {eroare && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{eroare}</p>}

      {/* Adaugă serviciu */}
      {adaugaMode ? (
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid #eee',
          backgroundColor: '#fafafa',
        }}>
          <h4 style={{ margin: '0 0 12px' }}>Serviciu nou</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Nume serviciu"
              value={numeAdauga}
              onChange={e => { setNumeAdauga(e.target.value); setEroare(null) }}
              style={{ ...stilInput, flex: 1, minWidth: '150px' }}
            />
            <input
              type="number"
              placeholder="Durată"
              value={durataAdauga}
              onChange={e => { setDurataAdauga(e.target.value); setEroare(null) }}
              style={{ ...stilInput, width: '80px' }}
            />
            <span style={{ fontSize: '13px', color: '#999' }}>min</span>
            <button
              onClick={adaugaServiciu}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#4F46E5', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              Adaugă
            </button>
            <button
              onClick={() => { setAdaugaMode(false); setEroare(null) }}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' }}
            >
              Anulează
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdaugaMode(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px dashed #4F46E5',
            backgroundColor: '#fff',
            color: '#4F46E5',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          + Adaugă serviciu nou
        </button>
      )}
    </div>
  )
}

export default GestionareServicii