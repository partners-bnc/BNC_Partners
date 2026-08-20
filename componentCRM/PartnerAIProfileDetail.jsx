import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Tag,
  Layers,
  Award,
  BookOpen,
  AlertCircle,
  Loader2,
  Shield,
  Globe2,
  Star
} from 'lucide-react';
import { fetchPartnerAIProfile } from '../src/lib/supabaseData';

/* ─── Brand Tokens (matches BnC hero page) ─────────────────────────────────
   Black   : #0f0f0f
   White   : #ffffff
   Red     : #DC2626
   Blue    : #1d4ed8
   Muted   : #64748b (slate-500)
   Border  : #e2e8f0 (slate-200)
   Bg      : #f8fafc (slate-50)
──────────────────────────────────────────────────────────────────────────── */

const T = {
  black: '#0f0f0f',
  white: '#ffffff',
  red: '#DC2626',
  redSoft: 'rgba(220,38,38,0.08)',
  redMid: 'rgba(220,38,38,0.15)',
  blue: '#1d4ed8',
  blueSoft: 'rgba(29,78,216,0.08)',
  blueMid: 'rgba(29,78,216,0.14)',
  muted: '#64748b',
  mutedLight: '#94a3b8',
  border: '#e2e8f0',
  borderDark: '#cbd5e1',
  bg: '#f8fafc',
  surface: '#ffffff',
  divider: '#f1f5f9',
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const capitalize = (str) =>
  String(str || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* ─── Section Card ───────────────────────────────────────────────────────── */
function SectionCard({ icon: Icon, title, iconColor = T.blue, children }) {
  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: T.border, boxShadow: '0 1px 8px rgba(15,15,15,0.06)' }}
    >
      {/* Header stripe */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: T.divider, background: T.bg }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconColor === T.red ? T.redSoft : T.blueSoft }}
        >
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <h2
          className="text-[13px] font-bold tracking-wide uppercase"
          style={{ color: T.black, fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}
        >
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Tag Pill ───────────────────────────────────────────────────────────── */
function TagPill({ label, variant = 'blue' }) {
  const styles = {
    blue: { bg: T.blueSoft, color: T.blue, border: 'rgba(29,78,216,0.2)' },
    red: { bg: T.redSoft, color: T.red, border: 'rgba(220,38,38,0.2)' },
    dark: { bg: 'rgba(15,15,15,0.05)', color: T.black, border: 'rgba(15,15,15,0.12)' },
  };
  const s = styles[variant] || styles.blue;
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {label}
    </span>
  );
}

/* ─── Info Row ───────────────────────────────────────────────────────────── */
function InfoRow({ label, value, highlight = false }) {
  return (
    <div
      className="flex items-start gap-4 py-3 border-b last:border-0"
      style={{ borderColor: T.divider }}
    >
      <span
        className="text-[12px] font-medium min-w-[140px] flex-shrink-0 pt-0.5"
        style={{ color: T.muted, fontFamily: 'Geist, sans-serif' }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold break-all"
        style={{ color: highlight ? T.blue : T.black }}
      >
        {value || '—'}
      </span>
    </div>
  );
}

/* ─── Tag List ───────────────────────────────────────────────────────────── */
function TagList({ items, variant = 'blue' }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-[13px] italic" style={{ color: T.mutedLight }}>
        None listed
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <TagPill key={i} label={capitalize(item)} variant={variant} />
      ))}
    </div>
  );
}

