# Planora — Documentație Proiect

## Overview
Platformă web de programări online pentru o frizerie. Vizitatorii pot face programări fără cont, iar adminul gestionează totul dintr-un dashboard securizat.

---

## Stack Tehnic
- **Frontend**: React + Vite
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel (auto-deploy din GitHub)
- **Email**: EmailJS
- **Cod sursă**: GitHub — `github.com/aiskoro/planora`
- **Site live**: `planora-weld-three.vercel.app`

---

## Credențiale & Chei

### Supabase
- **URL**: `https://owkolupotmipgqekzgvq.supabase.co`
- **Anon Key**: `sb_publishable_sPZb4v1VA_Sox5hp04Zecw_qaXT15IT`
- **Admin email**: `admin@planora.ro`

### EmailJS
- **Service ID**: `service_cjhpwqf`
- **Template ID**: `template_h0dhp0n`
- **Public Key**: `-uTukwwl1zGidBW8S`

### Vercel Environment Variables
```
VITE_SUPABASE_URL=https://owkolupotmipgqekzgvq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_sPZb4v1VA_Sox5hp04Zecw_qaXT15IT
VITE_EMAILJS_SERVICE_ID=service_cjhpwqf
VITE_EMAILJS_TEMPLATE_ID=template_h0dhp0n
VITE_EMAILJS_PUBLIC_KEY=-uTukwwl1zGidBW8S
```

---

## Structura Fișiere

```
src/
├── components/
│   ├── ServiciiList.jsx       # Lista servicii — chip-uri toggle, durată totală calculată
│   ├── CalendarPicker.jsx     # Calendar cu zile blocate + orar, navigare luni
│   ├── OrePicker.jsx          # Ore disponibile din orar, slot-uri 30min, overlap check
│   ├── BookingForm.jsx        # Formular programare + validări + EmailJS + cancel_link
│   ├── AdminPanel.jsx         # Dashboard programări (active/istoric/filtre)
│   ├── ZileBlocate.jsx        # Gestionare intervale zile blocate
│   ├── OrarSaptamanal.jsx     # Orar pe zile săptămână
│   └── GestionareServicii.jsx # CRUD servicii din admin
├── pages/
│   ├── Home.jsx               # Pagina vizitator — layout principal, logo Timevia
│   ├── Admin.jsx              # Dashboard admin cu tab-uri (4 tab-uri)
│   ├── Confirmare.jsx         # Pagina confirmare programare (inline în Home)
│   └── Anulare.jsx            # Pagina anulare programare via token unic (/anulare/:token)
├── styles/
│   └── theme.js               # Token-uri de design (T.bg, T.accent, T.surface etc.)
├── lib/
│   └── supabase.js            # Client Supabase
├── App.jsx                    # Routing: / și /admin și /anulare/:token
└── main.jsx
```

---

## Baza de Date (Supabase)

### Tabele

#### `servicii`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| nume | text | Numele serviciului |
| durata | integer | Durata în minute |
| activ | boolean | Vizibil pe site |
| ordine | integer | Ordinea afișării |

**Date inițiale**: Tuns (30min), Barba (20min), Spalat (15min), Vopsit par (60min), Vopsit barba (30min)

#### `programari`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| nume_client | text | Minim 3 litere, doar alfabetice |
| telefon | text | Format 07XXXXXXXX |
| email | text | Opțional |
| data_programare | date | Data programării |
| ora_start | time | Ora de început |
| ora_sfarsit | time | Ora de sfârșit (calculată) |
| durata_totala | integer | Suma duratelor serviciilor |
| status | text | 'confirmata' / 'anulata' |
| cancel_token | uuid | Token unic pentru anulare de către client |
| created_at | timestamp | Auto |

#### `programari_servicii`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| programare_id | uuid | FK → programari (cascade delete) |
| serviciu_id | uuid | FK → servicii |

#### `zile_blocate`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| data | date | Data de început interval |
| data_sfarsit | date | Data de sfârșit interval |
| motiv | text | Opțional |
| permanent | boolean | (rezervat viitor) |

#### `orar`
| Coloană | Tip | Descriere |
|---------|-----|-----------|
| id | uuid | PK |
| zi_saptamana | integer | 0=Dum, 1=Lun, ..., 6=Sâm |
| deschis | boolean | Dacă e zi lucrătoare |
| ora_start | time | Ora de deschidere |
| ora_sfarsit | time | Ora de închidere |

**Default**: Luni-Vineri 09:00-18:00, Sâmbătă 09:00-14:00, Duminică închis

---

## RLS Policies (Supabase)

```sql
-- Servicii
alter table servicii enable row level security;
create policy "servicii_public" on servicii for select using (true);
create policy "admin_insert_servicii" on servicii for insert with check (auth.role() = 'authenticated');
create policy "admin_update_servicii" on servicii for update using (auth.role() = 'authenticated');

-- Programari
alter table programari enable row level security;
create policy "programari_public" on programari for select using (true);
create policy "programari_insert" on programari for insert with check (true);
create policy "admin_update_programari" on programari for update using (auth.role() = 'authenticated');
create policy "admin_delete_programari" on programari for delete using (auth.role() = 'authenticated');

-- Programari_servicii
alter table programari_servicii enable row level security;
create policy "programari_servicii_public" on programari_servicii for select using (true);
create policy "programari_servicii_insert" on programari_servicii for insert with check (true);
create policy "admin_delete_programari_servicii" on programari_servicii for delete using (auth.role() = 'authenticated');

-- Zile blocate
alter table zile_blocate enable row level security;
create policy "zile_blocate_public" on zile_blocate for select using (true);
create policy "admin_insert_zile_blocate" on zile_blocate for insert with check (auth.role() = 'authenticated');
create policy "admin_delete_zile_blocate" on zile_blocate for delete using (auth.role() = 'authenticated');

-- Orar
alter table orar enable row level security;
create policy "orar_public" on orar for select using (true);
create policy "admin_update_orar" on orar for update using (auth.role() = 'authenticated');
```

