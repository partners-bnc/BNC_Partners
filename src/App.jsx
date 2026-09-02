import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './Component/Header';
import Footer from './Component/Footer';
import Home from './pages/Home';
import { supabase } from './lib/supabaseClient';
const FakeActivityPopup = lazy(() => import('./Component/FakeActivityPopup'));

const InternationalPartners = lazy(() => import('./pages/partners/InternationalPartners'));
const SalesPartners = lazy(() => import('./pages/partners/SalesPartners'));
const TechnologyPartners = lazy(() => import('./pages/partners/TechnologyPartners'));
const ServicePartners = lazy(() => import('./pages/partners/ServicePartners'));
const Login = lazy(() => import('./auth/Login'));
const ResetPassword = lazy(() => import('./auth/ResetPassword'));
const PartnerDashboard = lazy(() => import('./pages/UserDashboard/UserDashboard'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const ReferralProgram = lazy(() => import('./pages/ReferralProgram'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const IndiaServices = lazy(() => import('./pages/services/india/IndiaServices'));
const SaudiArabiaServices = lazy(() => import('./pages/services/saudi-arabia/SaudiArabiaServices'));
const GlobalServices = lazy(() => import('./pages/services/global/GlobalServices'));
const DiscoverServices = lazy(() => import('./pages/services/DiscoverServices'));
const ServiceDetail = lazy(() => import('./pages/services/ServiceDetail'));
const StartChatting = lazy(() => import('./pages/StartChatting'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RoleSelectionModal = lazy(() => import('./Component/RoleSelectionModal'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const AuthRecoveryRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash || '';
      const search = location.search || '';
      const fullUrl = hash + search;

      if (
        fullUrl.includes('type=recovery') ||
        fullUrl.includes('otp_expired') ||
        fullUrl.includes('access_denied') ||
        (hash.includes('access_token') && (hash.includes('type=recovery') || search.includes('type=recovery')))
      ) {
        if (location.pathname !== '/reset-password') {
          navigate('/reset-password' + hash + search, { replace: true });
        }
      }
    };

    checkHash();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (
        event === 'PASSWORD_RECOVERY' ||
        (event === 'SIGNED_IN' && (hash.includes('type=recovery') || search.includes('type=recovery')))
      ) {
        if (location.pathname !== '/reset-password') {
          navigate('/reset-password', { replace: true });
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location]);

  return null;
};

function App() {
  const routeFallback = <div className="min-h-[40vh] bg-white" aria-hidden="true" />;

  return (
    <Router>
      <ScrollToTop />
      <AuthRecoveryRedirect />
      <Suspense fallback={null}>
        <RoleSelectionModal />
      </Suspense>
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={routeFallback}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/dashboard" element={<PartnerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/services" element={<DiscoverServices />} />
            <Route path="/services/global" element={<GlobalServices />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
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
        <Suspense fallback={null}>
          <FakeActivityPopup />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
