import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Home, Minus, Plus, MapPin, Users, ArrowUpRight, Loader2, ArrowLeft } from 'lucide-react';
import { regionOf } from '../../data/worldCountries';

/* ----------------------------------------------------------------------------
 * Partner world map: World -> Country (states) -> State (districts) -> District.
 * Data is built by scripts/build-world-map.mjs into public/maps (pre-projected
 * Miller-projection SVG paths), so this component only fetches and draws.
 * Click / tap to drill down, drag to move, pinch or Ctrl/Cmd + scroll to zoom.
 * -------------------------------------------------------------------------- */

const MAPS = '/maps';
const VW = 1000; // viewBox width; height follows the container's shape

const ISO2 = {
  IND: 'in', SAU: 'sa', USA: 'us', CAN: 'ca', GBR: 'gb', IRL: 'ie', EST: 'ee', FRA: 'fr', HUN: 'hu', CYP: 'cy',
  RUS: 'ru', SWE: 'se', DEU: 'de', NLD: 'nl', ESP: 'es', CHE: 'ch', ITA: 'it', AUT: 'at', ARE: 'ae', TUR: 'tr',
  BHR: 'bh', QAT: 'qa', SGP: 'sg', HKG: 'hk', MYS: 'my', LKA: 'lk', BGD: 'bd', BRN: 'bn', JPN: 'jp', PHL: 'ph',
  IDN: 'id', CHN: 'cn', THA: 'th', VNM: 'vn', NZL: 'nz', AUS: 'au', KEN: 'ke', UGA: 'ug', ZAF: 'za', ZMB: 'zm',
  NGA: 'ng', EGY: 'eg',
};
const NAMES = {
  USA: 'United States', GBR: 'United Kingdom', ARE: 'United Arab Emirates', RUS: 'Russia', HKG: 'Hong Kong',
  CZE: 'Czechia', TUR: 'Türkiye', KOR: 'South Korea', PRK: 'North Korea', VNM: 'Vietnam',
};
// light, friendly colour per region
const REGION_HUE = {
  'Asia and Oceania': '#6366f1',
  'Middle East': '#f59e0b',
  Europe: '#0ea5e9',
  Americas: '#a855f7',
  Africa: '#10b981',
};
const hueOf = (iso) => REGION_HUE[regionOf(ISO2[iso])] || '#64748b';
const LAND = '#d5dce1'; // reference style: soft grey land, thin dark borders
const BORDER = '#4b5563';
const flagOf = (iso) => (ISO2[iso] ? `https://flagcdn.com/w80/${ISO2[iso]}.png` : null);

// partner count -> fill strength
const strength = (n) => (n >= 3 ? 0.9 : n === 2 ? 0.72 : n === 1 ? 0.5 : 0.12);

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const cache = new Map();
const getJSON = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); }));
  return cache.get(url);
};

