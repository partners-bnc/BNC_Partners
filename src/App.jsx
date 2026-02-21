import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Component/Header';
import Footer from './Component/Footer';
import FloatingChatButton from './Component/FloatingChatButton';
import Home from './pages/Home';
import Partnerships from './pages/Partnerships';
import Login from './auth/Login';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import IndiaServices from './pages/services/india/IndiaServices';
import SaudiArabiaServices from './pages/services/saudi-arabia/SaudiArabiaServices';
import GlobalServices from './pages/services/global/GlobalServices';
import ServiceDetail from './pages/services/ServiceDetail';
import StartChatting from './pages/StartChatting';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PartnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/services/india" element={<IndiaServices />} />
          <Route path="/services/saudi-arabia" element={<SaudiArabiaServices />} />
          <Route path="/services/global" element={<GlobalServices />} />
          <Route path="/services/:country/:serviceId" element={<ServiceDetail />} />
          <Route path="/start-chatting" element={<StartChatting />} />
          <Route path="/*" element={
            <>
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/partnerships" element={<Partnerships />} />
                  <Route path="/partner-form" element={<Home />} />
                </Routes>
              </main>
              <Footer />
              <FloatingChatButton />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
