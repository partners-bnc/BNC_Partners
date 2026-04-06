import React from 'react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using BnC Global Partners, you agree to these Terms of Service. If you do not agree, do not use the portal.'
    ]
  },
  {
    title: '2. Description of Service',
    body: [
      'BnC Global Partners is a partner onboarding, collaboration, and enquiry management portal operated by BnC Global. The portal allows prospective and active partners to register, sign in, complete profile details, submit onboarding information, and communicate service-related requirements.'
    ]
  },
  {
    title: '3. Accounts and Authentication',
    body: [
      'You are responsible for providing accurate account information and for maintaining the confidentiality of your login credentials.',
      'If you choose to sign in with Google, you authorize us and our authentication provider to use basic Google account information strictly for authentication, account linking, and security.'
    ]
  },
  {
    title: '4. Acceptable Use',
    body: [
      'You agree to use the portal only for lawful business purposes. You must not misuse the service, attempt unauthorized access, interfere with platform operations, submit false or misleading information, upload malicious content, or violate applicable laws or third-party rights.'
    ]
  },
  {
    title: '5. User Content and Submissions',
    body: [
      'You retain responsibility for the information, files, and requests you submit through the portal. By submitting content, you represent that you have the right to provide it and that it does not violate any law, contract, or third-party right.'
    ]
  },
  {
    title: '6. Availability and Changes',
    body: [
      'We may update, suspend, restrict, or discontinue parts of the portal at any time. We do not guarantee uninterrupted availability and may make changes to features, workflows, or requirements without prior notice.'
    ]
  },
  {
    title: '7. Intellectual Property',
    body: [
      'The portal, including its branding, design, content, software, and related materials, is owned by or licensed to BnC Global and is protected by applicable intellectual property laws. These Terms do not grant you ownership rights in the portal.'
    ]
  },
  {
    title: '8. Third-Party Services',
    body: [
      'The portal may rely on third-party platforms and infrastructure, including authentication, hosting, storage, and communication providers. Your use of connected third-party services may also be subject to their own terms and policies.'
    ]
  },
  {
    title: '9. Disclaimer and Limitation of Liability',
    body: [
      'The portal is provided on an "as is" and "as available" basis to the fullest extent permitted by law. BnC Global disclaims warranties of merchantability, fitness for a particular purpose, and non-infringement.',
      'To the fullest extent permitted by law, BnC Global will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, or business opportunities arising from your use of the portal.'
    ]
  },
  {
    title: '10. Termination',
    body: [
      'We may suspend or terminate access if we believe you violated these Terms, created risk for the service or other users, or if continued access is no longer operationally or legally appropriate.'
    ]
  },
  {
    title: '11. Contact',
    body: [
      'For questions about these Terms of Service, contact info@bncglobal.in.'
    ]
  }
];

const TermsOfService = () => {
  return (
    <section className="bg-[#F7F2ED] py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="font-poppins text-sm font-semibold uppercase tracking-[0.24em] text-[#2C5AA0]">
            Legal
          </p>
          <h1 className="mt-3 font-sora text-3xl font-semibold text-slate-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 font-geist text-sm text-slate-500">
            Effective Date: April 6, 2026
          </p>
          <p className="mt-6 font-geist text-base leading-7 text-slate-700">
            These terms describe the rules for using the BnC Global partner portal and are published on the same production domain for Google OAuth verification readiness.
          </p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-poppins text-xl font-semibold text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="font-geist text-base leading-7 text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsOfService;
