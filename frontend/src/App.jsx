import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobTracker from './pages/JobTracker';
import InterviewDiary from './pages/InterviewDiary';
import ResumeImprover from './pages/ResumeImprover';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Resumes from './pages/Resumes';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="analyzer" element={<ResumeAnalyzer />} />
            <Route path="improver" element={<ResumeImprover />} />
            <Route path="jobs" element={<JobTracker />} />
            <Route path="diary" element={<InterviewDiary />} />
          </Route>

          <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Profile />} />
          </Route>

          <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Settings />} />
          </Route>

          <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Notifications />} />
          </Route>

          <Route path="/dashboard/resumes" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Resumes />} />
          </Route>

          <Route path="/about"   element={<About />}   />
          <Route path="/faq"     element={<FAQ />}     />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms"   element={<Terms />}   />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
