import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getConsent, setConsent, loadGTM } from '../lib/analytics'

// Banner minimal de consimțământ cookie-uri. Google Analytics (prin GTM) nu
// pornește decât după ce vizitatorul apasă "Accept" — necesar ca politica de
// confidențialitate (secțiunea 9) să rămână adevărată.
export default function CookieConsent() {
  const { T } = useTheme()
  const [vizibil, setVizibil] = useState(false)

  useEffect(() => {
    if (!getConsent()) setVizibil(true)
  }, [])

  function accepta() {
    setConsent('accepted')
    loadGTM()
    setVizibil(false)
  }

  function refuza() {
    setConsent('refused')
    setVizibil(false)
  }

  if (!vizibil) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Consimțământ cookie-uri"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 460,
        margin: '0 auto',
        background: T.surface,
        border: `1.5px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: T.shadowHover,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.text }}>
        Folosim cookie-uri doar ca să înțelegem cum e folosită platforma
        (Google Analytics). Se activează doar dacă ești de acord — detalii în{' '}
        <a
          href="/politica-confidentialitate"
          style={{ color: T.accent, textDecoration: 'underline' }}
        >
          Politica de Confidențialitate
        </a>
        .
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={refuza}
          style={{
            padding: '9px 16px',
            borderRadius: 10,
            border: `1.5px solid ${T.border}`,
            background: 'transparent',
            color: T.muted,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Refuz
        </button>
        <button
          onClick={accepta}
          style={{
            padding: '9px 18px',
            borderRadius: 10,
            border: 'none',
            background: T.accent,
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
