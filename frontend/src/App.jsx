import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Resume from './pages/Resume'
import LinkedinComp from './pages/LinkedinComp'
import Dashboard from './pages/Dashboard'
import ResumeUploadPage from './pages/ResumeUpload'
import JobPostPage from './pages/JobPost'
import NotFoundPage from './pages/NotFound'


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/resume" element={
            <PrivateRoute>
              <Resume />
            </PrivateRoute>
          } />
          
          <Route path="/resume/upload" element={
            <PrivateRoute>
              <ResumeUploadPage />
            </PrivateRoute>
          } />
          
          <Route path="/linkedin-comparison" element={
            <PrivateRoute>
              <LinkedinComp />
            </PrivateRoute>
          } />
          
          <Route path="/jobpost" element={
            <PrivateRoute>
              <JobPostPage />
            </PrivateRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App