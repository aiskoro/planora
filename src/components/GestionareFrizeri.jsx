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
  }, [fetchFrizeri])

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
      <span style={{
        fontSize: '11px',
        letterSpacing: '0.1em',
        color: T.muted,
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '16px',
      }}>
        Frizeri ({frizeri.length})
      </span>

      {success && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(34,197,94,0.1)',
          border: '0.5px solid rgba(34,197,94,0.3)',
          color: T.success,
          fontSize: '13px',
          fontWeight: '500',
          marginBottom: '16px',
        }}>
          {success}
        </div>
      )}

      {/* Lista frizeri */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {frizeri.map(f => (
          <div
            key={f.id}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              border: `0.5px solid ${f.activ ? T.border : 'transparent'}`,
              background: f.activ ? T.surface2 : 'rgba(107,114,128,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              opacity: f.activ ? 1 : 0.6,
              transition: T.transition,
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '16px',
              flexShrink: 0,
            }}>
              {f.nume.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '15px', color: T.text }}>
                  {f.nume}
                </span>
                {!f.activ && (
                  <span style={{
                    fontSize: '11px',
                    color: T.muted,
                    background: T.surface,
                    padding: '2px 8px',
                    borderRadius: '20px',
                    border: `0.5px solid ${T.border}`,
                  }}>
                    Inactiv
                  </span>
                )}
              </div>
              <span style={{ fontSize: '13px', color: T.muted }}>{f.email}</span>
            </div>

            <button
              onClick={() => toggleActiv(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: `0.5px solid ${f.activ ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                background: f.activ ? T.dangerSoft : 'rgba(34,197,94,0.08)',
                color: f.activ ? T.danger : T.success,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: T.transition,
                whiteSpace: 'nowrap',
              }}
            >
              {f.activ ? 'Dezactiveaza' : 'Activeaza'}
            </button>
          </div>
        ))}
      </div>

      {/* Formular adauga */}
      {adaugaMode ? (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          border: `0.5px solid ${T.border}`,
          background: T.surface2,
        }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: T.muted,
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '14px',
          }}>
            Frizer nou
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Nume frizer"
              value={numeNou}
              onChange={e => { setNumeNou(e.target.value); setEroare(null) }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: `0.5px solid ${T.border}`,
                background: T.surface,
                color: T.text,
                fontSize: '14px',
                outline: 'none',
                transition: T.transition,
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={emailNou}
              onChange={e => { setEmailNou(e.target.value); setEroare(null) }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: `0.5px solid ${T.border}`,
                background: T.surface,
                color: T.text,
                fontSize: '14px',
                outline: 'none',
                transition: T.transition,
              }}
            />
            <input
              type="password"
              placeholder="Parola (minim 6 caractere)"
              value={parolaNou}
              onChange={e => { setParolaNou(e.target.value); setEroare(null) }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: `0.5px solid ${T.border}`,
                background: T.surface,
                color: T.text,
                fontSize: '14px',
                outline: 'none',
                transition: T.transition,
              }}
            />

            {eroare && (
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: T.danger,
                background: T.dangerSoft,
                padding: '10px 14px',
                borderRadius: '10px',
              }}>
                {eroare}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={adaugaFrizer}
                disabled={loadingAdauga}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loadingAdauga ? 'wait' : 'pointer',
                  transition: T.transition,
                  boxShadow: T.shadow,
                }}
              >
                {loadingAdauga ? 'Se creeaza...' : 'Adauga frizer'}
              </button>
              <button
                onClick={() => { setAdaugaMode(false); setEroare(null) }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: `0.5px solid ${T.border}`,
                  background: T.surface,
                  color: T.muted,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: T.transition,
                }}
              >
                Anuleaza
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdaugaMode(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: `0.5px dashed ${T.accent}`,
            background: T.accentSoft,
            color: T.accent,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: T.transition,
          }}
        >
          + Adauga frizer nou
        </button>
      )}
    </div>
  )
}

export default GestionareFrizeri