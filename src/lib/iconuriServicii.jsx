// ============================================================================
// Timevia — set de iconuri pentru servicii
// Se pune la: src/lib/iconuriServicii.jsx
// ============================================================================
//
// De ce există: până acum `ServiciiList.jsx` alegea un emoji după numele exact
// al serviciului ('Tuns' → ✂️), cu fallback 💈 — stâlp de frizerie. Orice
// serviciu care nu se numea fix ca la frizerie primea stâlp de frizerie, pe
// pagina publică de rezervare. Pentru o platformă multi-vertical, asta era un
// bug, nu un detaliu cosmetic.
//
// Acum iconul e o alegere explicită, salvată în coloana `servicii.icon`.
// Fără icon ales, nu se desenează nimic — starea implicită e neutră, nu o
// ghicire greșită.
//
// Sunt SVG-uri cu linii, nu emoji: brand book-ul spune explicit „fără emoji ca
// iconițe în UI". Toate moștenesc culoarea textului prin `currentColor`, deci
// se comportă corect și pe temă închisă, și pe cea deschisă.
//
// Ca să adaugi un icon nou: pune o intrare în ICONURI cu o cheie nouă. Nu
// schimba niciodată o cheie existentă — e salvată în baza de date.
// ============================================================================

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const ICONURI = [
  // ---- Generice -----------------------------------------------------------
  {
    cheie: 'ceas', nume: 'Ceas', grup: 'Generice',
    desen: <><circle cx="12" cy="12" r="9" {...S} /><path d="M12 7v5l3 2" {...S} /></>,
  },
  {
    cheie: 'stea', nume: 'Stea', grup: 'Generice',
    desen: <path d="M12 3l2.1 5.4L19.5 10l-5.4 2.1L12 17.5l-2.1-5.4L4.5 10l5.4-1.6L12 3z" {...S} />,
  },
  {
    cheie: 'picatura', nume: 'Picătură', grup: 'Generice',
    desen: <path d="M12 3s6 6.5 6 10a6 6 0 01-12 0c0-3.5 6-10 6-10z" {...S} />,
  },
  {
    cheie: 'scut', nume: 'Scut', grup: 'Generice',
    desen: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...S} /><path d="M9 12l2 2 4-4" {...S} /></>,
  },

  // ---- Înfrumusețare ------------------------------------------------------
  {
    cheie: 'foarfeca', nume: 'Foarfecă', grup: 'Înfrumusețare',
    desen: <><circle cx="6" cy="6" r="2.5" {...S} /><circle cx="6" cy="18" r="2.5" {...S} /><path d="M8.1 7.4L20 18M8.1 16.6L20 6" {...S} /></>,
  },
  {
    cheie: 'brici', nume: 'Aparat de ras', grup: 'Înfrumusețare',
    desen: <><rect x="4.5" y="4" width="15" height="5" rx="1.8" {...S} /><path d="M8 9v1.6M12 9v1.6M16 9v1.6" {...S} /><path d="M12 10.6V20" {...S} /><path d="M10 20h4" {...S} /></>,
  },
  {
    cheie: 'pieptene', nume: 'Pieptene', grup: 'Înfrumusețare',
    desen: <><rect x="4" y="7" width="16" height="3.5" rx="1" {...S} /><path d="M6.5 10.5v6M9.5 10.5v6M12.5 10.5v6M15.5 10.5v6M18 10.5v6" {...S} /></>,
  },
  {
    cheie: 'pensula', nume: 'Pensulă', grup: 'Înfrumusețare',
    desen: <><path d="M12 3v8" {...S} /><rect x="8.5" y="11" width="7" height="3" rx="0.8" {...S} /><path d="M9.2 14c0 3 .6 6.5 2.8 6.5s2.8-3.5 2.8-6.5" {...S} /></>,
  },
  {
    cheie: 'mana', nume: 'Mână', grup: 'Înfrumusețare',
    desen: <><path d="M9 11V5.5a1.5 1.5 0 013 0V11" {...S} /><path d="M12 11V4.5a1.5 1.5 0 013 0V11" {...S} /><path d="M15 11V6.5a1.5 1.5 0 013 0V13a7 7 0 01-7 7h-1a6 6 0 01-6-6v-2.5a1.5 1.5 0 013 0V13" {...S} /></>,
  },
  {
    cheie: 'sticluta', nume: 'Sticluță (ojă)', grup: 'Înfrumusețare',
    desen: <><rect x="10" y="2.5" width="4" height="4" rx="0.8" {...S} /><path d="M12 6.5v2" {...S} /><rect x="7.5" y="8.5" width="9" height="12" rx="2" {...S} /></>,
  },

  // ---- Medical ------------------------------------------------------------
  {
    cheie: 'medical', nume: 'Cruce medicală', grup: 'Medical',
    desen: <><circle cx="12" cy="12" r="9" {...S} /><path d="M12 8v8M8 12h8" {...S} /></>,
  },
  {
    cheie: 'dinte', nume: 'Dinte', grup: 'Medical',
    desen: <path d="M12 4c-2 0-2.5-1-4.5-1C5 3 4 5 4 7.5c0 3 1.5 4.5 2 7.5.4 2.4.6 5 2 5s1.4-3 2-5c.3-1 .8-1.5 2-1.5s1.7.5 2 1.5c.6 2 .6 5 2 5s1.6-2.6 2-5c.5-3 2-4.5 2-7.5C20 5 19 3 16.5 3 14.5 3 14 4 12 4z" {...S} />,
  },
  {
    cheie: 'puls', nume: 'Puls', grup: 'Medical',
    desen: <path d="M3 12h4l2.5-5 3.5 10 2.5-5 1.5 2h4" {...S} />,
  },

  // ---- Auto ---------------------------------------------------------------
  {
    cheie: 'masina', nume: 'Mașină', grup: 'Auto',
    desen: <><path d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11" {...S} /><rect x="3" y="11" width="18" height="6" rx="2" {...S} /><circle cx="7.5" cy="17.5" r="1.5" {...S} /><circle cx="16.5" cy="17.5" r="1.5" {...S} /></>,
  },
  {
    cheie: 'cheie', nume: 'Cheie fixă', grup: 'Auto',
    desen: <path d="M19.5 4.5l-3 3 2 2 3-3a5.5 5.5 0 01-7.4 6.6l-6.9 6.9a2.2 2.2 0 01-3.1-3.1l6.9-6.9A5.5 5.5 0 0119.5 4.5z" {...S} />,
  },
  {
    cheie: 'anvelopa', nume: 'Anvelopă', grup: 'Auto',
    desen: <><circle cx="12" cy="12" r="9" {...S} /><circle cx="12" cy="12" r="3.5" {...S} /><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21" {...S} /></>,
  },

  // ---- Birou / acte -------------------------------------------------------
  {
    cheie: 'document', nume: 'Document', grup: 'Birou',
    desen: <><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" {...S} /><path d="M14 3v5h5" {...S} /><path d="M9 13h6M9 17h4" {...S} /></>,
  },
  {
    cheie: 'stampila', nume: 'Ștampilă', grup: 'Birou',
    desen: <><path d="M8.5 10V7a3.5 3.5 0 117 0v3" {...S} /><path d="M5 14h14l1 4H4z" {...S} /><path d="M4 21h16" {...S} /></>,
  },

  // ---- Altele -------------------------------------------------------------
  {
    cheie: 'camera', nume: 'Aparat foto', grup: 'Altele',
    desen: <><rect x="3" y="7" width="18" height="13" rx="2" {...S} /><circle cx="12" cy="13.5" r="3.5" {...S} /><path d="M8 7l1.5-2.5h5L16 7" {...S} /></>,
  },
  {
    cheie: 'haltera', nume: 'Halteră', grup: 'Altele',
    desen: <path d="M4 9v6M7 6.5v11M17 6.5v11M20 9v6M7 12h10" {...S} />,
  },
  {
    cheie: 'laba', nume: 'Lăbuță', grup: 'Altele',
    desen: <><circle cx="6.5" cy="9.5" r="2" {...S} /><circle cx="11" cy="7" r="2" {...S} /><circle cx="16" cy="8.5" r="2" {...S} /><circle cx="19" cy="13" r="1.8" {...S} /><path d="M12 12.5c-3 0-5 2.2-5 4.3S9 20 12 20s4.5-1.2 4.5-3.2S15 12.5 12 12.5z" {...S} /></>,
  },
]

