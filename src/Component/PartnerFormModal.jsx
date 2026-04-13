import React, { useState } from 'react';
import { FaTimes, FaArrowRight, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { checkPartnerEmailExists, registerPartner } from '../lib/supabaseData';

const PartnerFormModal = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const passPadding = isRtl ? 'pl-12' : 'pr-12';
  const eyePosition = isRtl ? 'left-3' : 'right-3';
  const closePosition = isRtl ? 'left-4' : 'right-4';
  const autoMargin = isRtl ? 'mr-auto' : 'ml-auto';
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const checkEmailExists = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setIsCheckingEmail(true);
    try {
      const exists = await checkPartnerEmailExists(email);
      if (exists) {
        setErrors((prev) => ({ ...prev, email: 'You have already registered with this email address.' }));
        setEmailExists(true);
      } else {
        setErrors((prev) => ({ ...prev, email: '' }));
        setEmailExists(false);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        break;
      case 2:
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 3:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
          newErrors.password = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setTimeout(() => checkEmailExists(value), 500);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && emailExists) {
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    if (emailExists) return;

    setIsSubmitting(true);
    try {
      await registerPartner({
        fullName: formData.fullName,
        email: formData.email,
        phone: '',
        countryCode: '',
        country: '',
        city: '',
        password: formData.password
      });

      setIsSubmitted(true);
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error?.message === 'EMAIL_ALREADY_EXISTS') {
        setErrors((prev) => ({ ...prev, email: 'You have already registered with this email address.' }));
        setCurrentStep(2);
        setEmailExists(true);
      } else if (error?.message === 'EMAIL_RATE_LIMIT') {
        alert('Signup is temporarily rate-limited. Please wait a few minutes and try again.');
      } else {
        alert(error?.message || 'Error submitting form. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    onClose();
    setFormData({
      fullName: '',
      email: '',
      password: ''
    });
    setCurrentStep(1);
    setErrors({});
    setIsSubmitted(false);
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex min-h-screen items-start justify-center px-3 pt-3 pb-6 text-center sm:items-center sm:px-4 sm:pt-4 sm:pb-20">
          <div className="fixed inset-0 bg-black/50"></div>

          <div className={`relative inline-block w-full max-w-2xl my-3 overflow-visible ${textAlign} align-middle z-10 sm:my-8`}>
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              onClick={handleLoginRedirect}
              className={`absolute top-4 ${closePosition} text-gray-400 hover:text-gray-600 transition-colors z-10`}
            >
              <FaTimes size={18} />
            </button>
            <div className="overflow-visible p-5 text-center sm:p-8">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-gray-600 mb-4">Please Check your email for confirmation.</p>
              <p className="text-sm text-gray-500 mb-4">
                Your registered email: <span className="font-medium text-gray-700">{formData.email}</span>
              </p>
              <div className="aspect-w-16 aspect-h-9 w-full mb-6 relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/X20EaJAyKv0?autoplay=1"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#254C89] focus:border-transparent ${inputAlign} ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#254C89] focus:border-transparent ${inputAlign} ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {isCheckingEmail && <p className="text-blue-500 text-sm mt-1">Checking email availability...</p>}
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Password</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 ${passPadding} border rounded-lg focus:ring-2 focus:ring-[#254C89] focus:border-transparent ${inputAlign} ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${eyePosition} top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700`}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Password must contain at least 8 characters including uppercase, lowercase, number and special character
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-3 pt-3 pb-6 text-center sm:items-center sm:px-4 sm:pt-4 sm:pb-20">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

        <div className={`relative inline-block w-full max-w-xl my-3 overflow-visible ${textAlign} align-middle z-10 sm:my-8`}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="relative bg-gradient-to-r from-[#254C89] to-[#1e3f73] px-4 py-4 text-white sm:px-6">
            <button
              onClick={onClose}
              className={`absolute top-4 ${closePosition} text-white hover:text-gray-200 transition-colors`}
            >
              <FaTimes size={18} />
            </button>
            <h2 className="mb-1 pr-8 text-lg font-bold sm:text-xl">Partner Application</h2>
            <p className="text-blue-100 text-sm">Join our growing network of partners</p>
            <div className={`mt-3 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm ${rowDirection}`}>
              <span className="text-sm">Step {currentStep} of 3</span>
              <span className="text-sm">{Math.round((currentStep / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-[#1a3d6b] rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="overflow-visible p-4 sm:p-8">
            {renderStep()}

            <div className={`mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between ${rowDirection}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex w-full items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors sm:w-auto"
                >
                  <FaArrowLeft className={isRtl ? 'ml-2 flipInRtl' : 'mr-2'} size={14} />
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 2 && emailExists}
                  className={`flex w-full items-center justify-center px-6 py-2 rounded-lg font-semibold transition-colors sm:w-auto ${autoMargin} ${
                    currentStep === 2 && emailExists
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-[#254C89] hover:bg-[#1e3f73] text-white'
                  }`}
                >
                  Next
                  <FaArrowRight className={isRtl ? 'mr-2 flipInRtl' : 'ml-2'} size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full bg-[#2C5AA0] hover:bg-[#1e3f73] text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 sm:w-auto ${autoMargin}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerFormModal;




