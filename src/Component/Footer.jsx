import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import bncLogo from '../assets/bnc.svg';

const Footer = () => {
  const location = useLocation();

  if (location.pathname === '/start-chatting') {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="flex items-center gap-4">
              <img
                src={bncLogo}
                alt="BnC Global Services"
                className="h-16 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="font-poppins text-lg font-semibold text-slate-900">BnC Global Partners</p>
                <p className="font-geist text-sm text-slate-500">Partner onboarding and collaboration portal</p>
              </div>
            </div>

            <p className="mt-6 max-w-2xl font-geist text-sm leading-6 text-slate-600">
              This portal helps prospective and active partners register, sign in, complete onboarding, manage their partner profile, and submit partnership or service requirements. Privacy Policy and Terms of Service are published on this domain to meet Google OAuth app verification requirements.
            </p>

            <p className="mt-4 font-geist text-sm leading-6 text-slate-600">
              Google Sign-In is used only for account authentication and partner profile access.
            </p>
          </div>

          <div className="lg:pl-8">
            <p className="font-poppins text-sm font-semibold uppercase tracking-[0.2em] text-[#2C5AA0]">
              Legal
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/privacy-policy"
                className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-geist text-sm text-slate-700 transition hover:border-[#2C5AA0]/40 hover:text-[#2C5AA0]"
              >
                <span>Privacy Policy</span>
                <span aria-hidden="true">Open</span>
              </Link>
              <Link
                to="/terms-of-service"
                className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-geist text-sm text-slate-700 transition hover:border-[#2C5AA0]/40 hover:text-[#2C5AA0]"
              >
                <span>Terms of Service</span>
                <span aria-hidden="true">Open</span>
              </Link>
              <a
                href="mailto:info@bncglobal.in"
                className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 font-geist text-sm text-slate-700 transition hover:border-[#2C5AA0]/40 hover:text-[#2C5AA0]"
              >
                <span>info@bncglobal.in</span>
                <span aria-hidden="true">Email</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-geist">
            Copyright © 2026 BnC Global. All rights reserved.
          </p>
          <a
            href="https://www.bncglobal.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-geist transition hover:text-[#2C5AA0]"
          >
            www.bncglobal.in
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
