import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (location.pathname === '/start-chatting') {
    return null;
  }

  return (
    <footer className="border-t border-slate-100 bg-white pt-16 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12">
          
          {/* Column 1: Brand Profile */}
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-block mb-1">
              <img
                src="/Photas/aaf68a14-dda6-4743-824f-5bc2592df449.png"
                alt="BNC LEG Partners"
                className="h-14 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="font-geist text-sm leading-relaxed text-slate-500">
              Partner onboarding and collaboration portal. This portal helps prospective and active partners register, sign in, complete onboarding, manage their partner profile, and submit partnership or service requirements.
            </p>
            {/* Social Icons Placeholder (Circular Dots) */}
            <div className="flex gap-2.5 mt-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"></span>
              <span className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"></span>
              <span className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"></span>
              <span className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"></span>
            </div>
          </div>

          {/* Column 2: Links Section */}
          <div className="flex flex-col gap-8 md:pl-4">
            {/* Quick Links */}
            <div>
              <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-3 font-geist text-sm font-medium text-slate-500">
                <li>
                  <a href="#about" className="hover:text-[#DC2626] transition-colors">COMPANY HISTORY</a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#DC2626] transition-colors">GUIDE</a>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#DC2626] transition-colors">PARTNER NETWORK</a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#DC2626] transition-colors">PORTAL FAQ</a>
                </li>
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                Our Services
              </h4>
              <ul className="flex flex-col gap-3 font-geist text-sm font-medium text-slate-500">
                <li>
                  <Link to="/services/india" className="hover:text-[#DC2626] transition-colors">INDIA</Link>
                </li>
                <li>
                  <Link to="/services/saudi-arabia" className="hover:text-[#DC2626] transition-colors">SAUDI ARABIA</Link>
                </li>
                <li>
                  <a href="#services" className="hover:text-[#DC2626] transition-colors">GLOBAL</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Visit Us */}
          <div className="flex flex-col gap-6">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900">
              Visit Us
            </h4>
            
            {/* Gurgaon Office */}
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 font-geist text-sm text-slate-500">
                <span className="font-semibold text-slate-800">Gurgaon Office</span>
                <span className="leading-relaxed">
                  Plot no C-15 & C-16 Ground floor<br />
                  Udyog Vihar Phase 5, Gurgaon, India
                </span>
              </div>
            </div>

            {/* Riyadh Office */}
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 font-geist text-sm text-slate-500">
                <span className="font-semibold text-slate-800">Riyadh Office</span>
                <span className="leading-relaxed">
                  8163 Abi Barzah Al Aslami, 4362 Al Dhubbat Dist.<br />
                  Riyadh, 12623, Saudi Arabia
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="flex flex-col gap-6">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact Us
            </h4>
            
            <div className="flex flex-col gap-4 font-geist text-sm text-slate-500">
              
              {/* Phone */}
              <div className="flex gap-3 items-center">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <a href="tel:+919810575613" className="hover:text-[#DC2626] transition-colors">
                  +91 98105 75613
                </a>
              </div>

              {/* Consulting Inquiries */}
              <div className="flex gap-3 items-start">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Consulting Inquiries</span>
                  <a href="mailto:summit@bncglobal.in" className="hover:text-[#DC2626] transition-colors break-all">
                    summit@bncglobal.in
                  </a>
                </div>
              </div>

              {/* General Inquiries */}
              <div className="flex gap-3 items-start">
                <Mail className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase font-semibold">General Inquiries</span>
                  <a href="mailto:info@bncglobal.in" className="hover:text-[#DC2626] transition-colors break-all">
                    info@bncglobal.in
                  </a>
                </div>
              </div>

              {/* Website */}
              <div className="flex gap-3 items-center">
                <Globe className="w-5 h-5 text-slate-400 shrink-0" />
                <a 
                  href="https://www.bncglobal.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#DC2626] transition-colors"
                >
                  www.bncglobal.in
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 font-geist">
          <p>
            Copyright © 2026 BNC LEG 'A League Of Extraordinary Gentlemen'. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-medium text-slate-500">
            <a href="#contact" className="hover:text-[#DC2626] transition-colors">Help Center</a>
            <Link to="/privacy-policy" className="hover:text-[#DC2626] transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[#DC2626] transition-colors">Terms of Service</Link>
            <a href="#" className="hover:text-[#DC2626] transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
