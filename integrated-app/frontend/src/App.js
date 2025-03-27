import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProviderContextProvider } from './web3/ProviderContext';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateCampaignPage from './pages/admin/CreateCampaignPage';
import NotFoundPage from './pages/NotFoundPage';
import FAQPage from './pages/FAQ';
import PrivacyPolicyPage from './pages/Privacy';
import TermsOfServicePage from './pages/Terms';
import WhitepaperPage from './pages/WhitepaperPage';

function App() {
  return (
    <Router>
      <ProviderContextProvider>
        <AuthProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/create-campaign" element={<CreateCampaignPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/whitepaper" element={<WhitepaperPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ProviderContextProvider>
    </Router>
  );
}

export default App; 