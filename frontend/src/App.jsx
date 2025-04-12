import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Resume from './pages/Resume'
import ProfileScraper from './pages/ProfileScraper'
import Dashboard from './pages/Dashboard'
import LinkedinComp from './pages/LinkedinComp'
import ResumeUploadPage from './pages/ResumeUpload'
import JobPostPage from './pages/JobPost'
import NotFoundPage from './pages/NotFound'


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/resume/upload" element={<ResumeUploadPage />} /> */}
          <Route path="/linkedin-comparison" element={<LinkedinComp />} />
          <Route path="/jobpost" element={<JobPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App