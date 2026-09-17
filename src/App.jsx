import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import { useTenant } from './hooks/useTenant'
import CookieConsent from './components/CookieConsent'
import { initAnalytics } from './lib/analytics'

// ---- Rute incarcate lazy (code-splitting) ----
// Astea nu sunt niciodata prima pagina vazuta de un vizitator nou (landing
// page sau formular de booking) — deci nu au ce cauta in bundle-ul initial.
// Fiecare devine propriul chunk JS, cerut de la server doar cand cineva
// chiar navigheaza acolo. Cel mai mare castig: Platform.jsx (52KB sursa) si
// Admin.jsx (care trage dupa el si recharts, folosit doar in Statistici).
const Admin = lazy(() => import('./pages/Admin'))
const Platform = lazy(() => import('./pages/Platform'))
const Anulare = lazy(() => import('./pages/Anulare'))
const PoliticaConfidentialitate = lazy(() => import('./pages/PoliticaConfidentialitate'))
const TermeniConditii = lazy(() => import('./pages/TermeniConditii'))

// ---- Root ('/') e diferit in functie de domeniu ----
// - Pe domeniul principal (timevia.ro / www / localhost) ramane mereu Landing,
//   exact ca pana acum.
// - Pe orice subdomeniu de tenant, root arata formularul public de rezervare
//   (Home), NU pagina de prezentare a Timevia — asta era bug-ul: pana acum
//   formularul public era accesibil doar la .../demo, o cale pe care niciun
//   tenant nou n-ar fi ghicit-o.
// - Exceptie: tenanti cu booking_public = false (ex. Nails) raman neschimbati
//   — arata tot Landing la root, la fel ca azi, pentru ca la ei clientii nu
//   rezerva singuri, ci angajatul face programarea din admin. Coloana asta
//   e generica, deci se poate seta la fel si pentru alti clienti viitori
//   care vor acelasi model (booking doar din admin, nu formular public).
function RootRoute() {
  const hostname = window.location.hostname
  const esteDomeniulPrincipal =
    hostname === 'localhost' ||
    hostname === 'timevia.ro' ||
    hostname === 'www.timevia.ro'

  const { tenant, loading } = useTenant()

  if (esteDomeniulPrincipal) return <Landing />
  if (loading) return null
  if (tenant?.booking_public === false) return <Landing />
  return <Home />
}

function App() {
  // Reîncarcă GTM automat dacă vizitatorul a acceptat deja cookie-urile
  // la o vizită anterioară (vezi CookieConsent.jsx + src/lib/analytics.js).
  useEffect(() => {
    initAnalytics()
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/demo" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          {/* Panoul de platforma (super-admin). Componenta verifica singura ca
              suntem pe domeniul principal si ca userul e in `platform_admins`;
              pe un subdomeniu de tenant afiseaza "Pagina nu exista". */}
          <Route path="/platform" element={<Platform />} />
          <Route path="/anulare/:token" element={<Anulare />} />
          <Route path="/politica-confidentialitate" element={<PoliticaConfidentialitate />} />
          <Route path="/termeni-conditii" element={<TermeniConditii />} />
        </Routes>
      </Suspense>
      <CookieConsent />
    </BrowserRouter>
  )
}

export default App