import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, BadgeCheck, Scale, FileCheck2, Network, Briefcase, ShieldCheck, Presentation, ChartNoAxesCombined } from 'lucide-react';
import { RevealGroup, RevealItem, SectionHeading } from '../components/ui/premium';

// Nine reasons: a professional line icon, a title and one short line each.
// Hover: the card lifts, the icon tile turns red and a soft red glow rises from the bottom.
const CARDS = [
  { icon: Globe, title: 'Go Global', text: 'Reach clients in markets you would never enter alone.' },
  { icon: BadgeCheck, title: 'Expertise Without Borders', text: 'Your Expertise Passport shows your work to clients worldwide.' },
  { icon: Scale, title: 'Fair Representation', text: 'Merit leads, and rising partners get a place on every shortlist.' },
  { icon: FileCheck2, title: 'Complete Transparency', text: 'Every lead, decision and fee is recorded openly.' },
  { icon: Network, title: 'Multi-Dimensional Services', text: 'Audit, tax, legal, ESG and tech experts working as one team.' },
  { icon: Briefcase, title: 'International Clients', text: 'Clients from many markets come looking for advisers like you.' },
  { icon: ShieldCheck, title: 'Complete Client Solutions', text: 'You lead, the league fills the gaps, and the client stays yours.' },
  { icon: Presentation, title: 'Become a Trainer', text: 'Train new members and client teams, and earn as you teach.' },
  { icon: ChartNoAxesCombined, title: 'Multiply Your Fees', text: 'Referrals, delivery, leads and training all add to your earnings.' },
];

const WhyPartner = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section id="services" className="lg-section lg-band-parchment relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="lg-container">
        <SectionHeading
          eyebrow="The BNC LEG advantage"
          title="Why Partner With"
          muted="BNC LEG"
        />

        <RevealGroup className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ icon: Icon, title, text }) => (
            <RevealItem key={title} className="group lg-card is-hover relative flex min-h-[168px] items-start gap-5 overflow-hidden p-7 sm:p-8">
              {/* soft red glow rising from the bottom on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_100%,rgba(220,38,38,0.16)_0%,rgba(220,38,38,0.05)_45%,transparent_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="relative grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[#1d1d1f]/[0.06] text-[#1d1d1f] transition-colors duration-300 group-hover:bg-[#dc2626] group-hover:text-white">
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </span>
              <div className="relative min-w-0 flex-1">
                <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.015em] text-[#1d1d1f]">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#6e6e73]">{text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
};

export default WhyPartner;
