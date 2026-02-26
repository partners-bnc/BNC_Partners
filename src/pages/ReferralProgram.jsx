import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// -- LEVEL DATA --
const LEVELS = [
  { id: 1, letter: "A", pct: 1.20, poolShare: 40,   color: "#2C5AA0", bg: "#E8F1FF", border: "#4E7FC2", tag: "L1", labelKey: "referralProgramPage.levels.l1.label", intentKey: "referralProgramPage.levels.l1.intent" },
  { id: 2, letter: "B", pct: 0.70, poolShare: 23.3, color: "#1E40AF", bg: "#EEF2FF", border: "#5B7EE5", tag: "L2", labelKey: "referralProgramPage.levels.l2.label", intentKey: "referralProgramPage.levels.l2.intent" },
  { id: 3, letter: "C", pct: 0.50, poolShare: 16.7, color: "#0F766E", bg: "#ECFEFF", border: "#5BD6D0", tag: "L3", labelKey: "referralProgramPage.levels.l3.label", intentKey: "referralProgramPage.levels.l3.intent" },
  { id: 4, letter: "D", pct: 0.40, poolShare: 13.3, color: "#1F7A5A", bg: "#E6FFFA", border: "#81E6D9", tag: "L4", labelKey: "referralProgramPage.levels.l4.label", intentKey: "referralProgramPage.levels.l4.intent" },
  { id: 5, letter: "E", pct: 0.20, poolShare: 6.7,  color: "#B45309", bg: "#FFFBEB", border: "#F6AD55", tag: "L5", labelKey: "referralProgramPage.levels.l5.label", intentKey: "referralProgramPage.levels.l5.intent" },
];

const BRAND = "#2C5AA0";
const BRAND_LIGHT = "#4E7FC2";
const BRAND_BG = "#E8F1FF";
const INK = "#1E293B";
const MUTED = "#64748B";
const MUTED_LIGHT = "#94A3B8";
const SURFACE = "#FFFFFF";
const SURFACE_ALT = "#F7F2ED";
const BORDER = "#E2E8F0";
const ARABIC_FONT = "'Tajawal','Segoe UI','Noto Sans Arabic','Noto Kufi Arabic',sans-serif";


