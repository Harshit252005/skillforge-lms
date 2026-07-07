import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentClassroom from './components/StudentClassroom';

// Admin Components
import AdminSignup from './components/AdminSignup';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// Student Components (We will create these next)
import UserSignup from './components/UserSignup';
import UserLogin from './components/UserLogin';
import UserDashboard from './components/UserDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 py-12 px-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Admin routes must be strictly wrapped inside <Routes> */}
          <Route path="/signup" element={<AdminSignup />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />

          {/* Student routes */}
          <Route path="/student/signup" element={<UserSignup />} />
          <Route path="/student/login" element={<UserLogin />} />
          <Route path="/student/dashboard" element={<UserDashboard />} />
          <Route path="/student/course/:courseId" element={<StudentClassroom />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;