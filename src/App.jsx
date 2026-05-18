import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Anulare from './pages/Anulare'
import PoliticaConfidentialitate from './pages/PoliticaConfidentialitate'
import TermeniConditii from './pages/TermeniConditii'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
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