import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Anulare from './pages/Anulare'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/anulare/:token" element={<Anulare />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App