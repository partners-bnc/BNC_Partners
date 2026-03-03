import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPartnerData, getSessionUser, isPartnerProfileComplete, updatePartnerContactDetails } from '../lib/supabaseData';

const COUNTRY_OPTIONS = [
  { value: 'India', code: '+91', label: 'India (+91)' },
  { value: 'Saudi Arabia', code: '+966', label: 'Saudi Arabia (+966)' },
  { value: 'United States/Canada', code: '+1', label: 'United States/Canada (+1)' },
  { value: 'United Kingdom', code: '+44', label: 'United Kingdom (+44)' },
  { value: 'United Arab Emirates', code: '+971', label: 'United Arab Emirates (+971)' }
];

const getCountryOption = (countryValue) =>
  COUNTRY_OPTIONS.find((opt) => opt.value === countryValue) || COUNTRY_OPTIONS[0];

const stripCountryCodeFromPhone = (phoneValue, countryCode) => {
  const normalizedPhone = String(phoneValue || '').trim();
  const normalizedCode = String(countryCode || '').trim();
  if (!normalizedPhone || !normalizedCode) return normalizedPhone.replace(/[^\d]/g, '');

  if (normalizedPhone.startsWith(normalizedCode)) {
    return normalizedPhone.slice(normalizedCode.length).replace(/[^\d]/g, '');
  }

  return normalizedPhone.replace(/[^\d]/g, '');
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phoneLocal: '',
    countryCode: '+91',
    country: '',
    city: ''
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
          navigate('/login');
          return;
        }

        const profile = await fetchPartnerData(sessionUser.email, sessionUser.id);
        if (!profile) {
          setError('Partner profile not found. Please contact support.');
          return;
        }

        if (isPartnerProfileComplete(profile)) {
          localStorage.setItem('partnerUser', JSON.stringify(profile));
          navigate('/dashboard');
          return;
        }

        if (!active) return;
        setPartner(profile);
        const selectedCountry = getCountryOption(profile.country);
        const selectedCode = String(profile.countryCode || selectedCountry.code || '').trim();
        setFormData({
          phoneLocal: stripCountryCodeFromPhone(profile.phone || '', selectedCode),
          countryCode: selectedCode || '+91',
          country: selectedCountry.value,
          city: profile.city || ''
        });
      } catch (caughtError) {
        if (!active) return;
        setError(caughtError?.message || 'Failed to load profile.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'country') {
      const selectedCountry = getCountryOption(value);
      setFormData((prev) => ({
        ...prev,
        country: selectedCountry.value,
        countryCode: selectedCountry.code
      }));
      if (error) setError('');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!partner?.id) return;

    const payload = {
      partnerId: partner.id,
      phone: `${formData.countryCode}${String(formData.phoneLocal || '').replace(/[^\d]/g, '')}`,
      countryCode: formData.countryCode,
      country: formData.country,
      city: formData.city
    };

    const localDigits = String(formData.phoneLocal || '').replace(/[^\d]/g, '');
    if (!localDigits || localDigits.length < 6 || localDigits.length > 15) {
      setError('Phone number must be 6 to 15 digits.');
      return;
    }

    if (!String(payload.country || '').trim() || !String(payload.city || '').trim()) {
      setError('Phone, country and city are required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updated = await updatePartnerContactDetails(payload);
      if (!updated) {
        throw new Error('Failed to refresh profile after update.');
      }
      localStorage.setItem('partnerUser', JSON.stringify(updated));
      navigate('/dashboard');
    } catch (caughtError) {
      setError(caughtError?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-slate-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Complete your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please provide your phone number, country and city before continuing.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
            <div className="mt-1 flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-[#2C5AA0]/20 focus-within:border-[#2C5AA0]">
              <span className="inline-flex items-center px-3 text-sm text-slate-700 border-r border-slate-300 bg-slate-50 rounded-l-lg">
                {formData.countryCode}
              </span>
              <input
                id="phone"
                name="phoneLocal"
                type="text"
                value={formData.phoneLocal}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-r-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-slate-700">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2C5AA0] focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20"
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2C5AA0] focus:outline-none focus:ring-2 focus:ring-[#2C5AA0]/20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#2C5AA0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3f73] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
