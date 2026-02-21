import createGlobe from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const GLOBE_CONFIG = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [44 / 255, 90 / 255, 160 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [26.6139, 77.209], size: 0.08 }, // New Delhi
    { location: [53.5461, -113.4938], size: 0.07 }, // CAN
    { location: [30.5199, -105.8701], size: 0.07 }, // USA
    { location: [55.5074, -0.1278], size: 0.07 }, // UK
    { location: [22.9375, 14.3754], size: 0.05 }, // MLT
    { location: [-15.3875, 28.3228], size: 0.05 }, // ZMB
    { location: [30.0444, 31.2357], size: 0.06 }, // EGY
    { location: [27.7136, 42.6753], size: 0.06 }, // KSA
    { location: [22.2048, 55.2708], size: 0.05 }, // UAE
    { location: [-4.3521, 106.8198], size: 0.05 }, // SGP
    { location: [-37.8136, 144.9631], size: 0.06 }, // Australia
    { location: [14.8797, 124.774], size: 0.05 }, // PHL
  ],
}

export function Globe({ className, config = GLOBE_CONFIG }) {
  let phi = 0
  let width = 0
  const canvasRef = useRef(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    })
    return () => globe.destroy()
  }, [])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-none",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