// Căutare rapidă după cheie
const DUPA_CHEIE = Object.fromEntries(ICONURI.map((i) => [i.cheie, i]))

export const GRUPURI = [...new Set(ICONURI.map((i) => i.grup))]

/**
 * Desenează iconul unui serviciu.
 * Fără cheie, sau cu o cheie necunoscută (ex. un icon scos din set după ce a
 * fost deja salvat undeva), nu desenează nimic — niciodată un icon greșit.
 */
export function IconServiciu({ cheie, size = 16, style }) {
  const icon = cheie ? DUPA_CHEIE[cheie] : null
  if (!icon) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {icon.desen}
    </svg>
  )
}

/**
 * Selector de icon, grupat pe categorii. Prima opțiune e „fără icon".
 * Folosit și în dashboard-ul afacerii, și în panoul de platformă.
 */
export function SelectorIcon({ T, valoare, onChange, eticheta = 'Icon' }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: 12, color: T.muted, marginBottom: 8 }}>
        {eticheta} <span style={{ opacity: 0.7 }}>(opțional)</span>
      </span>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {/* Fără icon */}
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Fără icon"
          style={{
            width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, lineHeight: 1,
            border: `1px solid ${!valoare ? T.accent : T.border}`,
            background: !valoare ? T.accentSoft : T.surface,
            color: !valoare ? T.accent : T.muted,
            transition: T.transition,
          }}
        >
          —
        </button>

        {GRUPURI.map((grup) => (
          <div key={grup} style={{ display: 'contents' }}>
            {ICONURI.filter((i) => i.grup === grup).map((icon) => {
              const ales = valoare === icon.cheie
              return (
                <button
                  key={icon.cheie}
                  type="button"
                  onClick={() => onChange(icon.cheie)}
                  title={`${icon.nume} · ${icon.grup}`}
                  style={{
                    width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${ales ? T.accent : T.border}`,
                    background: ales ? T.accentSoft : T.surface,
                    color: ales ? T.accent : T.muted,
                    transition: T.transition,
                  }}
                >
                  <IconServiciu cheie={icon.cheie} size={18} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}