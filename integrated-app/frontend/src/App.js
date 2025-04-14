import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProviderContextProvider } from './web3/ProviderContext';
import ThemeProvider from './context/ThemeContext';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer/index';
import HomePage from './pages/HomePage/index';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateCampaignPage from './pages/admin/CreateCampaignPage';
import NotFoundPage from './pages/NotFoundPage';
import FAQPage from './pages/FAQ';
import PrivacyPolicyPage from './pages/Privacy';
import TermsOfServicePage from './pages/Terms';
import DonateProjectPage from './pages/DonateProjectPage';
import WhitepaperPage from './pages/WhitepaperPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProviderContextProvider>
    <Router>
            <div className="App">
            <Navbar />
              <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                  <Route path="/campaigns/:id" element={<ProjectDetailsPage />} />
                  <Route path="/donate/:id" element={<DonateProjectPage />} />
                  <Route path="/whitepaper" element={<WhitepaperPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/create-campaign" element={<CreateCampaignPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          </Router>
        </ProviderContextProvider>
        </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 