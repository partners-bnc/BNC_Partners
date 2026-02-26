import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────
//  DESIGN TOKENS (BNC THEME)
// ─────────────────────────────────────────────
const G = {
  gold: "#2C5AA0",
  goldMid: "#4E7FC2",
  goldLight: "#7FB0F3",
  goldBg: "#F1F6FF",
  goldTint: "#E8F1FF",
  cream: "#F7F2ED",
  creamDark: "#EFE7DD",
  white: "#FFFFFF",
  ink: "#1E293B",
  inkMid: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  borderLight: "#EEF2F7",
  green: "#1F7A5A",
  greenBg: "#EAF7F2",
  greenBorder: "#7AD4B4",
  blue: "#2C5AA0",
  blueBg: "#E8F1FF",
  blueBorder: "#4E7FC2",
  purple: "#5B6EE1",
  purpleBg: "#EEF2FF",
  purpleBorder: "#7B8CF0",
};

const FONT_HEAD = "'Poppins', 'Sora', 'Segoe UI', sans-serif";
const FONT_BODY = "'Geist', 'Poppins', 'Segoe UI', sans-serif";
const FONT_EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";

// ─────────────────────────────────────────────
//  HOOK: SCROLL INTO VIEW
// ─────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─────────────────────────────────────────────
//  FADE-IN WRAPPER
// ─────────────────────────────────────────────
function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
//  SECTION LABEL
// ─────────────────────────────────────────────
function Label({ children, rtl = false }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        flexDirection: rtl ? "row-reverse" : "row",
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: "0.7rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: G.goldMid,
        marginBottom: "0.9rem",
      }}
    >
      <span
        style={{
          width: 28,
          height: 1.5,
          background: G.goldMid,
          display: "inline-block",
        }}
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
//  SECTION WRAPPER
// ─────────────────────────────────────────────
function Sec({ id, bg = G.white, children, pad = "5.5rem 1.5rem", rtl = false }) {
  return (
    <section id={id} style={{ background: bg, padding: pad }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: rtl ? "right" : "left" }}>{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  ANIMATED REFERRAL CHAIN
// ─────────────────────────────────────────────
function ReferralChain({ nodes = [], connectors = [], rtl = false }) {
  const [activeStep, setActiveStep] = useState(0);
  const [ref, visible] = useInView(0.1);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActiveStep((s) => (s >= 3 ? 0 : s + 1)), 1900);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <div ref={ref}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          overflowX: "auto",
          paddingBottom: 8,
          flexDirection: rtl ? "row-reverse" : "row",
        }}
      >
        {nodes.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 120 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  border: `2.5px solid ${activeStep >= i ? n.border : G.border}`,
                  background: activeStep >= i ? n.bg : G.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_HEAD,
                  fontWeight: 700,
                  fontSize: n.isClient ? "1.6rem" : "1.4rem",
                  color: activeStep >= i ? n.color : G.muted,
                  transform: activeStep === i ? "scale(1.13)" : "scale(1)",
                  boxShadow:
                    activeStep === i ? `0 8px 28px ${n.border}50` : "0 2px 10px rgba(0,0,0,0.06)",
                  transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  position: "relative",
                }}
              >
                <span style={{ fontFamily: n.isClient ? FONT_EMOJI : FONT_HEAD }}>{n.letter}</span>
                {activeStep === i && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -8,
                      borderRadius: "50%",
                      border: `2px solid ${n.border}55`,
                      animation: "ripple 1.2s ease-out infinite",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  color: activeStep >= i ? n.color : G.muted,
                  marginTop: 10,
                  transition: "color 0.4s",
                }}
              >
                {n.name}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: G.muted,
                  textAlign: "center",
                  maxWidth: 110,
                  lineHeight: 1.45,
                  marginTop: 3,
                }}
              >
                {n.sub}
              </div>
            </div>

            {i < nodes.length - 1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                  gap: 5,
                  marginBottom: 34,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 2,
                    position: "relative",
                    background:
                      activeStep > i
                        ? `linear-gradient(${rtl ? "270deg" : "90deg"}, ${n.border}, ${nodes[i + 1].border})`
                        : G.border,
                    transition: "background 0.5s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -4.5,
                      width: 0,
                      height: 0,
                      borderTop: "5.5px solid transparent",
                      borderBottom: "5.5px solid transparent",
                      ...(rtl
                        ? { left: -5, borderRight: `7px solid ${activeStep > i ? nodes[i + 1].border : G.border}` }
                        : { right: -5, borderLeft: `7px solid ${activeStep > i ? nodes[i + 1].border : G.border}` }),
                      transition: "border-color 0.5s",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: activeStep > i ? G.goldMid : G.muted,
                    fontStyle: "italic",
                    fontFamily: FONT_BODY,
                    transition: "color 0.4s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {connectors[i]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1.5rem" }}>
        {nodes.map((_, i) => (
          <div
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              width: i === activeStep ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= activeStep ? G.goldMid : G.border,
              transition: "all 0.35s",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  OUTCOME CARDS — what each partner earns
// ─────────────────────────────────────────────
function OutcomeCard({ card, delay, rtl = false }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? card.bg : G.white,
          border: `1px solid ${hov ? card.border : G.border}`,
          borderTop: `3px solid ${card.border}`,
          borderRadius: 16,
          padding: "1.8rem",
          transform: hov ? "translateY(-5px)" : "translateY(0)",
          boxShadow: hov ? `0 16px 40px ${card.border}28` : "0 2px 12px rgba(0,0,0,0.05)",
          transition: "all 0.27s",
          cursor: "default",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "1.1rem",
            flexDirection: rtl ? "row-reverse" : "row",
            textAlign: rtl ? "right" : "left",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: card.bg,
              border: `1px solid ${card.border}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.3rem",
              fontFamily: FONT_EMOJI,
            }}
          >
            {card.emoji}
          </div>
          <div style={{ textAlign: rtl ? "right" : "left" }}>
            <div
              style={{
                fontSize: "0.64rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: card.color,
                fontFamily: FONT_BODY,
                fontWeight: 700,
              }}
            >
              {card.tag}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.95rem", color: G.ink }}>
              {card.who}
            </div>
          </div>
        </div>
        <h3
          style={{
            fontFamily: FONT_HEAD,
            fontWeight: 700,
            fontSize: "1.1rem",
            color: card.color,
            marginBottom: "0.6rem",
            lineHeight: 1.3,
          }}
        >
          {card.headline}
        </h3>
        <p style={{ fontFamily: FONT_BODY, fontSize: "0.84rem", color: G.muted, lineHeight: 1.7, textAlign: rtl ? "right" : "left" }}>
          {card.detail}
        </p>
      </div>
    </FadeIn>
  );
}

function OutcomeCards({ cards = [], rtl = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.2rem" }}>
      {cards.map((c, i) => (
        <OutcomeCard key={c.tag} card={c} delay={i * 0.1} rtl={rtl} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  REVENUE FLOW DIAGRAM
// ─────────────────────────────────────────────
function FlowDiagram({ rows = [], rtl = false }) {
  const [ref, visible] = useInView(0.1);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: rtl ? "auto" : 28,
          right: rtl ? 28 : "auto",
          top: 24,
          bottom: 24,
          width: 2,
          background: `linear-gradient(180deg, ${G.goldMid}55, ${G.blueBorder}55, ${G.greenBorder}55, ${G.purpleBorder}55)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s 0.4s",
        }}
      />

      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: rtl ? "1rem 1rem 1rem 1.2rem" : "1rem 1.2rem 1rem 1rem",
            borderRadius: 12,
            background: r.bg,
            border: `1px solid ${r.border}44`,
            marginBottom: "0.75rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : `translateX(${rtl ? "20px" : "-20px"})`,
            transition: `opacity 0.6s ${r.delay}s, transform 0.6s ${r.delay}s`,
            flexDirection: rtl ? "row-reverse" : "row",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: G.white,
              border: `2px solid ${r.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: r.isClient ? FONT_EMOJI : FONT_HEAD,
              fontWeight: 700,
              fontSize: r.isClient ? "1.2rem" : "1rem",
              color: r.color,
              flexShrink: 0,
            }}
          >
            {r.letter}
          </div>
          <div style={{ flex: 1, textAlign: rtl ? "right" : "left" }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.87rem", color: G.ink }}>{r.label}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.77rem", color: G.muted, marginTop: 2, lineHeight: 1.5 }}>{r.sub}</div>
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontFamily: FONT_BODY,
              fontWeight: 700,
              color: r.color,
              background: G.white,
              padding: "3px 9px",
              borderRadius: 20,
              border: `1px solid ${r.border}`,
              flexShrink: 0,
            }}
          >
            {r.tag}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  COMPENSATION VISUAL
// ─────────────────────────────────────────────
function CompensationVisual({ data, rtl = false }) {
  const [ref, visible] = useInView(0.1);
  const legendItems = Array.isArray(data?.legend) ? data.legend : [];
  const bulletItems = Array.isArray(data?.bullets) ? data.bullets : [];
  const legendColors = [G.green, G.goldMid];

  return (
    <div ref={ref}>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s 0.1s",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: "0.75rem",
            color: G.muted,
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textAlign: rtl ? "right" : "left",
          }}
        >
          {data?.allocationTitle}
        </div>
        <div
          style={{
            height: 52,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            flexDirection: rtl ? "row-reverse" : "row",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: visible ? "97%" : "0%",
              background: `linear-gradient(90deg, ${G.green}, #2ECC71)`,
              display: "flex",
              alignItems: "center",
              paddingLeft: rtl ? 0 : 16,
              paddingRight: rtl ? 16 : 0,
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: "0.88rem",
              color: "white",
              transition: "width 1.3s cubic-bezier(0.23,1,0.32,1) 0.3s",
              whiteSpace: "nowrap",
              textAlign: rtl ? "right" : "left",
            }}
          >
            {data?.barMain}
          </div>
          <div
            style={{
              width: visible ? "3%" : "0%",
              background: `linear-gradient(90deg, ${G.goldMid}, ${G.goldLight})`,
              transition: "width 1.3s cubic-bezier(0.23,1,0.32,1) 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginTop: 10, flexDirection: rtl ? "row-reverse" : "row" }}>
          {legendItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, flexDirection: rtl ? "row-reverse" : "row" }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: legendColors[i] || G.muted }} />
              <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: G.muted, textAlign: rtl ? "right" : "left" }}>{item}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.7s 0.4s" }}>
        {bulletItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "0.75rem 1rem",
              borderRadius: 9,
              background: G.greenBg,
              border: `1px solid ${G.greenBorder}44`,
              marginBottom: "0.6rem",
              fontFamily: FONT_BODY,
              fontSize: "0.83rem",
              color: G.inkMid,
              lineHeight: 1.55,
              flexDirection: rtl ? "row-reverse" : "row",
              textAlign: rtl ? "right" : "left",
            }}
          >
            <span style={{ color: G.green, flexShrink: 0, fontFamily: FONT_EMOJI }}>✅</span> {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  CORE PRINCIPLES
// ─────────────────────────────────────────────
// (Principles content is provided via translations in ReferralPage.)

function PrincipleCard({ principle, delay, rtl = false }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: G.white,
          border: `1px solid ${hov ? `${G.goldMid}55` : G.border}`,
          borderRadius: 14,
          padding: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
          transform: hov ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hov ? `0 8px 28px ${G.goldMid}18` : "0 1px 6px rgba(0,0,0,0.04)",
          transition: "all 0.23s",
          cursor: "default",
          flexDirection: rtl ? "row-reverse" : "row",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: hov ? G.goldTint : G.cream,
            border: `1px solid ${hov ? `${G.goldMid}44` : G.borderLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0,
            transition: "all 0.23s",
            fontFamily: FONT_EMOJI,
          }}
        >
          {principle.icon}
        </div>
        <div style={{ textAlign: rtl ? "right" : "left" }}>
          <h4 style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.92rem", color: G.ink, marginBottom: 5 }}>
            {principle.title}
          </h4>
          <p style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: G.muted, lineHeight: 1.65 }}>
            {principle.desc}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

// ─────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────
export default function ReferralPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const hero = t("referralProgramPageSimple.hero", { returnObjects: true });
  const chain = t("referralProgramPageSimple.chain", { returnObjects: true });
  const chainDiagram = t("referralProgramPageSimple.chainDiagram", { returnObjects: true });
  const outcomes = t("referralProgramPageSimple.outcomes", { returnObjects: true });
  const flow = t("referralProgramPageSimple.flow", { returnObjects: true });
  const compensation = t("referralProgramPageSimple.compensation", { returnObjects: true });
  const principles = t("referralProgramPageSimple.principles", { returnObjects: true });
  const cta = t("referralProgramPageSimple.cta", { returnObjects: true });

  const statsItemsRaw = t("referralProgramPageSimple.stats", { returnObjects: true });
  const statsItems = Array.isArray(statsItemsRaw) ? statsItemsRaw : [];

  const chainNodeStyles = [
    { color: G.gold, bg: G.goldTint, border: G.goldMid },
    { color: G.blue, bg: G.blueBg, border: G.blueBorder },
    { color: G.green, bg: G.greenBg, border: G.greenBorder },
    { color: G.purple, bg: G.purpleBg, border: G.purpleBorder, isClient: true },
  ];
  const chainNodesText = Array.isArray(chainDiagram?.nodes) ? chainDiagram.nodes : [];
  const chainNodes = chainNodeStyles.map((style, idx) => ({ ...style, ...(chainNodesText[idx] || {}) }));
  const chainConnectors = Array.isArray(chainDiagram?.connectors) ? chainDiagram.connectors : [];

  const outcomeStyles = [
    { emoji: "🏆", color: G.green, bg: G.greenBg, border: G.greenBorder },
    { emoji: "🤝", color: G.blue, bg: G.blueBg, border: G.blueBorder },
    { emoji: "🌱", color: G.gold, bg: G.goldTint, border: G.goldMid },
  ];
  const outcomeCardsText = Array.isArray(outcomes?.cards) ? outcomes.cards : [];
  const outcomeCards = outcomeStyles.map((style, idx) => ({ ...style, ...(outcomeCardsText[idx] || {}) }));

  const flowStyles = [
    { color: G.gold, bg: G.goldTint, border: G.goldMid, delay: 0.05 },
    { color: G.blue, bg: G.blueBg, border: G.blueBorder, delay: 0.15 },
    { color: G.green, bg: G.greenBg, border: G.greenBorder, delay: 0.25 },
    { color: G.purple, bg: G.purpleBg, border: G.purpleBorder, delay: 0.35, isClient: true },
  ];
  const flowRowsText = Array.isArray(flow?.rows) ? flow.rows : [];
  const flowRows = flowStyles.map((style, idx) => ({ ...style, ...(flowRowsText[idx] || {}) }));

  const principleIcons = ["🆕", "💰", "✅", "🚫", "🛡️", "⚖️"];
  const principleTexts = Array.isArray(principles?.items) ? principles.items : [];
  const principleItems = principleIcons.map((icon, idx) => ({ icon, ...(principleTexts[idx] || {}) }));

  return (
    <div style={{ background: G.cream, color: G.ink }} dir={isRtl ? "rtl" : "ltr"}>
      <style>{`
        @keyframes heroUp { from { opacity:0;transform:translateY(28px); } to { opacity:1;transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.55} 100%{transform:scale(1.55);opacity:0} }
      `}</style>

      <section
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "4.5rem 1.5rem 3.5rem",
          background: `linear-gradient(150deg, ${G.white} 0%, ${G.goldBg} 35%, ${G.cream} 60%, #EEF2FF 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[{ w: 520, t: "-15%", l: "-8%", c: `${G.goldMid}0C` }, { w: 400, t: "5%", r: "-10%", c: `${G.blueBorder}0C` }, { w: 280, b: "0", l: "30%", c: `${G.greenBorder}0A` }].map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: b.w,
              height: b.w,
              borderRadius: "50%",
              background: b.c,
              top: b.t || "auto",
              left: b.l || "auto",
              right: b.r || "auto",
              bottom: b.b || "auto",
              pointerEvents: "none",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `radial-gradient(${G.goldMid}1E 1.5px, transparent 1.5px)`,
            backgroundSize: "34px 34px",
            maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%)",
          }}
        />

        <div
          style={{
            animation: "heroUp 0.75s ease both",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: G.white,
            border: `1.5px solid ${G.goldMid}55`,
            padding: "7px 20px",
            borderRadius: 100,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: G.gold,
            marginBottom: "1.2rem",
            boxShadow: `0 2px 16px ${G.goldMid}22`,
          }}
        >
          <span style={{ fontSize: "0.5rem" }}>◆</span> {hero.badge}
        </div>

        <h1
          style={{
            animation: "heroUp 0.75s 0.1s ease both",
            fontFamily: FONT_HEAD,
            fontWeight: 900,
            fontSize: "clamp(2.2rem,6vw,4.6rem)",
            color: G.ink,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            maxWidth: 860,
            marginBottom: "1rem",
          }}
        >
          {hero.titlePrefix}{" "}
          <em
            style={{
              fontStyle: "normal",
              background: `linear-gradient(135deg, ${G.gold} 0%, ${G.goldLight} 50%, #A9C7FF 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {hero.titleHighlight}
          </em>{" "}
          {hero.titleSuffix}
        </h1>

        <p
          style={{
            animation: "heroUp 0.75s 0.2s ease both",
            fontFamily: FONT_BODY,
            fontWeight: 300,
            fontSize: "clamp(0.98rem,1.6vw,1.12rem)",
            color: G.muted,
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          {hero.subtitle}
        </p>

        <div style={{ animation: "heroUp 0.75s 0.3s ease both", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#chain"
            style={{
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
              color: G.white,
              padding: "14px 34px",
              borderRadius: 10,
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: "0.92rem",
              textDecoration: "none",
              boxShadow: `0 6px 28px ${G.goldMid}44`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 10px 36px ${G.goldMid}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 6px 28px ${G.goldMid}44`;
            }}
          >
            {hero.primaryCta}
          </a>
          <Link
            to="/partner-form"
            style={{
              background: G.white,
              color: G.inkMid,
              padding: "14px 34px",
              borderRadius: 10,
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: "0.92rem",
              textDecoration: "none",
              border: `1.5px solid ${G.border}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = G.goldMid)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = G.border)}
          >
            {hero.secondaryCta}
          </Link>
        </div>

        <div style={{ animation: "float 2.4s ease-in-out infinite", marginTop: "2rem", color: G.goldMid, fontSize: "1.35rem" }}>↓</div>
      </section>

      <div style={{ background: G.white, borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "2.2rem 1.5rem",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {statsItems.map((item, i) => (
            <div key={`${item.label}-${item.value}-${i}`} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: "1.9rem", color: G.gold, lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: G.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 5 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Sec id="chain" bg={G.white} rtl={isRtl}>
        <FadeIn>
          <Label rtl={isRtl}>{chain.label}</Label>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: "clamp(1.7rem,3.5vw,2.8rem)", color: G.ink, marginBottom: "0.8rem" }}>
            {chain.heading}
          </h2>
          <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "1rem", maxWidth: 600, marginBottom: "3rem", lineHeight: 1.78 }}>
            {chain.description}
          </p>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div style={{ background: G.cream, borderRadius: 20, padding: "3.75rem ", border: `1px solid ${G.border}` }}>
            <ReferralChain nodes={chainNodes} connectors={chainConnectors} rtl={isRtl} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div
            style={{
              marginTop: "1.8rem",
              background: G.white,
              border: `1.5px solid ${G.goldMid}44`,
              borderLeft: isRtl ? "none" : `4px solid ${G.goldMid}`,
              borderRight: isRtl ? `4px solid ${G.goldMid}` : "none",
              borderRadius: isRtl ? "14px 0 0 14px" : "0 14px 14px 0",
              padding: "1.4rem 1.8rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "1.1rem",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1, fontFamily: FONT_EMOJI }}>💡</span>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 700, color: G.ink, marginBottom: 4, textAlign: isRtl ? "right" : "left" }}>{chain.inShortLabel}</div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: G.muted, lineHeight: 1.72 }}>
                {chain.inShortText} <strong style={{ color: G.ink }}>{chain.inShortStrong}</strong>
              </p>
            </div>
          </div>
        </FadeIn>
      </Sec>

      <Sec id="outcomes" bg={G.cream} rtl={isRtl}>
        <FadeIn>
          <Label rtl={isRtl}>{outcomes.label}</Label>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: "clamp(1.7rem,3.5vw,2.8rem)", color: G.ink, marginBottom: "0.8rem" }}>
            {outcomes.heading}
          </h2>
          <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "1rem", maxWidth: 560, marginBottom: "2.5rem", lineHeight: 1.78 }}>
            {outcomes.description}
          </p>
        </FadeIn>
        <OutcomeCards cards={outcomeCards} rtl={isRtl} />
      </Sec>

      <Sec id="source" bg={G.white} rtl={isRtl}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "4rem", alignItems: "start" }}>
          <FadeIn>
            <Label rtl={isRtl}>{flow.label}</Label>
            <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.3rem)", color: G.ink, marginBottom: "0.8rem" }}>
              {flow.heading}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.75 }}>
              {flow.description}
            </p>
            <FlowDiagram rows={flowRows} rtl={isRtl} />
          </FadeIn>

          <FadeIn delay={0.15}>
            <Label rtl={isRtl}>{compensation.label}</Label>
            <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.3rem)", color: G.ink, marginBottom: "0.8rem" }}>
              {compensation.heading}
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.75 }}>
              {compensation.description}
            </p>
            <CompensationVisual data={compensation} rtl={isRtl} />
          </FadeIn>
        </div>
      </Sec>

      <Sec id="principles" bg={G.cream} rtl={isRtl}>
        <FadeIn>
          <Label rtl={isRtl}>{principles.label}</Label>
          <h2 style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: "clamp(1.7rem,3.5vw,2.8rem)", color: G.ink, marginBottom: "0.8rem" }}>
            {principles.heading}
          </h2>
          <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "1rem", maxWidth: 540, marginBottom: "2.5rem", lineHeight: 1.78 }}>
            {principles.description}
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1rem" }}>
          {principleItems.map((p, i) => (
            <PrincipleCard key={p.title} principle={p} delay={i * 0.07} rtl={isRtl} />
          ))}
        </div>

        <FadeIn delay={0.18}>
          <div
            style={{
              marginTop: "2rem",
              background: `linear-gradient(135deg, ${G.goldBg}, ${G.white})`,
              border: `1.5px solid ${G.goldMid}44`,
              borderRadius: 16,
              padding: "1.6rem 2rem",
              display: "flex",
              gap: "1.2rem",
              alignItems: "flex-start",
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: G.goldTint,
                border: `1.5px solid ${G.goldMid}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                flexShrink: 0,
                fontFamily: FONT_EMOJI,
              }}
            >
              ⚖️
            </div>
            <div style={{ textAlign: isRtl ? "right" : "left" }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 700, color: G.ink, marginBottom: 5, fontSize: "0.95rem" }}>
                {principles.footerTitle}
              </div>
              <p style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: G.muted, lineHeight: 1.72 }}>
                {principles.footerText}
              </p>
            </div>
          </div>
        </FadeIn>
      </Sec>

      <section
        id="join"
        style={{
          background: `linear-gradient(150deg, ${G.white} 0%, ${G.goldBg} 40%, #EEF2FF 100%)`,
          padding: "7rem 1.5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `${G.goldMid}06`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <Label rtl={isRtl}>{cta.label}</Label>
            <h2
              style={{
                fontFamily: FONT_HEAD,
                fontWeight: 900,
                fontSize: "clamp(2rem,4.5vw,3.5rem)",
                color: G.ink,
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              {cta.titleLine1}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {cta.titleLine2}
              </span>
            </h2>
            <p style={{ fontFamily: FONT_BODY, color: G.muted, fontSize: "1.02rem", marginBottom: "2.5rem", lineHeight: 1.78 }}>
              {cta.subtitle}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="#"
                style={{
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
                  color: G.white,
                  padding: "15px 38px",
                  borderRadius: 10,
                  fontFamily: FONT_BODY,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  boxShadow: `0 6px 28px ${G.goldMid}44`,
                }}
              >
                {cta.primaryCta}
              </a>
              <a
                href="#"
                style={{
                  background: G.white,
                  color: G.inkMid,
                  padding: "15px 38px",
                  borderRadius: 10,
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  border: `1.5px solid ${G.border}`,
                }}
              >
                {cta.secondaryCta}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
