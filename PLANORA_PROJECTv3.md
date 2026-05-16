# Planora — Documentație Proiect

## Overview
Platformă web de programări online pentru o frizerie. Vizitatorii pot face programări fără cont, aleg frizerul dorit, iar adminul/frizerii gestionează totul dintr-un dashboard securizat.

---

## Stack Tehnic
- **Frontend**: React + Vite
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel (auto-deploy din GitHub)
- **Email**: EmailJS
- **Font**: DM Sans (Google Fonts)
- **Cod sursă**: GitHub — `github.com/aiskoro/planora`
- **Site live**: `planora-weld-three.vercel.app`

---

## Credențiale & Chei

### Supabase
- **URL**: `https://owkolupotmipgqekzgvq.supabase.co`
- **Admin email**: `admin@planora.ro`
- **Admin user_id**: `0eabcc9b-8972-4b40-ab03-bcb835204d65`

### EmailJS
- **Service ID**: `service_cjhpwqf`
- **Template ID**: `template_h0dhp0n`
- **Public Key**: `-uTukwwl1zGidBW8S`

### Vercel Environment Variables
```
VITE_SUPABASE_URL=https://owkolupotmipgqekzgvq.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_EMAILJS_SERVICE_ID=service_cjhpwqf
VITE_EMAILJS_TEMPLATE_ID=template_h0dhp0n
VITE_EMAILJS_PUBLIC_KEY=-uTukwwl1zGidBW8S
```

---

## Structura Fișiere

```
src/
├── components/
│   ├── ServiciiList.jsx         # Chip-uri toggle servicii, durată totală, icon per serviciu, pop animation
│   ├── CalendarPicker.jsx       # Calendar cu slide animation, zile blocate/închise, frizer_id filtrat
│   ├── OrePicker.jsx            # Ore disponibile din orar frizer, overlap check, fade-in animation
│   ├── BookingForm.jsx          # Formular + validări + EmailJS + cancel_link + frizer_id salvat
│   ├── AdminPanel.jsx           # Dashboard programări (active/istoric/filtre), badge frizer pe master
│   ├── ZileBlocate.jsx          # Gestionare intervale zile blocate per frizer
│   ├── OreBlocate.jsx           # Gestionare intervale orare blocate per frizer
│   ├── OrarSaptamanal.jsx       # Orar săptămânal per frizer, toggle switch animat
│   ├── GestionareServicii.jsx   # CRUD servicii per frizer
│   └── GestionareFrizeri.jsx    # CRUD frizeri (doar master) — creare cont + profil
├── hooks/
│   └── useFrizer.js             # Hook: detectează dacă e master sau sub-cont frizer
├── pages/
│   ├── Home.jsx                 # Selectare frizer → servicii → calendar → ore → formular
│   ├── Admin.jsx                # Dashboard cu tab-uri diferite pentru master vs frizer
│   ├── Confirmare.jsx           # Pagina confirmare cu animații (checkmark, fadeUp, scaleIn)
│   └── Anulare.jsx              # Anulare programare via token unic (/anulare/:token)
├── styles/
│   └── theme.js                 # Token-uri design
├── lib/
│   └── supabase.js
├── App.jsx                      # Routing: / și /admin și /anulare/:token
└── main.jsx
```

---

## Baza de Date (Supabase)

### `frizeri`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users (cascade delete) |
| nume | text | |
| email | text | |
| avatar_url | text | Opțional |
| activ | boolean | Vizibil pe site |
| created_at | timestamp | Auto |

### `servicii`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| frizer_id | uuid | FK → frizeri |
| nume | text | |
| durata | integer | Minute |
| activ | boolean | |
| ordine | integer | |

### `programari`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| frizer_id | uuid | FK → frizeri |
| nume_client | text | Min 3 litere, doar alfabetice |
| telefon | text | Format 07XXXXXXXX |
| email | text | Opțional |
| data_programare | date | |
| ora_start | time | |
| ora_sfarsit | time | Calculată |
| durata_totala | integer | |
| status | text | 'confirmata' / 'anulata' |
| cancel_token | uuid | Token unic anulare client |
| created_at | timestamp | Auto |