// -- HOOK: INTERSECTION OBSERVER --
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// -- DONUT CHART --
function DonutChart() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const bodyFont = isRtl ? ARABIC_FONT : "'Geist',sans-serif";
  const [hovered, setHovered] = useState(null);
  const cx = 100, cy = 100, R = 78, r = 46;
  let angle = -Math.PI / 2;
  const segments = LEVELS.map(l => {
    const a = (l.poolShare / 100) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle), y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + a), y2 = cy + R * Math.sin(angle + a);
    const ix1 = cx + r * Math.cos(angle + a), iy1 = cy + r * Math.sin(angle + a);
    const ix2 = cx + r * Math.cos(angle), iy2 = cy + r * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    const d = `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${ix1} ${iy1} A${r} ${r} 0 ${large} 0 ${ix2} ${iy2}Z`;
    angle += a;
    return { ...l, d };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="78" fill={SURFACE_ALT} />
          {segments.map(s => (
            <path key={s.id} d={s.d} fill={s.border}
              opacity={hovered === s.id ? 1 : 0.78}
              style={{ cursor: "pointer", transition: "opacity 0.2s, transform 0.2s", transformOrigin: "100px 100px",
                transform: hovered === s.id ? "scale(1.04)" : "scale(1)" }}
              onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)} />
          ))}
          <circle cx="100" cy="100" r="46" fill="white" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: "1.5rem", color: BRAND, lineHeight: 1 }}>3%</div>
          <div style={{ fontSize: "0.62rem", color: MUTED_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
            {t("referralProgramPage.donut.totalPool")}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.55rem", minWidth: 180 }}>
        {LEVELS.map(l => (
          <div key={l.id} onMouseEnter={() => setHovered(l.id)} onMouseLeave={() => setHovered(null)}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: 8,
              background: hovered === l.id ? l.bg : SURFACE, border: `1px solid ${hovered === l.id ? l.border : BORDER}`,
              transition: "all 0.2s", cursor: "pointer" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.border, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "0.82rem", color: MUTED, fontFamily: bodyFont }}>
              L{l.id} - {t(l.labelKey)}
            </div>
            <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: "0.85rem", color: l.color }}>{l.poolShare}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- BAR CHART --
function BarChart() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const [ref, visible] = useInView(0.2);
  return (
    <div ref={ref}>
      <div style={{ fontFamily: headingFont, fontWeight: 600, fontSize: "0.85rem", color: MUTED_LIGHT, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {t("referralProgramPage.barChart.title")}
      </div>
      {LEVELS.map((l, i) => (
        <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ width: 28, fontFamily: headingFont, fontWeight: 700, fontSize: "0.8rem", color: l.color, textAlign: "right", flexShrink: 0 }}>{l.tag}</div>
          <div style={{ flex: 1, height: 36, background: SURFACE_ALT, borderRadius: 6, overflow: "hidden", position: "relative" }}>
            <div style={{
              height: "100%", borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 12,
              background: `linear-gradient(90deg, ${l.border}99, ${l.border}CC)`,
              width: visible ? `${l.poolShare}%` : "0%",
              transition: `width 1.2s cubic-bezier(0.23,1,0.32,1) ${i * 0.12}s`,
              fontFamily: headingFont, fontWeight: 700, fontSize: "0.82rem", color: "#fff",
              whiteSpace: "nowrap"
            }}>{l.pct}%</div>
          </div>
          <div style={{ width: 38, fontSize: "0.78rem", color: MUTED_LIGHT, flexShrink: 0 }}>{l.poolShare}%</div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "1rem", borderTop: `1px solid ${BORDER}`, marginTop: "0.5rem" }}>
        <div style={{ width: 38, fontFamily: headingFont, fontWeight: 700, fontSize: "0.8rem", color: BRAND, textAlign: "right" }}>
          {t("referralProgramPage.barChart.sumLabel")}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${BRAND}, #4E7FC2)`, color: "#fff", padding: "6px 18px", borderRadius: 6, fontFamily: headingFont, fontWeight: 800, fontSize: "0.9rem" }}>
          {t("referralProgramPage.barChart.totalLabel")}
        </div>
        <div style={{ fontSize: "0.78rem", color: MUTED_LIGHT }}>
          {t("referralProgramPage.barChart.capLabel")}
        </div>
      </div>
    </div>
  );
}

// -- CHAIN NODE --
function ChainNode({ level, isLast }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 100 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          border: `2px solid ${level.border}`,
          background: hov ? level.bg : SURFACE,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: headingFont, fontWeight: 800, fontSize: "1.2rem",
          color: level.color, zIndex: 1, position: "relative",
          transform: hov ? "scale(1.12)" : "scale(1)",
          transition: "all 0.25s",
          boxShadow: hov ? `0 6px 24px ${level.border}44` : "0 2px 8px rgba(0,0,0,0.06)"
        }}>{level.letter}</div>
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: "0.82rem", color: level.color, marginTop: 8, textAlign: "center" }}>
          {isLast ? t("referralProgramPage.chain.clientLabel") : t("referralProgramPage.chain.partnerLabel", { letter: level.letter })}
        </div>
        <div style={{ fontSize: "0.72rem", color: MUTED_LIGHT, textAlign: "center", lineHeight: 1.4, marginTop: 2 }}>
          {isLast ? t("referralProgramPage.chain.clientSubLabel") : t("referralProgramPage.chain.levelPct", { level: level.id, pct: level.pct })}
        </div>
      </div>
      {!isLast && (
        <div style={{ width: 32, height: 2, background: `linear-gradient(90deg, ${level.border}, ${LEVELS[Math.min(level.id, 4)].border})`, flexShrink: 0, margin: "0 -4px", marginBottom: 28 }} />
      )}
    </div>
  );
}

