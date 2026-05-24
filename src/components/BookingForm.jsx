import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'
import { useTheme } from '../context/ThemeContext'

const TURNSTILE_SITE_KEY = '0x4AAAAAADRIWeCjyjMFCHEz'

function BookingForm({ serviciiSelectate, dataSelectata, oraSelectata, durataTotala, frizerId, onSuccess }) {
  const { T, isDark } = useTheme()
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [comentarii, setComentarii] = useState('')
  const [gdprAcceptat, setGdprAcceptat] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erori, setErori] = useState({ nume: false, telefon: false })
  const [eroareGenerala, setEroareGenerala] = useState(null)
  const [hoverBtn, setHoverBtn] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!window.turnstile) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = () => renderWidget()
      document.head.appendChild(script)
    } else {
      renderWidget()
    }
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [])

  function renderWidget() {
    if (!turnstileRef.current || !window.turnstile) return
    if (widgetIdRef.current !== null) return
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(null),
      'error-callback': () => setTurnstileToken(null),
      theme: isDark ? 'dark' : 'light',
    })
  }

  function valideazaNume(val) {
    return val.trim().length >= 3 && /^[a-zA-ZăâîșțĂÂÎȘȚ\s]+$/.test(val.trim())
  }

  function valideazaTelefon(val) {
    return /^07[0-9]{8}$/.test(val.trim())
  }

  function calculeazaOraStop(oraStart, durata) {
    const [h, m] = oraStart.split(':').map(Number)
    const total = h * 60 + m + durata
    const hStop = Math.floor(total / 60).toString().padStart(2, '0')
    const mStop = (total % 60).toString().padStart(2, '0')
    return `${hStop}:${mStop}`
  }

  async function handleSubmit() {
    const numeOk = valideazaNume(nume)
    const telefonOk = valideazaTelefon(telefon)
    setErori({ nume: !numeOk, telefon: !telefonOk })
    setEroareGenerala(null)
    if (!numeOk || !telefonOk) return

    if (!gdprAcceptat) {
      setEroareGenerala('Te rugam sa accepti Politica de Confidențialitate pentru a continua.')
      return
    }

    if (!turnstileToken) {
      setEroareGenerala('Te rugam sa completezi verificarea de securitate.')
      return
    }

    setLoading(true)

    const azi = new Date().toISOString().split('T')[0]
    const { data: existente } = await supabase
      .from('programari')
      .select('id')
      .eq('telefon', telefon.trim())
      .eq('frizer_id', frizerId)
      .gte('data_programare', azi)
      .neq('status', 'anulata')

    if (existente && existente.length > 0) {
      setEroareGenerala('Exista deja o programare activa la acest frizer pe acest numar de telefon.')
      setLoading(false)
      return
    }

    const oraStop = calculeazaOraStop(oraSelectata, durataTotala)

    const { data: programare, error } = await supabase
      .from('programari')
      .insert({
        nume_client: nume.trim(),
        telefon: telefon.trim(),
        email: email.trim() || null,
        comentarii: comentarii.trim() || null,
        data_programare: dataSelectata,
        ora_start: oraSelectata,
        ora_sfarsit: oraStop,
        durata_totala: durataTotala,
        frizer_id: frizerId,
      })
      .select()
      .single()

    if (error) {
      setEroareGenerala('A aparut o eroare. Incearca din nou.')
      setLoading(false)
      return
    }

    const legaturi = serviciiSelectate.map(s => ({ programare_id: programare.id, serviciu_id: s.id }))
    await supabase.from('programari_servicii').insert(legaturi)

    if (email.trim()) {
      const dataFormatata = dataSelectata.replace(/-/g, '')
      const oraFormatata = oraSelectata.replace(':', '') + '00'
      const [h, m] = oraSelectata.split(':').map(Number)
      const total = h * 60 + m + durataTotala
      const hStop = Math.floor(total / 60).toString().padStart(2, '0')
      const mStop = (total % 60).toString().padStart(2, '0')
      const oraStopFormatata = `${hStop}${mStop}00`
      const titlu = encodeURIComponent(`Programare — ${serviciiSelectate.map(s => s.nume).join(', ')}`)
      const detalii = encodeURIComponent(`Servicii: ${serviciiSelectate.map(s => s.nume).join(', ')}\nDurata: ${durataTotala} minute`)
      const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titlu}&dates=${dataFormatata}T${oraFormatata}/${dataFormatata}T${oraStopFormatata}&details=${detalii}`
      const cancelLink = `${window.location.origin}/anulare/${programare.cancel_token}`

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { nume: nume.trim(), email_client: email.trim(), data: dataSelectata, ora: oraSelectata, servicii: serviciiSelectate.map(s => s.nume).join(', '), durata: durataTotala, google_calendar_link: googleLink, cancel_link: cancelLink },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
    }

    setLoading(false)
    onSuccess(nume.trim())
  }

  const stilInput = (eroare) => ({
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: `0.5px solid ${eroare ? T.danger : T.border}`,
    background: T.surface2, color: T.text, fontSize: '15px',
    boxSizing: 'border-box', outline: 'none', transition: T.transition,
  })

  const stilTextarea = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    border: `0.5px solid ${T.border}`,
    background: T.surface2, color: T.text, fontSize: '15px',
    boxSizing: 'border-box', outline: 'none', transition: T.transition,
    resize: 'vertical', minHeight: '80px', fontFamily: 'inherit',
  }

  return (
    <div style={{ background: T.surface, border: `0.5px solid ${T.border}`, borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: T.shadowCard }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .planora-input:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft}; }
        .planora-textarea:focus { border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft}; }
      `}</style>

      <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: T.muted, textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
        Datele tale
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <input className="planora-input" type="text" placeholder="Nume complet" value={nume}
            onChange={e => { setNume(e.target.value); setErori(prev => ({ ...prev, nume: false })) }}
            style={stilInput(erori.nume)} />
          {erori.nume && <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.danger }}>Minim 3 litere, doar caractere alfabetice</p>}
        </div>

        <div>
          <input className="planora-input" type="tel" placeholder="Telefon (07XXXXXXXX)" value={telefon}
            onChange={e => { setTelefon(e.target.value); setErori(prev => ({ ...prev, telefon: false })) }}
            style={stilInput(erori.telefon)} />
          {erori.telefon && <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.danger }}>Format: 07XXXXXXXX</p>}
        </div>

        <div>
          <input className="planora-input" type="email" placeholder="Email (optional)" value={email}
            onChange={e => setEmail(e.target.value)} style={stilInput(false)} />
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.muted }}>Vei primi confirmare si link de anulare pe email</p>
        </div>

        <div>
          <textarea
            className="planora-textarea"
            placeholder="Comentarii (optional) — ex: alergii, preferinte, detalii suplimentare..."
            value={comentarii}
            onChange={e => setComentarii(e.target.value)}
            maxLength={500}
            style={stilTextarea}
          />
          {comentarii.length > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: T.muted, textAlign: 'right' }}>
              {comentarii.length}/500
            </p>
          )}
        </div>

        {/* GDPR checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', borderRadius: '10px', background: T.surface2, border: `0.5px solid ${gdprAcceptat ? T.accent : T.border}`, transition: T.transition }}>
          <input
            type="checkbox"
            id="gdpr"
            checked={gdprAcceptat}
            onChange={e => { setGdprAcceptat(e.target.checked); setEroareGenerala(null) }}
            style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: T.accent, cursor: 'pointer', flexShrink: 0 }}
          />
          <label htmlFor="gdpr" style={{ fontSize: '13px', color: T.muted, lineHeight: '1.5', cursor: 'pointer' }}>
            Am citit și sunt de acord cu{' '}
            <a href="/politica-confidentialitate" target="_blank" style={{ color: T.accent, textDecoration: 'none', fontWeight: '500' }}>
              Politica de Confidențialitate
            </a>
            . Înțeleg că datele mele vor fi folosite exclusiv pentru gestionarea programării.
          </label>
        </div>

        <div ref={turnstileRef} style={{ marginTop: '4px' }} />

        {eroareGenerala && (
          <p style={{ margin: 0, fontSize: '13px', color: T.danger, background: T.dangerSoft, padding: '10px 14px', borderRadius: '10px' }}>
            {eroareGenerala}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          style={{
            padding: '14px', borderRadius: '10px', border: 'none',
            background: loading ? T.accent : hoverBtn ? `linear-gradient(135deg, #5a7af5, ${T.accent})` : `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
            color: '#fff', fontSize: '15px', cursor: loading ? 'wait' : 'pointer',
            fontWeight: '600', letterSpacing: '0.03em', marginTop: '6px',
            transition: T.transition,
            transform: hoverBtn && !loading ? 'scale(1.02)' : 'scale(1)',
            boxShadow: hoverBtn && !loading ? T.shadowHover : T.shadow,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
        >
          {loading ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Se trimite...
            </>
          ) : 'Confirma programarea'}
        </button>
      </div>
    </div>
  )
}

export default BookingForm