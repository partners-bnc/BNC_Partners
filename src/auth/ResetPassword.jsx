import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { updateUserPassword } from '../lib/supabaseData';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const passPadding = isRtl ? 'pl-12' : 'pr-12';
  const eyePosition = isRtl ? 'left-3' : 'right-3';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    const parseUrlHashAndCheckSession = async () => {
      setIsCheckingSession(true);
      setErrorMsg('');

      const hash = window.location.hash || '';
      const search = location.search || '';
      const fullUrl = hash + search;

      // Check for URL hash error codes from Supabase
      if (fullUrl.includes('otp_expired') || fullUrl.includes('Email+link+is+invalid+or+has+expired')) {
        if (isMounted) {
          setErrorMsg('This password reset link has expired or is invalid. Please request a new link from the login page.');
          setIsCheckingSession(false);
        }
        return;
      }

      if (fullUrl.includes('access_denied')) {
        if (isMounted) {
          setErrorMsg('Access denied. Please request a new password reset link.');
          setIsCheckingSession(false);
        }
        return;
      }

      // Check active auth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          if (isMounted) {
            setHasValidSession(true);
            setUserEmail(session.user.email || '');
          }
        } else {
          // Check if access_token is present in hash
          if (hash.includes('access_token')) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken) {
              const { data: setSessionData, error: setSessionErr } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });

              if (!setSessionErr && setSessionData?.session) {
                if (isMounted) {
                  setHasValidSession(true);
                  setUserEmail(setSessionData.session.user?.email || '');
                }
              } else if (isMounted) {
                setHasValidSession(true); // Allow form attempt
              }
            } else if (isMounted) {
              setHasValidSession(true);
            }
          } else if (isMounted) {
            setHasValidSession(true); // Allow form attempt
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
        if (isMounted) setHasValidSession(true);
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };

    parseUrlHashAndCheckSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setHasValidSession(true);
        setUserEmail(session.user.email || '');
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password) {
      setErrorMsg(t('login.errors.passwordRequired') || 'Password is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('login.passwordMismatch') || 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await updateUserPassword(password, userEmail);
      setSuccessMsg(t('login.passwordUpdatedSuccess') || 'Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      console.error('Password reset error:', err);
      setErrorMsg(err?.message || 'Failed to update password. Please try requesting a new reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8">
        
        {/* Header */}
        <div className={`text-center mb-6`}>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DC2626]/10 text-[#DC2626] mb-3">
            <FaLock size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {t('login.resetPasswordTitle') || 'Reset Your Password'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your new password below to secure your account.
          </p>
        </div>

        {/* Loading Spinner */}
        {isCheckingSession && (
          <div className="py-8 text-center text-slate-500 text-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#DC2626] border-t-transparent mb-3" />
            <p>Verifying authentication session...</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start gap-3 text-sm">
            <FaCheckCircle className="text-emerald-500 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success!</p>
              <p className="mt-1">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Reset Failed</p>
              <p className="mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Reset Form */}
        {!isCheckingSession && !successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5 ${rowDirection}`}>
                <FaLock className="text-[#DC2626]" />
                {t('login.newPassword') || 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full px-4 py-2.5 ${passPadding} border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#DC2626]/30 focus:border-transparent text-sm ${inputAlign}`}
                  placeholder={t('login.enterNewPassword') || 'Enter new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${eyePosition} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5 ${rowDirection}`}>
                <FaLock className="text-[#DC2626]" />
                {t('login.confirmPassword') || 'Confirm New Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full px-4 py-2.5 ${passPadding} border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#DC2626]/30 focus:border-transparent text-sm ${inputAlign}`}
                  placeholder={t('login.confirmNewPassword') || 'Confirm new password'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute ${eyePosition} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600`}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#163062] text-white py-3 px-4 rounded-xl font-semibold transition-all text-sm disabled:opacity-50 shadow-lg shadow-red-500/20"
            >
              {isLoading
                ? (t('login.updatingPassword') || 'Updating...')
                : (t('login.updatePassword') || 'Update Password')}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center pt-4 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center text-sm font-medium text-[#DC2626] hover:text-[#B91C1C] transition-colors"
          >
            <FaArrowLeft className={isRtl ? 'ml-2 flipInRtl' : 'mr-2'} />
            {t('login.backToLogin') || 'Back to Login'}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