// -- LEVEL CARD --
function LevelCard({ level }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? level.bg : SURFACE,
        borderRadius: 14,
        padding: "1.8rem 1.5rem",
        border: `1px solid ${hovered ? level.border : BORDER}`,
        borderTop: `3px solid ${level.border}`,
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px ${level.border}22` : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.25s",
        cursor: "default"
      }}
    >
      <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 4,
        background: `${level.border}18`, color: level.color,
        fontSize: "0.68rem", fontFamily: headingFont, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", marginBottom: "1rem" }}>
        {t("referralProgramPage.levels.levelLabel", { level: level.id })}
      </div>
      <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: "2.6rem", color: level.color, lineHeight: 1, marginBottom: "0.5rem" }}>
        {level.pct}%
      </div>
      <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: "0.95rem", color: INK, marginBottom: 4 }}>
        {t(level.labelKey)}
      </div>
      <div style={{ fontSize: "0.8rem", color: MUTED_LIGHT, lineHeight: 1.5 }}>
        {t(level.intentKey)}
      </div>
    </div>
  );
}

// -- RULE CARD --
function RuleCard({ rule }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const bodyFont = isRtl ? ARABIC_FONT : "'Geist',sans-serif";
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? BRAND_BG : SURFACE_ALT, borderRadius: 14, padding: "1.5rem",
        border: `1px solid ${hovered ? BRAND_LIGHT + "66" : BORDER}`,
        display: "flex", gap: "1rem", alignItems: "flex-start",
        transition: "all 0.2s", cursor: "default" }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, background: hovered ? `${BRAND_LIGHT}22` : SURFACE,
        border: `1px solid ${hovered ? BRAND_LIGHT : BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.8rem", fontWeight: 700, color: BRAND, flexShrink: 0, transition: "all 0.2s" }}>
        {t(rule.iconKey)}
      </div>
      <div>
        <h4 style={{ fontFamily: headingFont, fontWeight: 700, fontSize: "0.92rem", color: INK, marginBottom: 4 }}>
          {t(rule.titleKey)}
        </h4>
        <p style={{ fontFamily: bodyFont, fontSize: "0.82rem", color: MUTED, lineHeight: 1.6 }}>
          {t(rule.descKey)}
        </p>
      </div>
    </div>
  );
}

