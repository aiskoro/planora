import { useEffect, useState } from 'react'
import { T } from '../styles/theme'

function Confirmare({ nume, data, ora, oraStop, servicii, durata, onNouaProgramare }) {
  const [vizibil, setVizibil] = useState(false)
  const [hoverGoogle, setHoverGoogle] = useState(false)
  const [hoverIcs, setHoverIcs] = useState(false)
  const [hoverNou, setHoverNou] = useState(false)

  useEffect(() => {
    setTimeout(() => setVizibil(true), 50)
  }, [])

  function formateazaData(dataStr) {
    if (!dataStr) return ''
    const [an, luna, zi] = dataStr.split('-')
    const luni = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
                  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie']
    return `${zi} ${luni[parseInt(luna) - 1]} ${an}`
  }

  function descarcaICS() {
    const dataFormatata = data.replace(/-/g, '')
    const oraFormatata = ora.replace(':', '') + '00'
    const oraStopFormatata = oraStop.replace(':', '') + '00'
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Planora//RO',
      'BEGIN:VEVENT',
      `DTSTART:${dataFormatata}T${oraFormatata}`,
      `DTEND:${dataFormatata}T${oraStopFormatata}`,
      `SUMMARY:Programare Planora — ${servicii.join(', ')}`,
      `DESCRIPTION:Servicii: ${servicii.join(', ')}\\nDurată: ${durata} minute`,
      'LOCATION:Planora',
      `UID:${Date.now()}@planora`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'programare-planora.ics'
    link.click()
    URL.revokeObjectURL(url)
  }

  function getLinkGoogleCalendar() {
    const dataFormatata = data.replace(/-/g, '')
    const oraFormatata = ora.replace(':', '') + '00'
    const oraStopFormatata = oraStop.replace(':', '') + '00'
    const titlu = encodeURIComponent('Programare Planora')
    const detalii = encodeURIComponent(`Servicii: ${servicii.join(', ')}\nDurata: ${durata} minute`)
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titlu}&dates=${dataFormatata}T${oraFormatata}/${dataFormatata}T${oraStopFormatata}&details=${detalii}`
  }

  const detalii = [
    { icon: '📅', label: 'Data', valoare: formateazaData(data) },
    { icon: '⏰', label: 'Ora', valoare: `${ora} — ${oraStop}` },
    { icon: '✂️', label: 'Servicii', valoare: servicii.join(', ') },
    { icon: '⏱️', label: 'Durata estimata', valoare: `${durata} minute` },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
    }}>
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpDelay {
          0%, 30% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        maxWidth: '460px',
        width: '100%',
        opacity: vizibil ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: T.shadowHover,
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polyline
                points="7,18 15,26 29,10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="50"
                strokeDashoffset="0"
                style={{ animation: 'checkDraw 0.4s ease 0.3s both' }}
              />
            </svg>
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: T.text,
            margin: '0 0 8px',
            animation: 'fadeUp 0.4s ease 0.2s both',
          }}>
            Programare confirmata!
          </h1>
          <p style={{
            color: T.muted,
            fontSize: '15px',
            margin: 0,
            animation: 'fadeUp 0.4s ease 0.3s both',
          }}>
            Te asteptam, <strong style={{ color: T.text }}>{nume}</strong>!
          </p>
        </div>

        <div style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: T.shadowCard,
          animation: 'fadeUpDelay 0.5s ease both',
        }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: T.muted,
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '16px',
          }}>
            Detalii programare
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {detalii.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  animation: `fadeUpDelay 0.5s ease ${0.1 * i + 0.4}s both`,
                }}
              >
                <span style={{
                  fontSize: '18px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: T.accentSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {d.icon}
                </span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: T.muted }}>{d.label}</p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: T.text }}>{d.valoare}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{
          color: T.muted,
          fontSize: '13px',
          textAlign: 'center',
          marginBottom: '16px',
          animation: 'fadeUpDelay 0.5s ease 0.6s both',
        }}>
          Daca ai introdus adresa de email, vei primi o confirmare si acolo.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          animation: 'fadeUpDelay 0.5s ease 0.7s both',
        }}>
          
             <button
            onClick={() => window.open(getLinkGoogleCalendar(), '_blank')}
            onMouseEnter={() => setHoverGoogle(true)}
            onMouseLeave={() => setHoverGoogle(false)}
            style={{
              padding: '13px 28px',
              borderRadius: '10px',
              border: `0.5px solid ${hoverGoogle ? T.accent : T.border}`,
              backgroundColor: hoverGoogle ? T.accentSoft : T.surface,
              color: hoverGoogle ? T.accent : T.text,
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              boxSizing: 'border-box',
              transition: T.transition,
            }}
          >
            Adauga in Google Calendar
          </button>

          <button
            onClick={descarcaICS}
            onMouseEnter={() => setHoverIcs(true)}
            onMouseLeave={() => setHoverIcs(false)}
            style={{
              padding: '13px 28px',
              borderRadius: '10px',
              border: `0.5px solid ${T.border}`,
              backgroundColor: hoverIcs ? T.surface2 : T.surface,
              color: hoverIcs ? T.text : T.muted,
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              transition: T.transition,
            }}
          >
            Adauga in Apple Calendar (.ics)
          </button>

          <button
            onClick={onNouaProgramare}
            onMouseEnter={() => setHoverNou(true)}
            onMouseLeave={() => setHoverNou(false)}
            style={{
              padding: '14px 28px',
              borderRadius: '10px',
              border: 'none',
              background: hoverNou
                ? `linear-gradient(135deg, #5a7af5, ${T.accent})`
                : `linear-gradient(135deg, ${T.accent}, #3a56d4)`,
              color: '#fff',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              transition: T.transition,
              transform: hoverNou ? 'scale(1.02)' : 'scale(1)',
              boxShadow: hoverNou ? T.shadowHover : T.shadow,
            }}
          >
            Fa o noua programare
          </button>
        </div>

      </div>
    </div>
  )
}

export default Confirmare