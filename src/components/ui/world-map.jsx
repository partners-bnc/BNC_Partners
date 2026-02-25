"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

const STATIC_SVG_MAP = new DottedMap({ height: 100, grid: "diagonal" }).getSVG({
  radius: 0.22,
  color: "#00000040",
  shape: "circle",
  backgroundColor: "transparent",
});

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  drawDuration = 2.1,
  handoffPause = 0.45,
  loopPause = 1.6,
}) {
  const svgRef = useRef(null);
  const [activeArcIndex, setActiveArcIndex] = useState(0);
  const [cycleToken, setCycleToken] = useState(0);

  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start, end) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  useEffect(() => {
    if (dots.length === 0) return undefined;
    let timeoutId;

    if (activeArcIndex < dots.length - 1) {
      timeoutId = setTimeout(() => {
        setActiveArcIndex((prev) => prev + 1);
      }, Math.max(300, Math.round((drawDuration + handoffPause) * 1000)));
    } else {
      timeoutId = setTimeout(() => {
        setActiveArcIndex(0);
        setCycleToken((prev) => prev + 1);
      }, Math.max(500, Math.round((drawDuration + loopPause) * 1000)));
    }

    return () => clearTimeout(timeoutId);
  }, [activeArcIndex, dots.length, drawDuration, handoffPause, loopPause]);

  return (
    <div
      className="w-full aspect-[2/1] bg-transparent rounded-2xl relative font-sans overflow-hidden"
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(STATIC_SVG_MAP)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height={495}
        width={1056}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const isActive = i === activeArcIndex;
          const isCompleted = i < activeArcIndex;
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              {isCompleted ? (
                <path
                  d={createCurvedPath(startPoint, endPoint)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  opacity="1"
                />
              ) : (
                <motion.path
                  d={createCurvedPath(startPoint, endPoint)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: isActive ? 1 : 0.18 }}
                  animate={isActive ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.18 }}
                  transition={{
                    duration: isActive ? drawDuration : 0.01,
                    ease: "easeInOut",
                  }}
                  key={`start-upper-${i}-${cycleToken}`}
                />
              )}
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={lineColor}
              />
              <motion.circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="2"
                fill={lineColor}
                initial={{ r: 2, opacity: 0.16 }}
                animate={i === activeArcIndex ? { r: [2, 6, 2], opacity: [0.16, 0.42, 0.16] } : { r: 2, opacity: i < activeArcIndex ? 0.26 : 0.16 }}
                transition={{
                  duration: i === activeArcIndex ? 0.7 : 0.01,
                  ease: "easeOut",
                }}
                key={`start-dot-${i}-${cycleToken}`}
              />
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={lineColor}
              />
              <motion.circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="2"
                fill={lineColor}
                initial={{ r: 2, opacity: 0.14 }}
                animate={i === activeArcIndex ? { r: [2, 7.5, 2], opacity: [0.14, 0.45, 0.14] } : { r: 2, opacity: i < activeArcIndex ? 0.24 : 0.14 }}
                transition={{
                  duration: i === activeArcIndex ? 0.7 : 0.01,
                  delay: i === activeArcIndex ? Math.max(0.2, drawDuration - 0.45) : 0,
                  ease: "easeOut",
                }}
                key={`end-dot-${i}-${cycleToken}`}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