// -- CALCULATOR --
function Calculator() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const bodyFont = isRtl ? ARABIC_FONT : "'Geist',sans-serif";
  const [revenue, setRevenue] = useState(100000);
  const fmt = n => n >= 10000000 ? "INR " + (n / 10000000).toFixed(2) + " Cr"
    : n >= 100000 ? "INR " + (n / 100000).toFixed(2) + " L"
    : n >= 1000 ? "INR " + (n / 1000).toFixed(1) + "K"
    : "INR " + n.toFixed(0);

  return (
    <div style={{ background: SURFACE_ALT, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2rem 2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.8rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: "0.78rem", color: MUTED_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: headingFont, fontWeight: 600 }}>
            {t("referralProgramPage.calculator.revenueLabel")}
          </label>
          <input type="number" value={revenue} min={1000} step={10000}
            onChange={e => setRevenue(Math.max(0, Number(e.target.value)))}
            style={{ background: SURFACE, border: `1.5px solid ${BORDER}`, color: INK, padding: "10px 16px", borderRadius: 10,
              fontFamily: headingFont, fontWeight: 700, fontSize: "1.05rem", width: 200, outline: "none" }} />
        </div>
        <div style={{ paddingTop: 20, fontSize: "0.88rem", color: MUTED, fontFamily: bodyFont }}>
          {t("referralProgramPage.calculator.earningsLabel")}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.9rem" }}>
        {LEVELS.map(l => (
          <div key={l.id} style={{ background: l.bg, border: `1px solid ${l.border}44`, borderRadius: 12, padding: "1.2rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: l.color, fontFamily: headingFont, fontWeight: 700, marginBottom: 4 }}>
              {t("referralProgramPage.levels.levelLabel", { level: l.id })}
            </div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: "1.5rem", color: l.color }}>{fmt(revenue * l.pct / 100)}</div>
            <div style={{ fontSize: "0.75rem", color: MUTED_LIGHT, marginTop: 2 }}>
              {t("referralProgramPage.calculator.pctOfRevenue", { pct: l.pct })}
            </div>
          </div>
        ))}
        <div style={{ background: BRAND_BG, border: `1.5px solid ${BRAND_LIGHT}`, borderRadius: 12, padding: "1.2rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND, fontFamily: headingFont, fontWeight: 700, marginBottom: 4 }}>
            {t("referralProgramPage.calculator.totalPoolLabel")}
          </div>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: "1.5rem", color: BRAND }}>{fmt(revenue * 0.03)}</div>
          <div style={{ fontSize: "0.75rem", color: MUTED_LIGHT, marginTop: 2 }}>
            {t("referralProgramPage.calculator.totalPoolPct")}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- SECTION WRAPPER --
function Section({ id, bg = SURFACE, children, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <section id={id} style={{ background: bg, padding: "5rem 1.5rem", ...style }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: headingFont, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND, marginBottom: "0.8rem" }}>
      <span style={{ width: 24, height: 1.5, background: BRAND, display: "inline-block" }} />
      {children}
    </div>
  );
}

// -- GOVERNANCE RULES --
const RULES = [
  { iconKey: "referralProgramPage.rules.r1.icon", titleKey: "referralProgramPage.rules.r1.title", descKey: "referralProgramPage.rules.r1.desc" },
  { iconKey: "referralProgramPage.rules.r2.icon", titleKey: "referralProgramPage.rules.r2.title", descKey: "referralProgramPage.rules.r2.desc" },
  { iconKey: "referralProgramPage.rules.r3.icon", titleKey: "referralProgramPage.rules.r3.title", descKey: "referralProgramPage.rules.r3.desc" },
  { iconKey: "referralProgramPage.rules.r4.icon", titleKey: "referralProgramPage.rules.r4.title", descKey: "referralProgramPage.rules.r4.desc" },
  { iconKey: "referralProgramPage.rules.r5.icon", titleKey: "referralProgramPage.rules.r5.title", descKey: "referralProgramPage.rules.r5.desc" },
  { iconKey: "referralProgramPage.rules.r6.icon", titleKey: "referralProgramPage.rules.r6.title", descKey: "referralProgramPage.rules.r6.desc" },
];

