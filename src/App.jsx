import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Anulare from './pages/Anulare'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/anulare/:token" element={<Anulare />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App