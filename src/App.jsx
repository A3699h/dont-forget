import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Homepage from './components/Homepage';
import Login from './components/login/Login';
import Signup from './components/login/Signup';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import Layout from './components/Layout';
import Blog from './components/Blog';
import PrivacyPolicy from './components/PrivacyPolicy';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import AboutUs from './components/AboutUs';
import PublicBooking from './components/PublicBooking';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              } 
            />
            <Route path="/book" element={<PublicBooking />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