// -- MAIN PAGE --
export default function ReferralPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const headingFont = isRtl ? ARABIC_FONT : "'Poppins',sans-serif";
  const bodyFont = isRtl ? ARABIC_FONT : "'Geist',sans-serif";
  const heroFont = isRtl ? ARABIC_FONT : "'Sora',sans-serif";

  return (
    <div style={{ background: SURFACE_ALT, color: INK }} dir={isRtl ? "rtl" : "ltr"}>
      {/* Local Animations */}
      <style>{`
        @keyframes heroFadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatPulse { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
      `}</style>

      {/* -- HERO -- */}
      <section style={{
        minHeight: "96vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        textAlign: "center", padding: "7rem 1.5rem 5rem", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #F1F6FF 0%, #F7F2ED 50%, #EEF2FF 100%)"
      }}>
        {/* Decorative circles */}
        {[{ s:500, x:"-10%", y:"-20%", c:"#2C5AA018" },{ s:400, x:"80%", y:"10%", c:"#4E7FC218" },{ s:300, x:"20%", y:"75%", c:"#5B7EE518" }].map((c,i)=>(
          <div key={i} style={{ position:"absolute", width:c.s, height:c.s, borderRadius:"50%", background:c.c, left:c.x, top:c.y, pointerEvents:"none" }} />
        ))}

        <div style={{ animation: "heroFadeUp 0.8s ease both", display:"inline-flex", alignItems:"center", gap:8,
          border:`1px solid ${BRAND_LIGHT}55`, background:`${BRAND_BG}`, padding:"6px 18px", borderRadius:100,
          fontSize:"0.72rem", letterSpacing:"0.12em", textTransform:"uppercase", color:BRAND,
          fontFamily: headingFont, fontWeight:700, marginBottom:"1.8rem" }}>
          <span style={{fontSize:"0.5rem"}}>*</span> {t("referralProgramPage.hero.badge")}
        </div>

        <h1 style={{ animation:"heroFadeUp 0.8s 0.1s ease both", fontFamily: heroFont, fontWeight:800,
          fontSize:"clamp(2.6rem,7vw,5.5rem)", letterSpacing:"-0.03em", color: INK,
          lineHeight:1.08, maxWidth:820, marginBottom:"1.4rem" }}>
          {t("referralProgramPage.hero.titlePrefix")}{" "}
          <span style={{ background:`linear-gradient(135deg, ${BRAND} 0%, #4E7FC2 60%, #7FB0F3 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            {t("referralProgramPage.hero.titleHighlight")}
          </span>{" "}{t("referralProgramPage.hero.titleSuffix")}
        </h1>

        <p style={{ animation:"heroFadeUp 0.8s 0.2s ease both", fontFamily: bodyFont, fontWeight:300,
          fontSize:"clamp(1rem,1.8vw,1.18rem)", color: MUTED, maxWidth:560, lineHeight:1.75, marginBottom:"2.5rem" }}>
          {t("referralProgramPage.hero.subtitle")} <strong style={{color:BRAND, fontWeight:500}}>3%</strong> {t("referralProgramPage.hero.subtitleTail")}
        </p>

        <div style={{ animation:"heroFadeUp 0.8s 0.3s ease both", display:"flex", gap:"1rem", flexWrap:"wrap", justifyContent:"center" }}>
          <a href="#join" style={{ background:`linear-gradient(135deg, ${BRAND}, #4E7FC2)`, color:"#fff", padding:"14px 32px", borderRadius:10,
            fontFamily: headingFont, fontWeight:700, fontSize:"0.9rem", letterSpacing:"0.04em",
            textDecoration:"none", boxShadow:`0 4px 20px ${BRAND}44`, transition:"transform 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            {t("referralProgramPage.hero.primaryCta")}
          </a>
          <a href="#how-it-works" style={{ background: SURFACE, color: INK, padding:"14px 32px", borderRadius:10,
            fontFamily: headingFont, fontWeight:700, fontSize:"0.9rem", letterSpacing:"0.04em",
            textDecoration:"none", border:`1.5px solid ${BORDER}`, transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND_LIGHT} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
            {t("referralProgramPage.hero.secondaryCta")}
          </a>
        </div>

        {/* Scroll indicator */}
        <div style={{ animation:"floatPulse 2s infinite", marginTop:"3.5rem", color:BRAND_LIGHT, fontSize:"1.5rem" }}>v</div>
      </section>

      {/* -- STATS STRIP -- */}
      <div style={{ background: SURFACE, borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem", display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:"1.5rem" }}>
          {[
            ["5", t("referralProgramPage.stats.levels")],
            ["3%", t("referralProgramPage.stats.pool")],
            ["1.20%", t("referralProgramPage.stats.direct")],
            ["100%", t("referralProgramPage.stats.realised")]
          ].map(([num,lbl])=>(
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontFamily: headingFont, fontWeight:800, fontSize:"2rem", color:BRAND }}>{num}</div>
              <div style={{ fontSize:"0.75rem", color: MUTED_LIGHT, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:4, fontFamily: bodyFont }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* -- HOW IT WORKS -- */}
      <Section id="how-it-works" bg={SURFACE_ALT}>
        <SectionLabel>{t("referralProgramPage.sections.system")}</SectionLabel>
        <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: INK, marginBottom:"0.8rem" }}>
          {t("referralProgramPage.headings.chain")}
        </h2>
        <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"1.02rem", maxWidth:520, marginBottom:"3rem" }}>
          {t("referralProgramPage.descriptions.chain")}
        </p>

        {/* Chain */}
        <div style={{ display:"flex", alignItems:"center", overflowX:"auto", paddingBottom:"1rem", gap:0 }}>
          {LEVELS.map((l) => <ChainNode key={l.id} level={l} isLast={false} />)}
          {/* Arrow */}
          <div style={{ width:32, height:2, background:`linear-gradient(90deg, ${LEVELS[4].border}, ${BRAND})`, flexShrink:0, margin:"0 -4px", marginBottom:28 }} />
          {/* Client node */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, minWidth:100 }}>
            <div style={{ width:64, height:64, borderRadius:"50%", border:`2px solid ${BRAND}`, background:BRAND_BG,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem",
              boxShadow:`0 4px 16px ${BRAND}33` }}>{t("referralProgramPage.chain.clientBadge")}</div>
            <div style={{ fontFamily: headingFont, fontWeight:700, fontSize:"0.82rem", color:BRAND, marginTop:8 }}>{t("referralProgramPage.chain.clientLabel")}</div>
            <div style={{ fontSize:"0.72rem", color: MUTED_LIGHT, textAlign:"center", lineHeight:1.4, marginTop:2 }}>{t("referralProgramPage.chain.clientSubLabel")}</div>
          </div>
        </div>

        {/* Result box */}
        <div style={{ marginTop:"2.5rem", background: SURFACE, border:`1px solid ${BRAND}44`, borderRadius:16, padding:"1.8rem 2rem",
          display:"flex", alignItems:"flex-start", gap:"1.5rem", boxShadow:`0 4px 24px ${BRAND}18`, flexWrap:"wrap" }}>
          <div style={{ fontSize:"2.5rem", lineHeight:1 }}>{t("referralProgramPage.chain.resultIcon")}</div>
          <div>
            <h3 style={{ fontFamily: headingFont, fontWeight:800, color:`${BRAND}`, fontSize:"1.2rem", marginBottom:6 }}>
              {t("referralProgramPage.chain.resultTitle")}
            </h3>
            <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"0.92rem", lineHeight:1.7, maxWidth:680 }}>
              {t("referralProgramPage.chain.resultDesc")}{" "}
              <strong style={{ color: INK }}>{t("referralProgramPage.chain.resultStrong")}</strong>
            </p>
          </div>
        </div>
      </Section>

      {/* -- COMMISSION LEVELS -- */}
      <Section id="commission" bg={SURFACE_ALT}>
        <SectionLabel>{t("referralProgramPage.sections.distribution")}</SectionLabel>
        <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: INK, marginBottom:"0.8rem" }}>
          {t("referralProgramPage.headings.distribution")}
        </h2>
        <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"1.02rem", maxWidth:520, marginBottom:"2.5rem" }}>
          {t("referralProgramPage.descriptions.distribution")}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"1rem", marginBottom:"1.8rem" }}>
          {LEVELS.map(l => <LevelCard key={l.id} level={l} />)}
        </div>

        {/* Note */}
        <div style={{ background: SURFACE, borderLeft:`3px solid ${BRAND}`, borderRadius:"0 10px 10px 0", padding:"1rem 1.5rem", fontSize:"0.88rem", color: MUTED, lineHeight:1.7, fontFamily: bodyFont }}>
          <strong style={{color:BRAND}}>{t("referralProgramPage.note.label")}</strong> {t("referralProgramPage.note.text")}
        </div>
      </Section>

      {/* -- CHARTS -- */}
      <Section id="charts" bg={SURFACE}>
        <SectionLabel>{t("referralProgramPage.sections.visuals")}</SectionLabel>
        <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: INK, marginBottom:"2.5rem" }}>
          {t("referralProgramPage.headings.visuals")}
        </h2>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1.5rem" }}>
          <div style={{ background: SURFACE_ALT, border:`1px solid ${BORDER}`, borderRadius:20, padding:"2rem" }}>
            <BarChart />
          </div>
          <div style={{ background: SURFACE_ALT, border:`1px solid ${BORDER}`, borderRadius:20, padding:"2rem" }}>
            <div style={{ fontFamily: headingFont, fontWeight:600, fontSize:"0.85rem", color: MUTED_LIGHT, marginBottom:"1.5rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>
              {t("referralProgramPage.donut.title")}
            </div>
            <DonutChart />
          </div>
        </div>
      </Section>

      {/* -- CALCULATOR -- */}
      <Section id="calculator" bg={SURFACE_ALT}>
        <SectionLabel>{t("referralProgramPage.sections.calculator")}</SectionLabel>
        <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: INK, marginBottom:"0.8rem" }}>
          {t("referralProgramPage.headings.calculator")}
        </h2>
        <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"1.02rem", maxWidth:520, marginBottom:"2.5rem" }}>
          {t("referralProgramPage.descriptions.calculator")}
        </p>
        <Calculator />
      </Section>

      {/* -- GOVERNANCE -- */}
      <Section id="rules" bg={SURFACE}>
        <SectionLabel>{t("referralProgramPage.sections.governance")}</SectionLabel>
        <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(1.8rem,3.5vw,2.8rem)", color: INK, marginBottom:"0.8rem" }}>
          {t("referralProgramPage.headings.governance")}
        </h2>
        <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"1.02rem", maxWidth:520, marginBottom:"2.5rem" }}>
          {t("referralProgramPage.descriptions.governance")}
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"1rem" }}>
          {RULES.map((rule) => <RuleCard key={rule.title} rule={rule} />)}
        </div>
      </Section>

      {/* -- CTA -- */}
      <section id="join" style={{ background:`linear-gradient(135deg, #F1F6FF 0%, #F7F2ED 50%, #EEF2FF 100%)`, padding:"7rem 1.5rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {/* Deco */}
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:`${BRAND}08`, top:"-200px", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:640, margin:"0 auto", position:"relative" }}>
          <SectionLabel>{t("referralProgramPage.sections.cta")}</SectionLabel>
          <h2 style={{ fontFamily: headingFont, fontWeight:800, fontSize:"clamp(2rem,4.5vw,3.5rem)", color: INK, lineHeight:1.1, marginBottom:"1rem" }}>
            {t("referralProgramPage.cta.titleLine1")}<br />
            <span style={{ background:`linear-gradient(135deg, ${BRAND}, #4E7FC2)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              {t("referralProgramPage.cta.titleLine2")}
            </span>
          </h2>
          <p style={{ fontFamily: bodyFont, color: MUTED, fontSize:"1.05rem", marginBottom:"2.5rem", lineHeight:1.7 }}>
            {t("referralProgramPage.cta.subtitle")}
          </p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="#" style={{ background:`linear-gradient(135deg, ${BRAND}, #4E7FC2)`, color:"#fff", padding:"15px 36px", borderRadius:10,
              fontFamily: headingFont, fontWeight:700, fontSize:"0.95rem", letterSpacing:"0.04em",
              textDecoration:"none", boxShadow:`0 6px 28px ${BRAND}44` }}>
              {t("referralProgramPage.cta.primaryCta")}
            </a>
            <a href="#" style={{ background: SURFACE, color: INK, padding:"15px 36px", borderRadius:10,
              fontFamily: headingFont, fontWeight:700, fontSize:"0.95rem", letterSpacing:"0.04em",
              textDecoration:"none", border:`1.5px solid ${BORDER}` }}>
              {t("referralProgramPage.cta.secondaryCta")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}