export default function PartnerWorldMap({ onRequest, onJoin, className = '' }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [world, setWorld] = useState(null);
  const [partners, setPartners] = useState(null);
  const [country, setCountry] = useState(null); // country file
  const [stateData, setStateData] = useState(null); // districts file
  const [hi, setHi] = useState(null); // detailed world outlines, used once zoomed in
  const [sel, setSel] = useState({ iso: null, sid: null, did: null });
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState({ w: 1000, h: 560 });
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  // details panel: always shown, on the right of the map (tablet/desktop) or below it (phones)
  const tipRef = useRef(null); // hover card, updated directly (no re-render)
  const viewRef = useRef(view);
  const animRef = useRef(0);
  const VH = (VW * size.h) / size.w;

  /* load only when the section is near the screen */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    Promise.all([getJSON(`${MAPS}/world.json`), getJSON(`${MAPS}/partners.json`)]).then(([w, p]) => { setWorld(w); setPartners(p); });
  }, [visible]);

  /* keep the viewBox the same shape as the box on screen */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width || 1000, h: e.contentRect.height || 560 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [world]);

  /* ---------- view / camera ---------- */
  // pins are circles sized in screen pixels: their radius is recomputed on every
  // zoom step (non-scaling strokes are not reliable in every browser)
  const pxUnit = useRef(1);
  pxUnit.current = VW / size.w; // viewBox units per screen pixel
  const sizePins = (k) => {
    const g = gRef.current; if (!g) return;
    for (const c of g.querySelectorAll('[data-px]')) c.setAttribute('r', (Number(c.dataset.px) * pxUnit.current) / k);
  };
  const apply = (v) => {
    viewRef.current = v;
    if (gRef.current) { gRef.current.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.k})`); sizePins(v.k); }
  };
  const commit = (v) => { apply(v); setView(v); };
  const fitBox = useCallback((b, pad = 0.1, maxK = 60000) => {
    const bw = Math.max(b[2] - b[0], 1e-4); const bh = Math.max(b[3] - b[1], 1e-4);
    const k = Math.min((VW * (1 - 2 * pad)) / bw, (VH * (1 - 2 * pad)) / bh, maxK);
    return { k, x: VW / 2 - ((b[0] + b[2]) / 2) * k, y: VH / 2 - ((b[1] + b[3]) / 2) * k };
  }, [VH]);
  const flyTo = useCallback((target, ms = 900) => {
    cancelAnimationFrame(animRef.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { commit(target); return; }
    const a = viewRef.current;
    const ca = [(VW / 2 - a.x) / a.k, (VH / 2 - a.y) / a.k];
    const cb = [(VW / 2 - target.x) / target.k, (VH / 2 - target.y) / target.k];
    const la = Math.log(a.k); const lb = Math.log(target.k);
    const t0 = performance.now();
    setMoving(true);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms); const e = ease(t);
      const k = Math.exp(la + (lb - la) * e);
      const cx = ca[0] + (cb[0] - ca[0]) * e; const cy = ca[1] + (cb[1] - ca[1]) * e;
      apply({ k, x: VW / 2 - cx * k, y: VH / 2 - cy * k });
      if (t < 1) animRef.current = requestAnimationFrame(step);
      else { commit(target); setMoving(false); }
    };
    animRef.current = requestAnimationFrame(step);
  }, [VH]);

  // the whole world, top to bottom (Miller projection keeps it short)
  const worldBox = useMemo(() => [0, 0, VW, world ? world.h : 500], [world]);
  // first frame (and on resize at world level): show the whole world
  useEffect(() => {
    if (!world) return;
    if (!sel.iso) commit(fitBox(worldBox, 0.025));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, VH]);

  /* ---------- navigation ---------- */
  const goWorld = () => { setSel({ iso: null, sid: null, did: null }); setCountry(null); setStateData(null); flyTo(fitBox(worldBox, 0.025)); };
  const goCountry = useCallback(async (iso) => {
    setLoading(true);
    if (!hi) getJSON(`${MAPS}/world-hi.json`).then((rows) => setHi(new Map(rows))).catch(() => {});
    try {
      const c = await getJSON(`${MAPS}/c/${iso}.json`);
      setCountry(c); setStateData(null); setSel({ iso, sid: null, did: null });
      flyTo(fitBox(c.focus, 0.08));
    } finally { setLoading(false); }
  }, [fitBox, flyTo, hi]);
  const goState = useCallback(async (iso, sid) => {
    const c = country?.id === iso ? country : await getJSON(`${MAPS}/c/${iso}.json`);
    const f = c.features.find((x) => x.id === sid);
    if (!f) return;
    setCountry(c); setSel({ iso, sid, did: null });
    flyTo(fitBox(f.b, 0.08));
    if (f.k) {
      setLoading(true);
      try { setStateData(await getJSON(`${MAPS}/s/${iso}/${sid}.json`)); } finally { setLoading(false); }
    } else setStateData(null);
  }, [country, fitBox, flyTo]);
  const goDistrict = (did) => {
    const f = stateData?.features.find((x) => x.id === did);
    if (!f) return;
    setSel((s) => ({ ...s, did }));
    flyTo(fitBox(f.b, 0.18));
  };
  const back = () => {
    if (sel.did) { setSel((s) => ({ ...s, did: null })); goState(sel.iso, sel.sid); }
    else if (sel.sid) goCountry(sel.iso);
    else if (sel.iso) goWorld();
  };

  /* ---------- pointer: drag, pinch, ctrl/cmd + wheel ---------- */
  const ptrs = useRef(new Map());
  const gesture = useRef(null);
  const dragged = useRef(false);
  const toView = (clientX, clientY) => {
    const r = svgRef.current.getBoundingClientRect();
    return [((clientX - r.left) / r.width) * VW, ((clientY - r.top) / r.height) * VH];
  };
  const onPointerDown = (e) => {
    ptrs.current.set(e.pointerId, [e.clientX, e.clientY]);
    dragged.current = false;
    gesture.current = { start: { ...viewRef.current }, pts: new Map(ptrs.current) };
    cancelAnimationFrame(animRef.current);
  };
  const onPointerMove = (e) => {
    if (!ptrs.current.has(e.pointerId)) {
      // hover (mouse only)
      return;
    }
    ptrs.current.set(e.pointerId, [e.clientX, e.clientY]);
    const g = gesture.current; if (!g) return;
    const now = [...ptrs.current.values()]; const was = [...g.pts.values()];
    if (now.length === 1 && was.length >= 1) {
      const [a, b] = toView(...now[0]);
      const [a0, b0] = toView(...was[0]);
      if (Math.hypot(a - a0, b - b0) > 4) dragged.current = true;
      if (dragged.current) { setMoving(true); apply({ k: g.start.k, x: g.start.x + (a - a0), y: g.start.y + (b - b0) }); }
    } else if (now.length >= 2 && was.length >= 2) {
      dragged.current = true; setMoving(true);
      const m0 = toView((was[0][0] + was[1][0]) / 2, (was[0][1] + was[1][1]) / 2);
      const m1 = toView((now[0][0] + now[1][0]) / 2, (now[0][1] + now[1][1]) / 2);
      const s = Math.hypot(now[0][0] - now[1][0], now[0][1] - now[1][1]) / Math.max(1, Math.hypot(was[0][0] - was[1][0], was[0][1] - was[1][1]));
      const k = Math.min(80000, Math.max(0.6, g.start.k * s));
      const wx = (m0[0] - g.start.x) / g.start.k; const wy = (m0[1] - g.start.y) / g.start.k;
      apply({ k, x: m1[0] - wx * k, y: m1[1] - wy * k });
    }
  };
  const onPointerUp = (e) => {
    ptrs.current.delete(e.pointerId);
    gesture.current = ptrs.current.size ? { start: { ...viewRef.current }, pts: new Map(ptrs.current) } : null;
    if (!ptrs.current.size && dragged.current) { commit(viewRef.current); setMoving(false); }
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain scroll keeps scrolling the page
      e.preventDefault();
      const [px, py] = toView(e.clientX, e.clientY);
      const v = viewRef.current;
      const k = Math.min(80000, Math.max(0.6, v.k * Math.exp(-e.deltaY * 0.01)));
      const wx = (px - v.x) / v.k; const wy = (py - v.y) / v.k;
      commit({ k, x: px - wx * k, y: py - wy * k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });
  const zoomBy = (f) => { const v = viewRef.current; const k = Math.min(80000, Math.max(0.6, v.k * f)); flyTo({ k, x: VW / 2 - ((VW / 2 - v.x) / v.k) * k, y: VH / 2 - ((VH / 2 - v.y) / v.k) * k }, 350); };
  const click = (fn) => (e) => { if (dragged.current) return; e.stopPropagation(); hideHover(); fn(); };

  /* ---------- derived data ---------- */
  const counts = partners?.counts || {};
  const cCount = (iso) => counts[iso]?.n || 0;
  const sCount = (iso, sid) => counts[iso]?.states[sid]?.n || 0;
  const dCount = (iso, sid, did) => counts[iso]?.states[sid]?.districts[did]?.n || 0;
  const nameOf = (iso, fallback) => NAMES[iso] || fallback || iso;
  const stateF = sel.sid && country ? country.features.find((f) => f.id === sel.sid) : null;
  const distF = sel.did && stateData ? stateData.features.find((f) => f.id === sel.did) : null;
  const level = sel.did ? 'district' : sel.sid ? 'state' : sel.iso ? 'country' : 'world';
  const toScreen = ([x, y]) => [((x * view.k + view.x) / VW) * size.w, ((y * view.k + view.y) / VH) * size.h];

  // world-level bubbles: one per partner country, at the average of its cities
  const bubbles = useMemo(() => {
    if (!partners) return [];
    const m = {};
    for (const p of partners.pins) { (m[p.iso] ||= { iso: p.iso, x: 0, y: 0, c: 0 }); m[p.iso].x += p.x; m[p.iso].y += p.y; m[p.iso].c += 1; }
    return Object.values(m).map((b) => ({ ...b, x: b.x / b.c, y: b.y / b.c, n: cCount(b.iso) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  // neighbours drawn over the active country (keeps borders consistent, e.g. India/China)
  const activeBox = country?.focus;
  const neighbours = useMemo(() => {
    if (!world || !activeBox || sel.iso !== 'CHN') return [];
    const [a, b, c, d] = activeBox; const mx = (c - a) * 0.6; const my = (d - b) * 0.6;
    return world.features.filter((f) => f.id !== sel.iso && f.b[2] > a - mx && f.b[0] < c + mx && f.b[3] > b - my && f.b[1] < d + my);
  }, [world, activeBox, sel.iso]);

  const showHover = (e, name, sub) => {
    const tip = tipRef.current;
    if (!tip || e.pointerType === 'touch' || ptrs.current.size) return;
    const r = tip.parentElement.getBoundingClientRect();
    tip.firstChild.textContent = name;
    tip.lastChild.textContent = sub;
    tip.style.left = `${e.clientX - r.left}px`;
    tip.style.top = `${e.clientY - r.top}px`;
    tip.style.opacity = '1';
  };
  const hideHover = () => { if (tipRef.current) tipRef.current.style.opacity = '0'; };
  const partnersLabel = (n) => (n ? `${n} partner${n > 1 ? 's' : ''}` : 'No partners yet');

  /* ---------- panel content ---------- */
  let title = 'Our global partner network';
  let subtitle = partners ? `${partners.total} partners across ${partners.countries} countries and ${partners.regions} states and regions.` : '';
  let list = [];
  if (level === 'world' && partners) {
    list = Object.keys(counts).map((iso) => ({ key: iso, label: nameOf(iso, world?.features.find((f) => f.id === iso)?.n), n: cCount(iso), flag: flagOf(iso), on: () => goCountry(iso) }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  } else if (level === 'country' && country) {
    const c = counts[sel.iso];
    title = nameOf(sel.iso, world?.features.find((f) => f.id === sel.iso)?.n);
    subtitle = `${partnersLabel(c?.n)} in ${Object.keys(c?.states || {}).length} of ${country.features.length} states and regions.`;
    list = country.features.map((f) => ({ key: f.id, label: f.n, n: sCount(sel.iso, f.id), on: () => goState(sel.iso, f.id) }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  } else if ((level === 'state' || level === 'district') && stateF) {
    const s = counts[sel.iso]?.states[sel.sid];
    title = level === 'district' && distF ? distF.n : stateF.n;
    subtitle = level === 'district' && distF
      ? `${partnersLabel(dCount(sel.iso, sel.sid, sel.did))} in this district · ${stateF.n}`
      : stateData ? `${partnersLabel(s?.n)} in ${Object.keys(s?.districts || {}).length} of ${stateData.features.length} districts.` : `${partnersLabel(s?.n)} in this region.`;
    list = (stateData?.features || []).map((f) => ({ key: f.id, label: f.n, n: dCount(sel.iso, sel.sid, f.id), on: () => goDistrict(f.id), active: f.id === sel.did }))
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label));
  }
  const cityPins = partners?.pins.filter((p) => p.iso === sel.iso && (!sel.sid || p.s === sel.sid) && (!sel.did || p.dt === sel.did)) || [];
  const crumbs = [
    { label: sel.iso ? 'Global' : 'Global Partners', on: goWorld },
    sel.iso && { label: nameOf(sel.iso, world?.features.find((f) => f.id === sel.iso)?.n), on: () => goCountry(sel.iso) },
    stateF && { label: stateF.n, on: () => goState(sel.iso, sel.sid) },
    distF && { label: distF.n },
  ].filter(Boolean);
  const requestTopic = [distF?.n, stateF?.n, sel.iso && nameOf(sel.iso)].filter(Boolean).join(', ') || 'Global';

  return (
    <div ref={wrapRef} className={`lg-pmap relative overflow-hidden md:flex md:flex-row rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_30px_60px_-40px_rgba(30,41,99,0.3)] ${className}`}>
      {/* map (left) */}
      <div className="relative bg-white md:min-w-0 md:flex-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="block h-[320px] w-full cursor-grab select-none active:cursor-grabbing md:h-[560px] lg:h-[620px]"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={(e) => { hideHover(); if (ptrs.current.size) onPointerUp(e); }}
          role="img"
          aria-label="Interactive map of our partner network"
        >
          <g ref={gRef} transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {world?.features.map((f) => {
              const n = cCount(f.id);
              const isActive = f.id === sel.iso;
              return (
                <path
                  key={f.id}
                  d={(sel.iso && hi?.get(f.id)) || f.d}
                  fill={n ? hueOf(f.id) : LAND}
                  fillOpacity={isActive && country ? 0 : n ? (sel.iso ? 0.3 : 0.6) : 1}
                  stroke={BORDER}
                  strokeOpacity={0.7}
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                  className={n ? 'lg-pmap-country cursor-pointer' : ''}
                  onClick={n ? click(() => goCountry(f.id)) : undefined}
                  onPointerMove={(e) => showHover(e, nameOf(f.id, f.n), n ? partnersLabel(n) : 'Coming soon')}
                />
              );
            })}

            {country && sel.iso && country.features.map((f) => {
              const n = sCount(sel.iso, f.id);
              const isSel = f.id === sel.sid;
              return (
                <path
                  key={f.id}
                  d={f.d}
                  fill={hueOf(sel.iso)}
                  fillOpacity={isSel && stateData ? 0 : sel.sid && !isSel ? strength(n) * 0.45 : strength(n)}
                  stroke="#fff"
                  strokeWidth={0.8}
                  vectorEffect="non-scaling-stroke"
                  className="lg-pmap-region cursor-pointer"
                  onClick={click(() => goState(sel.iso, f.id))}
                  onPointerMove={(e) => showHover(e, f.n, partnersLabel(n))}
                />
              );
            })}

            {stateData && stateData.features.map((f) => {
              const n = dCount(sel.iso, sel.sid, f.id);
              return (
                <path
                  key={f.id}
                  d={f.d}
                  fill={hueOf(sel.iso)}
                  fillOpacity={strength(n) * (sel.did && f.id !== sel.did ? 0.55 : 1)}
                  stroke="#fff"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                  className="lg-pmap-region cursor-pointer"
                  onClick={click(() => goDistrict(f.id))}
                  onPointerMove={(e) => showHover(e, f.n, partnersLabel(n))}
                />
              );
            })}

            {/* neighbouring countries on top, so every border matches the world map */}
            {neighbours.map((f) => {
              const n = cCount(f.id);
              return (
                <path
                  key={`nb-${f.id}`}
                  d={hi?.get(f.id) || f.d}
                  fill={LAND}
                  stroke={BORDER}
                  strokeOpacity={0.7}
                  strokeWidth={0.5}
                  vectorEffect="non-scaling-stroke"
                  className={n ? 'cursor-pointer' : ''}
                  onClick={n ? click(() => goCountry(f.id)) : undefined}
                  onPointerMove={(e) => showHover(e, nameOf(f.id, f.n), n ? partnersLabel(n) : 'Coming soon')}
                />
              );
            })}

            {/* selection outlines */}
            {stateF && !stateData && <path d={stateF.d} fill="none" stroke="#1d1d1f" strokeOpacity={0.55} strokeWidth={1.4} vectorEffect="non-scaling-stroke" pointerEvents="none" />}
            {distF && <path d={distF.d} fill="none" stroke="#1d1d1f" strokeWidth={2} vectorEffect="non-scaling-stroke" pointerEvents="none" />}

            {/* pins: fixed size on screen, so they get smaller relative to the map as you zoom in */}
            {level === 'world'
              ? bubbles.map((b) => {
                const px = b.n > 2 ? 8 : b.n > 1 ? 6 : 4.5;
                return <circle key={b.iso} cx={b.x} cy={b.y} data-px={px} r={(px * pxUnit.current) / view.k} fill="#dc2626" className="lg-pmap-pulse" pointerEvents="none" />;
              })
              : cityPins.map((p) => (
                <g key={p.city} pointerEvents="none">
                  <circle cx={p.x} cy={p.y} data-px={6} r={(6 * pxUnit.current) / view.k} fill="#fff" />
                  <circle cx={p.x} cy={p.y} data-px={4} r={(4 * pxUnit.current) / view.k} fill="#dc2626" />
                </g>
              ))}
          </g>
        </svg>

        {/* labels in screen space (hidden while moving) */}
        {!moving && level !== 'world' && (level !== 'country' || cityPins.length <= 8) && cityPins.map((p) => {
          const [x, y] = toScreen([p.x, p.y]);
          if (x < 0 || y < 0 || x > size.w || y > size.h) return null;
          return (
            <span key={p.city} className="pointer-events-none absolute -translate-x-1/2 -translate-y-[150%] whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#1d1d1f] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)]" style={{ left: x, top: y }}>
              {p.city}
            </span>
          );
        })}
        {!moving && level === 'world' && bubbles.filter((b) => b.n > 1).map((b) => {
          const [x, y] = toScreen([b.x, b.y]);
          return (
            <span key={b.iso} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white" style={{ left: x, top: y }}>{b.n}</span>
          );
        })}

        {/* hover card */}
        <div ref={tipRef} className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[125%] rounded-[12px] bg-white/95 px-3 py-2 text-start opacity-0 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur transition-opacity duration-150" style={{ left: 0, top: 0 }}>
          <p className="whitespace-nowrap text-[13px] font-semibold text-[#1d1d1f]" />
          <p className="whitespace-nowrap text-[12px] text-[#6e6e73]" />
        </div>

        {/* controls */}
        {/* where am I + back, always visible */}
        <div className="absolute start-3 top-3 flex max-w-[calc(100%-8rem)] items-center gap-1.5 rounded-full bg-white/90 py-1 pe-3 ps-1 text-[12.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_6px_16px_-8px_rgba(0,0,0,0.3)] backdrop-blur">
          {sel.iso ? <button type="button" onClick={back} aria-label="Back" className="grid h-7 w-7 place-items-center rounded-full hover:bg-black/5"><ArrowLeft className="h-3.5 w-3.5 flipInRtl" /></button> : <span className="grid h-7 w-7 place-items-center"><Users className="h-3.5 w-3.5 text-[#dc2626]" /></span>}
          <span className="truncate text-[#86868b]">{crumbs.map((c) => c.label).join(' › ')}</span>
        </div>
        <div className="absolute bottom-8 start-3 flex flex-col gap-1.5">
          <button type="button" onClick={() => zoomBy(1.8)} aria-label="Zoom in" className="lg-pmap-btn"><Plus className="h-4 w-4" /></button>
          <button type="button" onClick={() => zoomBy(1 / 1.8)} aria-label="Zoom out" className="lg-pmap-btn"><Minus className="h-4 w-4" /></button>
          <button type="button" onClick={goWorld} aria-label="Show the whole world" className="lg-pmap-btn"><Home className="h-4 w-4" /></button>
        </div>
        {loading || !world ? (
          <div className="absolute inset-0 grid place-items-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[12.5px] text-[#424245] shadow"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading map</span>
          </div>
        ) : null}
        <p className="pointer-events-none absolute bottom-2 start-3 text-[10.5px] text-[#86868b]">
          Tap and click to explore
        </p>
      </div>

      {/* details panel (right), always open */}
      <aside className="relative flex min-h-0 flex-col border-t border-black/[0.06] bg-[#f8f9fc] p-4 text-start md:h-[560px] md:w-[340px] md:flex-none md:border-s md:border-t-0 md:p-5 lg:h-[620px] lg:w-[360px]">
        <nav className="flex flex-wrap items-center gap-1 text-[12.5px] text-[#86868b]" aria-label="Map location">
          {crumbs.map((c, i) => (
            <React.Fragment key={c.label + i}>
              {i ? <ChevronRight className="h-3 w-3 flipInRtl" /> : null}
              {c.on && i < crumbs.length - 1 ? (
                <button type="button" onClick={c.on} className="hover:text-[#1d1d1f]">{c.label}</button>
              ) : <span className="font-semibold text-[#1d1d1f]">{c.label}</span>}
            </React.Fragment>
          ))}
        </nav>
        <div className="mt-3 flex items-start gap-3">
          {sel.iso && flagOf(sel.iso) ? <img src={flagOf(sel.iso)} alt="" className="mt-1 h-7 w-10 flex-none rounded-[5px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" /> : <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-[#1d1d1f] text-white"><Users className="h-4 w-4" /></span>}
          <div className="min-w-0">
            <h3 className="text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#1d1d1f]">{title}</h3>
            <p className="mt-1 text-[13.5px] leading-snug text-[#6e6e73]">{subtitle}</p>
          </div>
        </div>

        {level === 'world' && partners ? (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[[partners.total, 'Partners'], [partners.countries, 'Countries'], [partners.regions, 'Regions']].map(([v, l]) => (
              <div key={l} className="rounded-[14px] bg-white/80 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                <p className="text-[20px] font-bold tabular-nums text-[#dc2626]">{v}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#86868b]">{l}</p>
              </div>
            ))}
          </div>
        ) : null}

        {level === 'district' ? (
          <div className="mt-4 min-h-0 space-y-2 overflow-y-auto md:flex-1">
            {cityPins.length ? cityPins.map((p) => (
              <div key={p.city} className="flex items-center gap-2.5 rounded-[14px] bg-white/80 p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                <MapPin className="h-4 w-4 text-[#dc2626]" />
                <span className="flex-1 text-[14px] font-medium text-[#1d1d1f]">{p.city}</span>
                <span className="text-[12.5px] text-[#6e6e73]">{partnersLabel(p.n)}</span>
              </div>
            )) : <p className="rounded-[14px] bg-white/70 p-3 text-[13.5px] text-[#6e6e73]">No partner here yet. Raise a request and we will connect you with the nearest league partner.</p>}
          </div>
        ) : (
          <ul className="mt-4 max-h-[300px] min-h-0 space-y-1 overflow-y-auto pe-1 scrollbar-thin-bnc md:max-h-none md:flex-1">
            {list.map((it) => (
              <li key={it.key}>
                <button type="button" onClick={it.on} className={`flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-start transition-colors hover:bg-white ${it.active ? 'bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]' : ''}`}>
                  {it.flag ? <img src={it.flag} alt="" loading="lazy" className="h-4 w-6 flex-none rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" /> : <span className="h-2 w-2 flex-none rounded-full" style={{ background: sel.iso ? hueOf(sel.iso) : '#94a3b8', opacity: it.n ? 1 : 0.3 }} />}
                  <span className={`min-w-0 flex-1 truncate text-[13.5px] ${it.n ? 'font-medium text-[#1d1d1f]' : 'text-[#86868b]'}`}>{it.label}</span>
                  {it.n ? <span className="rounded-full bg-[#dc2626] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">{it.n}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-2 border-t border-black/[0.06] pt-4">
          <button type="button" onClick={() => onRequest?.(requestTopic)} className="lg-pbtn lg-pbtn-dark lg-pbtn-sm w-full">
            Request a partner{sel.iso ? ` in ${crumbs[crumbs.length - 1].label}` : ''}
            <span className="lg-pbtn-dot"><ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" /></span>
          </button>
          <div className="flex items-center justify-between gap-2">
            {sel.iso ? <button type="button" onClick={back} className="lg-link text-[13px]">← Back</button> : <span />}
            <button type="button" onClick={() => onJoin?.()} className="text-[13px] text-[#6e6e73] hover:text-[#dc2626]">Become a partner</button>
          </div>
          <p className="text-[10.5px] text-[#a1a1a6]">Map data: Natural Earth (India view), geoBoundaries</p>
        </div>
      </aside>
    </div>
  );
}
