import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Anulare from './pages/Anulare'
import PoliticaConfidentialitate from './pages/PoliticaConfidentialitate'
import TermeniConditii from './pages/TermeniConditii'
import { useTenant } from './hooks/useTenant'

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/demo" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/anulare/:token" element={<Anulare />} />
        <Route path="/politica-confidentialitate" element={<PoliticaConfidentialitate />} />
        <Route path="/termeni-conditii" element={<TermeniConditii />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