---

## Design System (`src/styles/theme.js`)

Toate componentele folosesc token-uri din `T` în loc de culori hardcodate:

```js
export const T = {
  bg: '#f0f2f8',           // Fundal pagină
  surface: '#ffffff',      // Card principal
  surface2: '#f5f7ff',     // Fundal input / buton inactiv
  border: 'rgba(79,107,240,0.12)',
  borderHover: 'rgba(79,107,240,0.25)',
  text: '#0d0f1a',
  muted: '#6b7280',
  accent: '#4F6BF0',       // Albastru principal
  accentDark: '#1e2a6e',
  accentSoft: 'rgba(79,107,240,0.1)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.08)',
  success: '#22c55e',
}
```

**Componente care folosesc theme**: `ServiciiList`, `CalendarPicker`, `OrePicker`, `BookingForm`, `Home`

**Componente care NU folosesc theme** (inline style hardcodat): `AdminPanel`, `ZileBlocate`, `OrarSaptamanal`, `GestionareServicii`, `Admin`, `Anulare`, `Confirmare`

---

## Funcționalități Implementate

### Pagina Vizitator (`/`)
- ✅ Logo Timevia (`/logo.svg`) centrat în header
- ✅ Listă servicii — chip-uri toggle cu durată, badge durată totală
- ✅ Calendar — navigare luni, zile trecute inactive, zile blocate roșii, zile închise gri
- ✅ Ore disponibile — generate din orar, slot-uri de 30min, ore ocupate inactive
- ✅ Formular — nume (min 3 litere, doar alfabetice), telefon (07XXXXXXXXX), email (opțional)
- ✅ Validare duplicat — blochează dacă există programare viitoare activă pe același telefon
- ✅ Email confirmare via EmailJS cu link Google Calendar + link anulare
- ✅ Pagină confirmare inline (înlocuiește Home) cu buton ICS + Google Calendar + programare nouă

### Anulare de către client (`/anulare/:token`)
- ✅ Token unic (`cancel_token` uuid) generat la creare programare, trimis în email
- ✅ Verificare dacă programarea există, e deja anulată, sau e prea apropiată (< 2 ore)
- ✅ Stări: `incarcare` / `confirmare` / `anulata` / `expirata` / `inexistenta` / `eroare`
- ✅ Anulare posibilă doar cu minimum 2 ore înainte

### Dashboard Admin (`/admin`)
- ✅ Login securizat Supabase Auth
- ✅ Tab **Programări** — active vs istoric (trecute/anulate)
- ✅ Filtre — după dată, nume (contains), telefon exact
- ✅ Anulare programare cu confirmare (rămâne în istoric ca "Anulată")
- ✅ Tab **Zile blocate** — intervale cu dată start/stop și motiv, secțiune viitoare vs trecute
- ✅ Tab **Orar** — zile săptămână, ore deschidere/închidere, buton salvează cu feedback vizual
- ✅ Tab **Servicii** — adăugare, editare, activare/dezactivare

---

## Logică Importantă

### Generare ore disponibile
- Se pornește de la `ora_start` din orar pentru ziua respectivă
- Slot-uri din 30 în 30 de minute
- Se verifică conflicte cu programările existente (overlap complet)
- Pentru ziua de azi, se exclud orele trecute

### Calcul durată
- Clientul bifează mai multe servicii
- `durata_totala = suma duratelor serviciilor bifate`
- `ora_sfarsit = ora_start + durata_totala`

### Calendar (timezone fix)
- Se folosește constructorul `new Date(an, luna-1, zi)` în loc de `toISOString()` pentru a evita probleme de timezone

### Anulare client
- La creare programare se salvează `cancel_token` (uuid generat de Supabase default)
- Link-ul din email: `{origin}/anulare/{cancel_token}`
- Anularea e blocată dacă diferența dintre acum și ora programării < 120 minute

---

## Ce Urmează (Next Steps)

1. **UI/UX — aplicare theme complet** — `AdminPanel`, `ZileBlocate`, `OrarSaptamanal`, `GestionareServicii`, `Admin`, `Anulare`, `Confirmare` să folosească token-urile din `T`
2. **Blocare ore specifice** — intervale orare blocate într-o zi (ex. pauză masă)
3. **Captcha** — protecție anti-spam la formular
4. **Audit Logs** — istoric modificări (cine a anulat, când, ce)
5. **Frizeri multipli** — fiecare frizer cu propriul calendar
6. **Dark Mode** — după ce theme-ul e aplicat complet peste tot
7. **Mutare pe domeniu propriu** — ultimul pas

---

## Comenzi Utile

```bash
# Dezvoltare locală
npm run dev

# Build producție
npm run build

# Deploy (auto prin push)
git add .
git commit -m "descriere"
git push
```
