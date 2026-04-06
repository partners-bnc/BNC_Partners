import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './Component/Header';
import Footer from './Component/Footer';
import Home from './pages/Home';

const InternationalPartners = lazy(() => import('./pages/partners/InternationalPartners'));
const SalesPartners = lazy(() => import('./pages/partners/SalesPartners'));
const TechnologyPartners = lazy(() => import('./pages/partners/TechnologyPartners'));
const ServicePartners = lazy(() => import('./pages/partners/ServicePartners'));
const Login = lazy(() => import('./auth/Login'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const ReferralProgram = lazy(() => import('./pages/ReferralProgram'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const IndiaServices = lazy(() => import('./pages/services/india/IndiaServices'));
const SaudiArabiaServices = lazy(() => import('./pages/services/saudi-arabia/SaudiArabiaServices'));
const GlobalServices = lazy(() => import('./pages/services/global/GlobalServices'));
const ServiceDetail = lazy(() => import('./pages/services/ServiceDetail'));
const StartChatting = lazy(() => import('./pages/StartChatting'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

function App() {
  const routeFallback = <div className="min-h-[40vh] bg-white" aria-hidden="true" />;

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
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
                    <Route path="/partnerships/international" element={<InternationalPartners />} />
                    <Route path="/partnerships/sales" element={<SalesPartners />} />
                    <Route path="/partnerships/technology" element={<TechnologyPartners />} />
                    <Route path="/partnerships/service" element={<ServicePartners />} />
                    <Route path="/partner-form" element={<Home />} />
                    <Route path="/referral-program" element={<ReferralProgram />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