### `programari_servicii`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| programare_id | uuid | FK → programari (cascade) |
| serviciu_id | uuid | FK → servicii |

### `orar`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| frizer_id | uuid | FK → frizeri |
| zi_saptamana | integer | 0=Dum ... 6=Sâm |
| deschis | boolean | |
| ora_start | time | |
| ora_sfarsit | time | |

**Trigger**: `trigger_orar_default` — la inserare frizer nou, creează automat 7 zile în orar (L-V 09-18, Sâm 09-14, Dum închis).

### `zile_blocate`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| frizer_id | uuid | FK → frizeri |
| data | date | Start interval |
| data_sfarsit | date | Sfârșit interval |
| motiv | text | Opțional |

### `ore_blocate`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| frizer_id | uuid | FK → frizeri |
| data | date | |
| ora_start | time | |
| ora_sfarsit | time | |
| motiv | text | Opțional |
| created_at | timestamp | Auto |

---

## Sistem Auth & Roluri

### Master (`admin@planora.ro`)
- user_id: `0eabcc9b-8972-4b40-ab03-bcb835204d65`
- Vede toate programările tuturor frierilor (badge pe fiecare)
- Tab extra: **Frizeri** — adaugă/dezactivează frizeri
- Tab-uri: Programări, Frizeri, Zile blocate, Ore blocate, Orar, Servicii

### Sub-cont Frizer
- Vede doar propriile programări
- Tab-uri: Programarile mele, Zile blocate, Ore blocate, Orar, Servicii

### Hook `useFrizer.js`
```js
const MASTER_ID = '0eabcc9b-8972-4b40-ab03-bcb835204d65'
// returneaza { frizer, isMaster, loading }
```

---

## Design System (`src/styles/theme.js`)

```js
export const T = {
  bg: '#f0f2f8',
  surface: '#ffffff',
  surface2: '#f5f7ff',
  border: 'rgba(79,107,240,0.12)',
  borderHover: 'rgba(79,107,240,0.25)',
  text: '#0d0f1a',
  muted: '#6b7280',
  accent: '#4F6BF0',
  accentDark: '#1e2a6e',
  accentSoft: 'rgba(79,107,240,0.1)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.08)',
  success: '#22c55e',
  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
  shadow: '0 2px 12px rgba(79,107,240,0.10)',
  shadowHover: '0 6px 24px rgba(79,107,240,0.18)',
  shadowCard: '0 1px 4px rgba(13,15,26,0.06)',
}
```

---

## Animații Implementate

- **ServiciiList**: pop effect la selectare chip
- **OrePicker**: fadeInOre la schimbare zi, popOra la selectare, hover scale
- **CalendarPicker**: slideInLeft/Right la navigare luni, hover butoane nav
- **BookingForm**: spinner la loading, gradient hover pe buton
- **Confirmare**: scaleIn checkmark SVG, fadeUp/fadeUpDelay pe conținut
- **Anulare**: fadeUp card, scaleIn icon success
- **OrarSaptamanal**: toggle switch animat

---

## Flow Client

1. Selectează frizerul
2. Selectează serviciile (filtrate per frizer)
3. Selectează data (calendar per frizer)
4. Selectează ora (sloturi 30min, overlap check per frizer)
5. Completează formularul
6. Pagină confirmare animată + email cu Google Calendar + link anulare

---

## Logică Importantă

- **Duplicat check**: același telefon + același frizer + programare activă viitoare → blocat
- **Anulare client**: token unic, blocat dacă < 120 minute până la programare
- **Orar default**: trigger Supabase la creare frizer nou
- **Ore disponibile**: din orar frizer, minus programări + ore blocate ale aceluiași frizer

---

## Ce Urmează (Next Steps)

1. **Audit Logs** — logare anulări (cine a anulat, când, ce programare, admin sau client)
2. **Landing page** — pagină de prezentare înainte de booking + UI/UX îmbunătățit
3. **Captcha** — protecție anti-spam
4. **Dark Mode**
5. **Domeniu propriu**

---

## Comenzi Utile

```bash
npm run dev
npm run build
git add . && git commit -m "descriere" && git push
```