/* ─── Experience Table ────────────────────────────────────────────────────── */
function ExperienceTable({ experienceDetails }) {
  const entries = Object.entries(experienceDetails || {});
  if (entries.length === 0) {
    return (
      <p className="text-[13px] italic" style={{ color: T.mutedLight }}>
        No experience details provided
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ background: T.bg }}>
            <th
              className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider rounded-l-lg"
              style={{ color: T.muted }}
            >
              Industry / Role
            </th>
            <th
              className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider"
              style={{ color: T.muted }}
            >
              Organisation
            </th>
            <th
              className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider rounded-r-lg"
              style={{ color: T.muted }}
            >
              Experience
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, detail], i) => (
            <tr
              key={i}
              className="border-b last:border-0 transition-colors hover:bg-slate-50"
              style={{ borderColor: T.divider }}
            >
              <td className="px-4 py-3.5 font-semibold" style={{ color: T.black }}>
                {capitalize(key)}
              </td>
              <td className="px-4 py-3.5 font-medium" style={{ color: T.blue }}>
                {detail?.organisationName || detail?.organization_name || '—'}
              </td>
              <td className="px-4 py-3.5">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    background: T.redSoft,
                    color: T.red,
                    borderColor: 'rgba(220,38,38,0.2)'
                  }}
                >
                  {detail?.years || '—'} yrs
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Stat Badge ─────────────────────────────────────────────────────────── */
function StatBadge({ icon: Icon, label, value, variant = 'blue' }) {
  const isBlue = variant === 'blue';
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        background: isBlue ? T.blueSoft : T.redSoft,
        borderColor: isBlue ? 'rgba(29,78,216,0.15)' : 'rgba(220,38,38,0.15)'
      }}
    >
      <Icon size={16} style={{ color: isBlue ? T.blue : T.red }} />
      <div>
        <p className="text-[11px] font-medium" style={{ color: T.muted }}>{label}</p>
        <p className="text-[13px] font-bold" style={{ color: T.black }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
function PartnerAIProfileDetail({ partner, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!partner?.email) return;
    setLoading(true);
    setError(null);
    fetchPartnerAIProfile(partner.email)
      .then((data) => setProfile(data))
      .catch((err) => setError(err?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [partner?.email]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ background: T.bg }}>
        <TopBar onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: T.redSoft }}
            >
              <Loader2 size={22} className="animate-spin" style={{ color: T.red }} />
            </div>
            <p className="text-[14px] font-medium" style={{ color: T.muted }}>
              Loading AI profile…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ background: T.bg }}>
        <TopBar onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: T.redSoft }}
            >
              <AlertCircle size={26} style={{ color: T.red }} />
            </div>
            <div>
              <p className="text-[16px] font-bold mb-1" style={{ color: T.black }}>Could not load profile</p>
              <p className="text-[13px]" style={{ color: T.muted }}>{error}</p>
            </div>
            <button
              onClick={onBack}
              className="mt-1 px-6 py-2.5 rounded-full text-[13px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: T.red }}
            >
              Return to CRM
            </button>
          </div>
        </div>
      </div>
    );
  }

  const p = profile || {};
  const initials = (p.name || partner?.name || 'P')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fullName = p.name || partner?.name || '—';
  const location = [p.city || partner?.city, p.country || partner?.country].filter(Boolean).join(', ') || '—';

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ background: T.bg }}>

      {/* ── Top Bar ── */}
      <TopBar
        onBack={onBack}
        agreementSigned={p.agreementSigned}
        hasAIProfile={p.hasAIProfile}
      />

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* ── Hero Card ── */}
          <div
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: T.border, boxShadow: '0 2px 16px rgba(15,15,15,0.07)' }}
          >
            {/* Top accent bar — black with red stripe */}
            <div
              className="h-2 w-full"
              style={{ background: `linear-gradient(90deg, ${T.black} 0%, ${T.black} 70%, ${T.red} 100%)` }}
            />

            <div className="px-8 pt-6 pb-7">
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white text-[22px] font-black flex-shrink-0 border-2"
                  style={{
                    background: T.black,
                    borderColor: T.border,
                    boxShadow: '0 4px 14px rgba(15,15,15,0.2)',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {initials}
                </div>

                {/* Name + type */}
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-[24px] font-extrabold leading-tight mb-1.5 truncate"
                    style={{ color: T.black, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {fullName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.partnerType && (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border"
                        style={{ background: T.blueSoft, color: T.blue, borderColor: 'rgba(29,78,216,0.2)' }}
                      >
                        <Star size={10} fill={T.blue} />
                        {capitalize(p.partnerType)}
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border"
                      style={{ background: T.redSoft, color: T.red, borderColor: 'rgba(220,38,38,0.2)' }}
                    >
                      <Shield size={10} />
                      {capitalize(p.loginRole || 'Provider')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t mb-5" style={{ borderColor: T.divider }} />

              {/* Contact strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ContactChip icon={Mail} value={p.email || partner?.email} />
                <ContactChip icon={Phone} value={p.phone || partner?.phone} />
                <ContactChip icon={MapPin} value={location} />
                <ContactChip icon={Calendar} value={`Joined ${fmt(p.registrationDate)}`} />
              </div>
            </div>
          </div>

          {/* ── Quick Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBadge icon={Tag} label="Services" value={`${(p.services || []).length} listed`} variant="blue" />
            <StatBadge icon={Layers} label="Industries" value={`${(p.industries || []).length} listed`} variant="blue" />
            <StatBadge icon={Briefcase} label="Experience" value={`${Object.keys(p.experienceDetails || {}).length} roles`} variant="red" />
            <StatBadge
              icon={p.agreementSigned ? CheckCircle2 : Clock}
              label="Agreement"
              value={p.agreementSigned ? 'Signed' : 'Pending'}
              variant={p.agreementSigned ? 'blue' : 'red'}
            />
          </div>

          {/* ── Two Column ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard icon={Tag} title="Services Offered" iconColor={T.blue}>
              <TagList items={p.services} variant="blue" />
            </SectionCard>

            <SectionCard icon={Layers} title="Industry Focus" iconColor={T.red}>
              <TagList items={p.industries} variant="red" />
            </SectionCard>

            <SectionCard icon={Globe2} title="Industries with Experience" iconColor={T.blue}>
              <TagList items={p.experienceIndustries} variant="dark" />
            </SectionCard>

            <SectionCard icon={User} title="Partner Details" iconColor={T.black}>
              <InfoRow label="Partner Type" value={capitalize(p.partnerType)} />
              <InfoRow label="Login Role" value={capitalize(p.loginRole)} />
              <InfoRow label="Profile Created" value={fmt(p.aiProfileCreatedAt)} />
              <InfoRow label="Last Updated" value={fmt(p.aiProfileUpdatedAt)} />
            </SectionCard>
          </div>

          {/* ── Experience Details ── */}
          <SectionCard icon={Award} title="Experience Details" iconColor={T.red}>
            <ExperienceTable experienceDetails={p.experienceDetails} />
          </SectionCard>

          {/* ── Bio ── */}
          {p.bio && (
            <SectionCard icon={BookOpen} title="Professional Bio" iconColor={T.black}>
              <p
                className="text-[14px] leading-relaxed whitespace-pre-wrap"
                style={{ color: '#334155', fontFamily: 'Geist, sans-serif' }}
              >
                {p.bio}
              </p>
            </SectionCard>
          )}

          {/* ── Agreement ── */}
          <SectionCard
            icon={p.agreementSigned ? CheckCircle2 : Clock}
            title="Partner Agreement"
            iconColor={p.agreementSigned ? T.blue : T.red}
          >
            {p.agreementSigned ? (
              <div className="space-y-0">
                <div
                  className="flex items-center gap-4 p-4 rounded-xl border mb-5"
                  style={{
                    background: T.blueSoft,
                    borderColor: 'rgba(29,78,216,0.15)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: T.blue }}
                  >
                    <CheckCircle2 size={18} color={T.white} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold mb-0.5" style={{ color: T.black }}>Agreement Signed</p>
                    <p className="text-[12px]" style={{ color: T.muted }}>
                      This partner has accepted all terms &amp; conditions
                    </p>
                  </div>
                </div>
                <InfoRow label="Signed By" value={p.agreementSignedName} highlight />
                <InfoRow label="Signed On" value={fmtTime(p.agreementSignedAt)} />
              </div>
            ) : (
              <div
                className="flex items-center gap-4 p-4 rounded-xl border"
                style={{
                  background: T.redSoft,
                  borderColor: 'rgba(220,38,38,0.15)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                  style={{ borderColor: T.red, background: T.white }}
                >
                  <Clock size={18} style={{ color: T.red }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold mb-0.5" style={{ color: T.black }}>Agreement Pending</p>
                  <p className="text-[12px]" style={{ color: T.muted }}>
                    This partner has not yet signed the agreement
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Contact Info ── */}
          <SectionCard icon={Building2} title="Contact Information" iconColor={T.blue}>
            <InfoRow label="Email Address" value={p.email} highlight />
            <InfoRow label="Phone" value={p.phone || partner?.phone} />
            <InfoRow label="City" value={p.city || partner?.city} />
            <InfoRow label="Country" value={p.country || partner?.country} />
            <InfoRow label="Registered" value={fmt(p.registrationDate)} />
          </SectionCard>

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}

/* ─── Top Bar ─────────────────────────────────────────────────────────────── */
function TopBar({ onBack, agreementSigned, hasAIProfile }) {
  return (
    <div
      className="flex items-center justify-between px-7 h-[72px] shrink-0 border-b"
      style={{ background: T.white, borderColor: T.border }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[13px] font-semibold transition-all hover:opacity-70 group"
        style={{ color: T.black, fontFamily: 'Geist, sans-serif' }}
      >
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full border transition-colors group-hover:border-slate-400"
          style={{ borderColor: T.border, background: T.bg }}
        >
          <ArrowLeft size={13} style={{ color: T.black }} />
        </span>
        Back to Partners
      </button>

      <div className="flex items-center gap-2">
        {agreementSigned && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border"
            style={{ background: T.blueSoft, color: T.blue, borderColor: 'rgba(29,78,216,0.2)' }}
          >
            <CheckCircle2 size={12} />
            Agreement Signed
          </span>
        )}
        {hasAIProfile && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border text-white"
            style={{ background: T.red, borderColor: T.red }}
          >
            <Award size={12} />
            AI Profile Complete
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Contact Chip ────────────────────────────────────────────────────────── */
function ContactChip({ icon: Icon, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={13} style={{ color: T.muted, flexShrink: 0 }} />
      <span
        className="text-[12px] font-medium truncate"
        style={{ color: '#475569', fontFamily: 'Geist, sans-serif' }}
      >
        {value}
      </span>
    </div>
  );
}

export { PartnerAIProfileDetail };
