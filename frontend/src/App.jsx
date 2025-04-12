import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Resume from './pages/Resume'
import ProfileScraper from './pages/ProfileScraper'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-scraper" element={<ProfileScraper />} />
          <Route path="/resume" element={<Resume />} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App