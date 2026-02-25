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
  const dropdownPosition = isRtl ? 'right-0' : 'left-0';
  const borderSide = isRtl ? 'border-l' : 'border-r';
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
    phone: '',
    countryCode: '+1',
    country: 'United States/Canada',
    city: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [countryCodeQuery, setCountryCodeQuery] = useState('+1 United States/Canada');
  const [showCountryCodeList, setShowCountryCodeList] = useState(false);

  const countryCodeToCountryLabel = {
    'United States/Canada': 'United States/Canada',
    'United States': 'United States',
    Canada: 'Canada',
    'United Kingdom': 'United Kingdom',
    India: 'India',
    Australia: 'Australia',
    Germany: 'Germany',
    France: 'France',
    Japan: 'Japan',
    China: 'China',
    Singapore: 'Singapore',
    'Saudi Arabia': 'Saudi Arabia',
    UAE: 'UAE',
    'United Arab Emirates': 'United Arab Emirates',
    Philippines: 'Philippines'
  };

  
  const countryCodes = [
    { code: "+91", label: "India" },
    { code: "+966", label: "Saudi Arabia" },
    { code: "+971", label: "UAE" },
    { code: "+44", label: "United Kingdom" },
    { code: "+1", label: "Canada" },
    { code: "+1", label: "United States" },
    { code: "+63", label: "Philippines" },
    { code: "+61", label: "Australia" },
    { code: "+1", label: "United States/Canada" },

    { code: "+7", label: "Russia/Kazakhstan" },

    { code: "+20", label: "Egypt" },
    { code: "+27", label: "South Africa" },
    { code: "+30", label: "Greece" },
    { code: "+31", label: "Netherlands" },
    { code: "+32", label: "Belgium" },
    { code: "+33", label: "France" },
    { code: "+34", label: "Spain" },
    { code: "+36", label: "Hungary" },
    { code: "+39", label: "Italy" },
    { code: "+40", label: "Romania" },
    { code: "+41", label: "Switzerland" },
    { code: "+43", label: "Austria" },
    { code: "+44", label: "United Kingdom" },
    { code: "+45", label: "Denmark" },
    { code: "+46", label: "Sweden" },
    { code: "+47", label: "Norway" },
    { code: "+48", label: "Poland" },
    { code: "+49", label: "Germany" },

    { code: "+51", label: "Peru" },
    { code: "+52", label: "Mexico" },
    { code: "+53", label: "Cuba" },
    { code: "+54", label: "Argentina" },
    { code: "+55", label: "Brazil" },
    { code: "+56", label: "Chile" },
    { code: "+57", label: "Colombia" },
    { code: "+58", label: "Venezuela" },

    { code: "+60", label: "Malaysia" },
    { code: "+61", label: "Australia" },
    { code: "+62", label: "Indonesia" },
    { code: "+63", label: "Philippines" },
    { code: "+64", label: "New Zealand" },
    { code: "+65", label: "Singapore" },
    { code: "+66", label: "Thailand" },

    { code: "+81", label: "Japan" },
    { code: "+82", label: "South Korea" },
    { code: "+84", label: "Vietnam" },
    { code: "+86", label: "China" },
    { code: "+90", label: "Turkey" },

    { code: "+91", label: "India" },
    { code: "+92", label: "Pakistan" },
    { code: "+93", label: "Afghanistan" },
    { code: "+94", label: "Sri Lanka" },
    { code: "+95", label: "Myanmar" },
    { code: "+98", label: "Iran" },

    { code: "+211", label: "South Sudan" },
    { code: "+212", label: "Morocco" },
    { code: "+213", label: "Algeria" },
    { code: "+216", label: "Tunisia" },
    { code: "+218", label: "Libya" },
    { code: "+220", label: "Gambia" },
    { code: "+221", label: "Senegal" },
    { code: "+222", label: "Mauritania" },
    { code: "+223", label: "Mali" },
    { code: "+224", label: "Guinea" },
    { code: "+225", label: "Ivory Coast" },
    { code: "+226", label: "Burkina Faso" },
    { code: "+227", label: "Niger" },
    { code: "+228", label: "Togo" },
    { code: "+229", label: "Benin" },
    { code: "+230", label: "Mauritius" },
    { code: "+231", label: "Liberia" },
    { code: "+232", label: "Sierra Leone" },
    { code: "+233", label: "Ghana" },
    { code: "+234", label: "Nigeria" },
    { code: "+235", label: "Chad" },
    { code: "+236", label: "Central African Republic" },
    { code: "+237", label: "Cameroon" },
    { code: "+238", label: "Cape Verde" },
    { code: "+239", label: "Sao Tome and Principe" },
    { code: "+240", label: "Equatorial Guinea" },
    { code: "+241", label: "Gabon" },
    { code: "+242", label: "Republic of the Congo" },
    { code: "+243", label: "DR Congo" },
    { code: "+244", label: "Angola" },
    { code: "+245", label: "Guinea-Bissau" },
    { code: "+248", label: "Seychelles" },
    { code: "+249", label: "Sudan" },
    { code: "+250", label: "Rwanda" },
    { code: "+251", label: "Ethiopia" },
    { code: "+252", label: "Somalia" },
    { code: "+253", label: "Djibouti" },
    { code: "+254", label: "Kenya" },
    { code: "+255", label: "Tanzania" },
    { code: "+256", label: "Uganda" },
    { code: "+257", label: "Burundi" },
    { code: "+258", label: "Mozambique" },
    { code: "+260", label: "Zambia" },
    { code: "+261", label: "Madagascar" },
    { code: "+263", label: "Zimbabwe" },
    { code: "+264", label: "Namibia" },
    { code: "+265", label: "Malawi" },
    { code: "+266", label: "Lesotho" },
    { code: "+267", label: "Botswana" },
    { code: "+268", label: "Eswatini" },
    { code: "+269", label: "Comoros" },

    { code: "+350", label: "Gibraltar" },
    { code: "+351", label: "Portugal" },
    { code: "+352", label: "Luxembourg" },
    { code: "+353", label: "Ireland" },
    { code: "+354", label: "Iceland" },
    { code: "+355", label: "Albania" },
    { code: "+356", label: "Malta" },
    { code: "+357", label: "Cyprus" },
    { code: "+358", label: "Finland" },
    { code: "+359", label: "Bulgaria" },

    { code: "+370", label: "Lithuania" },
    { code: "+371", label: "Latvia" },
    { code: "+372", label: "Estonia" },
    { code: "+373", label: "Moldova" },
    { code: "+374", label: "Armenia" },
    { code: "+375", label: "Belarus" },
    { code: "+376", label: "Andorra" },
    { code: "+377", label: "Monaco" },
    { code: "+378", label: "San Marino" },
    { code: "+379", label: "Vatican City" },
    { code: "+380", label: "Ukraine" },
    { code: "+381", label: "Serbia" },
    { code: "+382", label: "Montenegro" },
    { code: "+383", label: "Kosovo" },
    { code: "+385", label: "Croatia" },
    { code: "+386", label: "Slovenia" },
    { code: "+387", label: "Bosnia and Herzegovina" },
    { code: "+389", label: "North Macedonia" },

    { code: "+420", label: "Czech Republic" },
    { code: "+421", label: "Slovakia" },
    { code: "+423", label: "Liechtenstein" },

    { code: "+500", label: "Falkland Islands" },
    { code: "+501", label: "Belize" },
    { code: "+502", label: "Guatemala" },
    { code: "+503", label: "El Salvador" },
    { code: "+504", label: "Honduras" },
    { code: "+505", label: "Nicaragua" },
    { code: "+506", label: "Costa Rica" },
    { code: "+507", label: "Panama" },
    { code: "+509", label: "Haiti" },

    { code: "+591", label: "Bolivia" },
    { code: "+592", label: "Guyana" },
    { code: "+593", label: "Ecuador" },
    { code: "+595", label: "Paraguay" },
    { code: "+597", label: "Suriname" },
    { code: "+598", label: "Uruguay" },

    { code: "+670", label: "Timor-Leste" },
    { code: "+673", label: "Brunei" },
    { code: "+674", label: "Nauru" },
    { code: "+675", label: "Papua New Guinea" },
    { code: "+676", label: "Tonga" },
    { code: "+677", label: "Solomon Islands" },
    { code: "+678", label: "Vanuatu" },
    { code: "+679", label: "Fiji" },
    { code: "+680", label: "Palau" },
    { code: "+681", label: "Wallis and Futuna" },
    { code: "+682", label: "Cook Islands" },
    { code: "+683", label: "Niue" },
    { code: "+685", label: "Samoa" },
    { code: "+686", label: "Kiribati" },
    { code: "+687", label: "New Caledonia" },
    { code: "+688", label: "Tuvalu" },
    { code: "+689", label: "French Polynesia" },

    { code: "+850", label: "North Korea" },
    { code: "+852", label: "Hong Kong" },
    { code: "+853", label: "Macau" },
    { code: "+855", label: "Cambodia" },
    { code: "+856", label: "Laos" },
    { code: "+880", label: "Bangladesh" },
    { code: "+886", label: "Taiwan" },

    { code: "+960", label: "Maldives" },
    { code: "+961", label: "Lebanon" },
    { code: "+962", label: "Jordan" },
    { code: "+963", label: "Syria" },
    { code: "+964", label: "Iraq" },
    { code: "+965", label: "Kuwait" },
    { code: "+966", label: "Saudi Arabia" },
    { code: "+967", label: "Yemen" },
    { code: "+968", label: "Oman" },
    { code: "+970", label: "Palestine" },
    { code: "+971", label: "United Arab Emirates" },
    { code: "+972", label: "Israel" },
    { code: "+973", label: "Bahrain" },
    { code: "+974", label: "Qatar" },
    { code: "+975", label: "Bhutan" },
    { code: "+976", label: "Mongolia" },
    { code: "+977", label: "Nepal" },
    { code: "+992", label: "Tajikistan" },
    { code: "+993", label: "Turkmenistan" },
    { code: "+994", label: "Azerbaijan" },
    { code: "+995", label: "Georgia" },
    { code: "+996", label: "Kyrgyzstan" },
    { code: "+998", label: "Uzbekistan" }
  ];

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
        if (!formData.countryCode) {
          newErrors.countryCode = 'Country code is required';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{6,15}$/.test(formData.phone.replace(/\D/g, ''))) {
          newErrors.phone = 'Phone number must be 6 to 15 digits';
        }
        break;
      case 3:
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.city) newErrors.city = 'City is required';
        break;
      case 4:
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
      [name]: value,
      ...(name === 'country' && { city: '' })
    }));

    if (name === 'email' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setTimeout(() => checkEmailExists(value), 500);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectCountryCode = (code, label) => {
    const resolvedCountry = countryCodeToCountryLabel[label] || label;
    setFormData((prev) => ({
      ...prev,
      countryCode: code,
      country: resolvedCountry,
      city: ''
    }));
    setCountryCodeQuery(`${code} ${label}`);
    setShowCountryCodeList(false);
    if (errors.countryCode) {
      setErrors((prev) => ({ ...prev, countryCode: '' }));
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
    if (!validateStep(4)) return;
    if (emailExists) return;

    setIsSubmitting(true);
    try {
      await registerPartner({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        countryCode: formData.countryCode,
        country: formData.country,
        city: formData.city,
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
      phone: '',
      countryCode: '+1',
      country: 'United States/Canada',
      city: '',
      password: ''
    });
    setCountryCodeQuery('+1 United States/Canada');
    setShowCountryCodeList(false);
    setCurrentStep(1);
    setErrors({});
    setIsSubmitted(false);
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
          <div className="fixed inset-0 bg-black/50"></div>

          <div className={`relative inline-block w-full max-w-md p-0 my-8 overflow-hidden ${textAlign} align-middle bg-white shadow-xl rounded-2xl z-10`}>
            <button
              onClick={handleLoginRedirect}
              className={`absolute top-4 ${closePosition} text-gray-400 hover:text-gray-600 transition-colors z-10`}
            >
              <FaTimes size={18} />
            </button>
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h3>
              <p className="text-gray-600 mb-4">Thank you for registering with us. Our team will contact you shortly.</p>
              <p className="text-sm text-gray-500 mb-6">
                Your registered email: <span className="font-medium text-gray-700">{formData.email}</span>
              </p>
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-[#254C89] hover:bg-[#1e3f73] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Login
              </button>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className={`relative flex w-full items-stretch border rounded-lg overflow-visible focus-within:ring-2 focus-within:ring-[#254C89] focus-within:border-transparent ${
                errors.phone || errors.countryCode ? 'border-red-500' : 'border-gray-300'
              }`}>
                <div className={`relative w-[190px] ${borderSide} border-gray-200 bg-gray-50`}>
                  <input
                    type="text"
                    name="countryCodeQuery"
                    value={countryCodeQuery}
                    readOnly
                    onClick={() => setShowCountryCodeList((prev) => !prev)}
                    onFocus={() => setShowCountryCodeList(true)}
                    className={`w-full px-3 py-3 text-sm text-gray-700 focus:outline-none bg-transparent cursor-pointer ${inputAlign}`}
                    placeholder="+1 United States/Canada"
                  />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-3 focus:outline-none ${inputAlign}`}
                  placeholder="Enter phone number"
                  maxLength="15"
                />
                {showCountryCodeList && (
                  <div className={`absolute ${dropdownPosition} bottom-full z-50 mb-2 w-[260px] max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl`}>
                    {countryCodes.map((code) => (
                      <button
                        key={`${code.code}-${code.label}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCountryCode(code.code, code.label)}
                        className={`w-full ${textAlign} px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100`}
                      >
                        {code.code} {code.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.countryCode && <p className="text-red-500 text-sm mt-1">{errors.countryCode}</p>}
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-gray-500 text-sm mt-1">Phone number should be 6 to 15 digits</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                readOnly
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#254C89] focus:border-transparent ${inputAlign} ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                } bg-gray-100`}
                placeholder="Auto-filled from country code"
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#254C89] focus:border-transparent ${inputAlign} ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your city"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
          </div>
        );

      case 4:
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
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

        <div className={`relative inline-block w-full max-w-xl p-0 my-8 overflow-visible ${textAlign} align-middle bg-white shadow-xl rounded-2xl z-10`}>
          <div className="bg-gradient-to-r from-[#254C89] to-[#1e3f73] px-6 py-4 text-white relative">
            <button
              onClick={onClose}
              className={`absolute top-4 ${closePosition} text-white hover:text-gray-200 transition-colors`}
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-xl font-bold mb-1">Partner Application</h2>
            <p className="text-blue-100 text-sm">Join our growing network of partners</p>
            <div className={`mt-3 flex items-center justify-between ${rowDirection}`}>
              <span className="text-sm">Step {currentStep} of 4</span>
              <span className="text-sm">{Math.round((currentStep / 4) * 100)}% complete</span>
            </div>
            <div className="w-full bg-[#1a3d6b] rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-8">
            {renderStep()}

            <div className={`flex justify-between mt-6 ${rowDirection}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FaArrowLeft className={isRtl ? 'ml-2 flipInRtl' : 'mr-2'} size={14} />
                  Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 2 && emailExists}
                  className={`flex items-center ${autoMargin} px-6 py-2 rounded-lg font-semibold transition-colors ${
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
                  className={`${autoMargin} bg-[#2C5AA0] hover:bg-[#1e3f73] text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerFormModal;




